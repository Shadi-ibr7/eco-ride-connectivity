import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { RideActions } from "@/components/RideActions";
import { RideStatusActions } from "@/components/RideStatusActions";
import { RideReviewForm } from "@/components/RideReviewForm";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Car, Calendar, Clock, MapPin, Users, Leaf, Euro } from "lucide-react";
import { useEffect, useState } from "react";

const RideDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, []);

  const { data: ride, isLoading, error } = useQuery({
    queryKey: ["ride", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("rides")
        .select("*")
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

    try {
      const baseUrl = window.location.origin.replace(/\/$/, '');
      
      console.log("Creating checkout session with params:", { 
        rideId: id,
        price: ride?.price,
        departure_city: ride?.departure_city,
        arrival_city: ride?.arrival_city,
        success_url: `${baseUrl}/rides/${id}?success=true`,
        cancel_url: `${baseUrl}/rides/${id}?canceled=true`
      });

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          rideId: id,
          price: ride?.price,
          departure_city: ride?.departure_city,
          arrival_city: ride?.arrival_city,
          success_url: `${baseUrl}/rides/${id}?success=true`,
          cancel_url: `${baseUrl}/rides/${id}?canceled=true`
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast({
          title: "Erreur",
          description: "Erreur lors de la création de la session de paiement",
          variant: "destructive",
        });
        return;
      }

      if (!data?.url) {
        console.error('No checkout URL returned:', data);
        toast({
          title: "Erreur",
          description: "Erreur lors de la création de la session de paiement",
          variant: "destructive",
        });
        return;
      }

      console.log("Redirecting to checkout URL:", data.url);
      window.location.href = data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la réservation",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        {isLoading ? (
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
          <Card>
            <h2 className="text-2xl font-bold">{ride.departure_city} à {ride.arrival_city}</h2>
            <p>{format(new Date(ride.departure_date), "PPPP", { locale: fr })}</p>
            <p>{ride.price} €</p>
            <Button onClick={handleBookClick}>Réserver</Button>
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
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default RideDetails;