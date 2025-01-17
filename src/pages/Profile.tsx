import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import { CreateRideForm } from "@/components/CreateRideForm";
import { EditRideForm } from "@/components/EditRideForm";
import { RoleSelector } from "@/components/RoleSelector";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "@/integrations/supabase/types";
import { UserHeader } from "@/components/profile/UserHeader";
import { UserRides } from "@/components/profile/UserRides";
import { PreferencesSection } from "@/components/profile/PreferencesSection";

type UserRole = Database['public']['Enums']['user_role'];

const Profile = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userRides, setUserRides] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingRide, setEditingRide] = useState<any>(null);
  const [userRole, setUserRole] = useState<UserRole | null>(null);

  useEffect(() => {
    checkUser();
    loadUserRides();
    loadUserRole();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    } else {
      setLoading(false);
    }
  };

  const loadUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .maybeSingle();

      if (profile) {
        setUserRole(profile.role);
      }
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

  const handleRoleChange = (newRole: UserRole) => {
    setUserRole(newRole);
    if (newRole === 'employee') {
      navigate('/employee');
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  const isDriver = userRole === "driver" || userRole === "both";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <UserHeader
          onLogout={handleLogout}
          showForm={showForm}
          setShowForm={setShowForm}
          isDriver={isDriver}
        />

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Rôle</CardTitle>
              <CardDescription>
                Choisissez votre rôle sur la plateforme
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RoleSelector currentRole={userRole} onRoleChange={handleRoleChange} />
            </CardContent>
          </Card>

          <PreferencesSection isDriver={isDriver} />

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
            <UserRides
              rides={userRides}
              onEdit={setEditingRide}
              onDelete={handleDeleteRide}
            />
          )}

          {editingRide && (
            <EditRideForm
              ride={editingRide}
              isOpen={!!editingRide}
              onClose={() => setEditingRide(null)}
              onSuccess={loadUserRides}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;