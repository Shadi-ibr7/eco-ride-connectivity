import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RideActions } from "@/components/RideActions";
import { RideStatusActions } from "@/components/RideStatusActions";
import { RideReviewForm } from "@/components/RideReviewForm";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Car, Calendar, Clock, MapPin, Users, Leaf, Euro } from "lucide-react";
import { useEffect, useState } from "react";
import { BookRideDialog } from "@/components/BookRideDialog";

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showBookDialog, setShowBookDialog] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const { data: ride, isLoading: rideLoading, error } = useQuery({
    queryKey: ["ride", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          profile:profiles(name, id)
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  const handleBookClick = async () => {
    if (!ride || !currentUser) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour réserver un trajet",
        variant: "destructive",
      });
      return;
    }

    setShowBookDialog(true);
  };

  const handleBookConfirm = async () => {
    try {
      setIsLoading(true);
      
      if (!ride) {
        toast({
          title: "Erreur",
          description: "Informations du trajet manquantes",
          variant: "destructive",
        });
        return;
      }

      const baseUrl = window.location.origin;
      const successUrl = `${baseUrl}/rides/${id}?success=true`;
      const cancelUrl = `${baseUrl}/rides/${id}?canceled=true`;
      
      console.log("Creating checkout session with params:", { 
        rideId: ride.id,
        price: ride.price,
        departure_city: ride.departure_city,
        arrival_city: ride.arrival_city,
        success_url: successUrl,
        cancel_url: cancelUrl
      });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          rideId: ride.id,
          price: ride.price,
          departure_city: ride.departure_city,
          arrival_city: ride.arrival_city,
          success_url: successUrl,
          cancel_url: cancelUrl
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la création de la session de paiement",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      if (!data?.url) {
        console.error('No checkout URL returned:', data);
        toast({
          title: "Erreur",
          description: "Erreur lors de la création de la session de paiement",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      console.log("Redirecting to checkout URL:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  // ... keep existing code (render section)

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {rideLoading ? (
          <div className="text-center">
            <p>Chargement du trajet...</p>
          </div>
        ) : error ? (
          <div className="text-center text-red-500">
            <p>Erreur lors du chargement du trajet</p>
          </div>
        ) : !ride ? (
          <div className="text-center">
            <p>Trajet non trouvé</p>
          </div>
        ) : (
          <Card className="p-6">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {ride.departure_city} → {ride.arrival_city}
                </h2>
                <p className="text-gray-600">
                  {format(new Date(ride.departure_date), "PPPP", { locale: fr })}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <span>{format(new Date(ride.departure_date), "PPPP", { locale: fr })}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-gray-500" />
                    <span>Départ à {ride.departure_time}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-gray-500" />
                    <span>{ride.departure_city} → {ride.arrival_city}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-gray-500" />
                    <span>{ride.seats_available} places disponibles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Car className="h-5 w-5 text-gray-500" />
                    <span>{ride.vehicle_brand} {ride.vehicle_model}</span>
                  </div>
                  {ride.is_electric_car && (
                    <div className="flex items-center gap-2">
                      <Leaf className="h-5 w-5 text-green-500" />
                      <span>Véhicule électrique</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Euro className="h-5 w-5 text-gray-500" />
                    <span>{ride.price}€</span>
                  </div>
                </div>
              </div>

              {ride.description && (
                <div>
                  <h3 className="font-semibold mb-2">Description</h3>
                  <p className="text-gray-600">{ride.description}</p>
                </div>
              )}

              <div className="space-y-4">
                <RideActions 
                  rideId={ride.id}
                  isDriver={currentUser?.id === ride.user_id}
                  canBook={currentUser?.id !== ride.user_id}
                  onBookClick={handleBookClick}
                />
                <RideStatusActions 
                  rideId={ride.id}
                  status={ride.status}
                  isDriver={currentUser?.id === ride.user_id}
                />
                <RideReviewForm 
                  rideId={ride.id}
                  driverId={ride.user_id}
                />
              </div>
            </div>
          </Card>
        )}
      </main>

      <BookRideDialog
        isOpen={showBookDialog}
        onClose={() => {
          setShowBookDialog(false);
          setIsLoading(false);
        }}
        onConfirm={handleBookConfirm}
        rideCost={ride?.price || 0}
        isLoading={isLoading}
        rideId={ride?.id}
        departure_city={ride?.departure_city}
        arrival_city={ride?.arrival_city}
      />

      <Footer />
    </div>
  );
};

export default RideDetails;
