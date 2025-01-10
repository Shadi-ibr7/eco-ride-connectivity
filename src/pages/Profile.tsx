import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { CreateRideForm } from "@/components/CreateRideForm";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRides, setUserRides] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    checkUser();
    loadUserRides();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      setLoading(false);
    }
  };

  const loadUserRides = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: rides, error } = await supabase
        .from("rides")
        .select("*")
        .eq("user_id", session.user.id)
        .order("departure_date", { ascending: true });

      if (error) {
        toast.error("Erreur lors du chargement des annonces");
      } else {
        setUserRides(rides || []);
      }
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    const { error } = await supabase
      .from("rides")
      .delete()
      .eq("id", rideId);

    if (error) {
      toast.error("Erreur lors de la suppression de l'annonce");
    } else {
      toast.success("Annonce supprimée avec succès");
      loadUserRides();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <div className="space-x-4">
            <Button 
              onClick={() => setShowForm(!showForm)}
              variant="outline"
            >
              {showForm ? "Voir mes annonces" : "Publier une annonce"}
            </Button>
            <Button onClick={handleLogout} variant="outline">
              Déconnexion
            </Button>
          </div>
        </div>

        {showForm ? (
          <Card>
            <CardHeader>
              <CardTitle>Publier une nouvelle annonce</CardTitle>
              <CardDescription>
                Remplissez le formulaire ci-dessous pour publier votre annonce de covoiturage
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateRideForm />
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Mes Annonces</h2>
              {userRides.length === 0 ? (
                <p className="text-muted-foreground">
                  Vous n'avez pas encore publié d'annonces.
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {userRides.map((ride) => (
                    <Card key={ride.id}>
                      <CardHeader>
                        <CardTitle className="text-lg">
                          {ride.departure_city} → {ride.arrival_city}
                        </CardTitle>
                        <CardDescription>
                          {new Date(ride.departure_date).toLocaleString("fr-FR")}
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <p className="text-muted-foreground">
                            Prix: {ride.price}€
                          </p>
                          <p className="text-muted-foreground">
                            Places disponibles: {ride.seats_available}
                          </p>
                          {ride.description && (
                            <p className="text-muted-foreground">
                              {ride.description}
                            </p>
                          )}
                          <Button
                            onClick={() => handleDeleteRide(ride.id)}
                            variant="destructive"
                            size="sm"
                            className="w-full mt-4"
                          >
                            Supprimer
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;