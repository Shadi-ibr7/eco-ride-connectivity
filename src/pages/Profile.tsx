import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRides, setUserRides] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
    loadUserRides();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate('/auth');
    } else {
      setLoading(false);
    }
  };

  const loadUserRides = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: rides, error } = await supabase
        .from('rides')
        .select('*')
        .eq('user_id', session.user.id);

      if (error) {
        toast.error("Erreur lors du chargement des annonces");
      } else {
        setUserRides(rides || []);
      }
    }
  };

  const handleDeleteRide = async (rideId: string) => {
    const { error } = await supabase
      .from('rides')
      .delete()
      .eq('id', rideId);

    if (error) {
      toast.error("Erreur lors de la suppression de l'annonce");
    } else {
      toast.success("Annonce supprimée avec succès");
      loadUserRides();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/auth');
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">Mon Profil</h1>
          <Button onClick={handleLogout} variant="outline">
            Déconnexion
          </Button>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Mes Annonces</h2>
            {userRides.length === 0 ? (
              <p>Vous n'avez pas encore publié d'annonces.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {userRides.map((ride) => (
                  <div
                    key={ride.id}
                    className="p-4 border rounded-lg shadow-sm"
                  >
                    <h3 className="font-semibold">
                      {ride.departure_city} → {ride.arrival_city}
                    </h3>
                    <p className="text-gray-600">
                      {new Date(ride.departure_date).toLocaleDateString()}
                    </p>
                    <p className="text-gray-600">{ride.price}€</p>
                    <p className="text-gray-600">
                      {ride.seats_available} place(s) disponible(s)
                    </p>
                    <div className="mt-4">
                      <Button
                        onClick={() => handleDeleteRide(ride.id)}
                        variant="destructive"
                        size="sm"
                      >
                        Supprimer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;