import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
  const [authorizedEmployees, setAuthorizedEmployees] = useState<any[]>([]);

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
    fetchAuthorizedEmployees();
  }, []);

  const checkAdminAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/admin/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();

    if (profile?.role !== "admin") {
      navigate("/");
      toast.error("Accès non autorisé");
    }
  };

  const fetchUsers = async () => {
    try {
      // First, fetch all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      // Then, fetch suspended users separately
      const { data: suspendedUsers, error: suspendedError } = await supabase
        .from("suspended_users")
        .select("*");

      if (suspendedError) throw suspendedError;

      // Combine the data
      const combinedUsers = profiles?.map(profile => ({
        ...profile,
        suspended_users: suspendedUsers?.filter(su => su.id === profile.id) || []
      }));

      setUsers(combinedUsers || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs:", error);
      toast.error("Erreur lors de la récupération des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  const fetchAuthorizedEmployees = async () => {
    const { data, error } = await supabase
      .from("authorized_employees")
      .select("*");

    if (error) {
      console.error("Erreur lors de la récupération des employés autorisés:", error);
      toast.error("Erreur lors de la récupération des employés autorisés");
      return;
    }

    setAuthorizedEmployees(data || []);
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from("suspended_users")
        .insert([{ id: userId }]);

      if (error) throw error;
      toast.success("Utilisateur suspendu avec succès");
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suspension de l'utilisateur:", error);
      toast.error("Erreur lors de la suspension de l'utilisateur");
    }
  };

  const handleAddEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmployeeEmail) {
      toast.error("Veuillez entrer une adresse email");
      return;
    }

    try {
      const { error } = await supabase
        .from("authorized_employees")
        .insert([{ email: newEmployeeEmail }]);

      if (error) throw error;

      toast.success("Employé autorisé ajouté avec succès");
      setNewEmployeeEmail("");
      fetchAuthorizedEmployees();
    } catch (error) {
      console.error("Erreur lors de l'ajout de l'employé:", error);
      toast.error("Erreur lors de l'ajout de l'employé");
    }
  };

  const handleRemoveEmployee = async (email: string) => {
    try {
      const { error } = await supabase
        .from("authorized_employees")
        .delete()
        .eq("email", email);

      if (error) throw error;

      toast.success("Employé retiré avec succès");
      fetchAuthorizedEmployees();
    } catch (error) {
      console.error("Erreur lors de la suppression de l'employé:", error);
      toast.error("Erreur lors de la suppression de l'employé");
    }
  };

  if (loading) {
    return <div className="p-8">Chargement...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Tableau de bord administrateur</h1>
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="employees">Gestion des employés</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="bg-white rounded-lg shadow">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Crédits</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-mono">{user.id}</TableCell>
                  <TableCell>{user.name || "Non défini"}</TableCell>
                  <TableCell>{user.credits}</TableCell>
                  <TableCell>{user.role || "Non défini"}</TableCell>
                  <TableCell>
                    {user.suspended_users?.[0] ? (
                      <span className="text-red-500">Suspendu</span>
                    ) : (
                      <span className="text-green-500">Actif</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {!user.suspended_users?.[0] && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleSuspendUser(user.id)}
                      >
                        Suspendre
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Ajouter un employé autorisé</h2>
            <form onSubmit={handleAddEmployee} className="flex gap-4">
              <Input
                type="email"
                placeholder="Email de l'employé"
                value={newEmployeeEmail}
                onChange={(e) => setNewEmployeeEmail(e.target.value)}
                className="flex-1"
              />
              <Button type="submit">Ajouter</Button>
            </form>
          </div>

          <div className="bg-white rounded-lg shadow">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Date d'ajout</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {authorizedEmployees.map((employee) => (
                  <TableRow key={employee.email}>
                    <TableCell>{employee.email}</TableCell>
                    <TableCell>{new Date(employee.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveEmployee(employee.email)}
                      >
                        Retirer
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;