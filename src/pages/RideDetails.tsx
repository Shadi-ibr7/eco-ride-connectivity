import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Star, User, Calendar, Clock, Zap, Car } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useState } from "react";
import { BookRideDialog } from "@/components/BookRideDialog";
import { RideStatusActions } from "@/components/RideStatusActions";
import { RideReviewForm } from "@/components/RideReviewForm";

type Review = {
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer: {
    name: string | null;
  } | null;
};

type RideDetails = {
  id: string;
  user_id: string;
  departure_city: string;
  arrival_city: string;
  departure_date: string;
  arrival_time: string;
  price: number;
  seats_available: number;
  vehicle_brand: string | null;
  vehicle_model: string | null;
  is_electric_car: boolean;
  driver_preferences: string[] | null;
  profile: {
    name: string | null;
  } | null;
  driver_reviews: Review[];
  status: string;
};

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showBookingDialog, setShowBookingDialog] = useState(false);
  const [userCredits, setUserCredits] = useState<number | null>(null);

  // Fetch ride details and user session
  const { data: ride, isLoading: isLoadingRide } = useQuery({
    queryKey: ["ride", id],
    queryFn: async () => {
      if (!id) throw new Error("No ride ID provided");

      const [rideResponse, reviewsResponse] = await Promise.all([
        supabase
          .from("rides")
          .select(`
            *,
            profile:profiles(name)
          `)
          .eq("id", id)
          .single(),
        supabase
          .from("driver_reviews")
          .select(`
            rating,
            comment,
            created_at,
            reviewer:profiles!reviewer_id(name)
          `)
          .eq("driver_id", id)
      ]);

      if (rideResponse.error) throw rideResponse.error;

      return {
        ...rideResponse.data,
        driver_reviews: reviewsResponse.data || []
      } as RideDetails;
    },
  });

  // Check user session and credits
  const { data: session } = useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("credits")
          .eq("id", session.user.id)
          .single();
        
        if (profile) {
          setUserCredits(profile.credits);
        }
      }
      return session;
    },
  });

  // Book ride mutation
  const bookRideMutation = useMutation({
    mutationFn: async () => {
      if (!session?.user || !ride) throw new Error("Not authenticated");

      const { error: bookingError } = await supabase
        .from("ride_bookings")
        .insert({
          ride_id: ride.id,
          passenger_id: session.user.id,
        });

      if (bookingError) throw bookingError;

      // Update user credits
      const { error: creditsError } = await supabase
        .from("profiles")
        .update({ credits: (userCredits || 0) - ride.price })
        .eq("id", session.user.id);

      if (creditsError) throw creditsError;

      // Update available seats
      const { error: seatsError } = await supabase
        .from("rides")
        .update({ seats_available: ride.seats_available - 1 })
        .eq("id", ride.id);

      if (seatsError) throw seatsError;
    },
    onSuccess: () => {
      toast.success("Réservation confirmée !");
      queryClient.invalidateQueries({ queryKey: ["ride", id] });
      setShowBookingDialog(false);
    },
    onError: (error) => {
      console.error("Booking error:", error);
      toast.error("Erreur lors de la réservation");
    },
  });

  const handleBookClick = () => {
    if (!session) {
      navigate("/auth");
      return;
    }

    if (!userCredits || userCredits < (ride?.price || 0)) {
      toast.error("Vous n'avez pas assez de crédits");
      return;
    }

    setShowBookingDialog(true);
  };

  const handleBookingConfirm = () => {
    bookRideMutation.mutate();
  };

  if (isLoadingRide) {
    return <div>Chargement...</div>;
  }

  if (!ride) {
    return <div>Trajet non trouvé</div>;
  }

  const averageRating = ride.driver_reviews?.length
    ? ride.driver_reviews.reduce((acc, review) => acc + review.rating, 0) /
      ride.driver_reviews.length
    : null;

  const canBook = ride.seats_available > 0 && (!session?.user || (userCredits && userCredits >= ride.price));

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center space-x-4 mb-6">
              <Avatar className="h-16 w-16">
                <User className="h-10 w-10" />
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{ride.profile?.name || "Anonyme"}</h2>
                {averageRating && (
                  <div className="flex items-center text-yellow-500">
                    <Star className="h-5 w-5 mr-1" />
                    <span>{averageRating.toFixed(1)}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Journey Details */}
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-2 text-gray-600">
                <Calendar className="h-5 w-5" />
                <span>
                  {format(new Date(ride.departure_date), "d MMMM yyyy", { locale: fr })}
                </span>
                <Clock className="h-5 w-5 ml-4" />
                <span>
                  {format(new Date(ride.departure_date), "HH:mm")} - {format(new Date(ride.arrival_time), "HH:mm")}
                </span>
              </div>
              
              <div className="text-xl">
                <span className="font-medium">{ride.departure_city}</span>
                <span className="mx-3">→</span>
                <span className="font-medium">{ride.arrival_city}</span>
              </div>

              <div className="flex items-center space-x-6">
                <div className="text-2xl font-bold">{ride.price}€</div>
                <div className="text-gray-600">
                  {ride.seats_available} place{ride.seats_available > 1 ? 's' : ''} disponible{ride.seats_available > 1 ? 's' : ''}
                </div>
              </div>

              {/* Booking Button */}
              {canBook && (
                <Button
                  className="w-full md:w-auto bg-ecogreen hover:bg-ecogreen-light mt-4"
                  onClick={handleBookClick}
                  disabled={bookRideMutation.isPending}
                >
                  {bookRideMutation.isPending ? "Réservation en cours..." : "Participer au trajet"}
                </Button>
              )}
              {!canBook && ride.seats_available === 0 && (
                <p className="text-red-500 mt-4">
                  Ce trajet est complet
                </p>
              )}
            </div>

            {/* Vehicle Details */}
            <div className="space-y-4 mb-6">
              <h3 className="text-lg font-semibold">Véhicule</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center space-x-2">
                  <Car className="h-5 w-5 text-gray-500" />
                  <span>{ride.vehicle_brand} {ride.vehicle_model}</span>
                </div>
                {ride.is_electric_car && (
                  <div className="flex items-center space-x-2 text-green-600">
                    <Zap className="h-5 w-5" />
                    <span>Véhicule électrique</span>
                  </div>
                )}
              </div>
            </div>

            {/* Driver Preferences */}
            {ride.driver_preferences && ride.driver_preferences.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4 mb-6">
                  <h3 className="text-lg font-semibold">Préférences du conducteur</h3>
                  <div className="flex flex-wrap gap-2">
                    {ride.driver_preferences.map((preference, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-gray-100 rounded-full text-sm"
                      >
                        {preference}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Reviews */}
            {ride.driver_reviews && ride.driver_reviews.length > 0 && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Avis sur le conducteur</h3>
                  <div className="space-y-4">
                    {ride.driver_reviews.map((review, index) => (
                      <div key={index} className="border-b pb-4 last:border-b-0">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{review.reviewer?.name || "Anonyme"}</span>
                            <div className="flex items-center text-yellow-500">
                              <Star className="h-4 w-4" />
                              <span className="ml-1">{review.rating}</span>
                            </div>
                          </div>
                          <span className="text-sm text-gray-500">
                            {format(new Date(review.created_at), "d MMMM yyyy", { locale: fr })}
                          </span>
                        </div>
                        {review.comment && (
                          <p className="text-gray-600">{review.comment}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Add RideStatusActions component */}
            {ride && session?.user && (
              <div className="mt-6">
                <RideStatusActions
                  rideId={ride.id}
                  status={ride.status}
                  isDriver={session.user.id === ride.user_id}
                  onStatusChange={() => queryClient.invalidateQueries({ queryKey: ["ride", id] })}
                />
              </div>
            )}

            {/* Add RideReviewForm for completed rides */}
            {ride?.status === "completed" && session?.user && ride.user_id !== session.user.id && (
              <div className="mt-8">
                <h3 className="text-lg font-semibold mb-4">Donnez votre avis</h3>
                <RideReviewForm
                  rideId={ride.id}
                  driverId={ride.user_id}
                  onSubmit={() => queryClient.invalidateQueries({ queryKey: ["ride", id] })}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <BookRideDialog
        isOpen={showBookingDialog}
        onClose={() => setShowBookingDialog(false)}
        onConfirm={handleBookingConfirm}
        rideCost={ride.price}
      />

      <Footer />
    </div>
  );
};

export default RideDetails;