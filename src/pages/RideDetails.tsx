import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, User, Calendar, Clock, Zap, Car } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";

const RideDetails = () => {
  const { id } = useParams();

  const { data: ride, isLoading } = useQuery({
    queryKey: ["ride", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rides")
        .select(`
          *,
          profile: profiles(name),
          driver_reviews: driver_reviews(
            rating,
            comment,
            created_at,
            reviewer: profiles(name)
          )
        `)
        .eq("id", id)
        .single();

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!ride) {
    return <div>Trajet non trouvé</div>;
  }

  const averageRating = ride.driver_reviews?.length
    ? ride.driver_reviews.reduce((acc: number, review: any) => acc + review.rating, 0) /
      ride.driver_reviews.length
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <Card className="mb-8">
          <CardContent className="p-6">
            {/* Driver Info */}
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
            </div>

            <Separator className="my-6" />

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
                    {ride.driver_preferences.map((preference: string, index: number) => (
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
                    {ride.driver_reviews.map((review: any) => (
                      <div key={review.id} className="border-b pb-4 last:border-b-0">
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
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default RideDetails;