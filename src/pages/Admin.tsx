import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { subDays } from "date-fns";
import { PlatformCreditsCard } from "@/components/admin/PlatformCreditsCard";
import { StatisticsCharts } from "@/components/admin/StatisticsCharts";
import { AddEmployeeForm } from "@/components/admin/AddEmployeeForm";
import { EmployeesList } from "@/components/admin/EmployeesList";
import { UsersTable } from "@/components/admin/UsersTable";

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [authorizedEmployees, setAuthorizedEmployees] = useState<any[]>([]);
  const [ridesData, setRidesData] = useState<any[]>([]);
  const [creditsData, setCreditsData] = useState<any[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);

  useEffect(() => {
    checkAdminAccess();
    fetchUsers();
    fetchAuthorizedEmployees();
    fetchStatistics();
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
      .maybeSingle();

    if (profile?.role !== "admin") {
      navigate("/");
      toast.error("Accès non autorisé");
    }
  };

  const fetchStatistics = async () => {
    const endDate = new Date();
    const startDate = subDays(endDate, 7);

    const { data: rides } = await supabase
      .rpc('get_rides_per_day', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

    const { data: credits } = await supabase
      .rpc('get_platform_credits_per_day', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

    if (rides) setRidesData(rides);
    if (credits) {
      setCreditsData(credits);
      const total = credits.reduce((acc: number, curr: any) => acc + Number(curr.credits), 0);
      setTotalCredits(total);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) throw profilesError;

      const { data: suspendedUsers, error: suspendedError } = await supabase
        .from("suspended_users")
        .select("*");

      if (suspendedError) throw suspendedError;

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
      const { error: insertError } = await supabase
        .from('suspended_users')
        .insert([{ id: userId, suspended_by: (await supabase.auth.getSession()).data.session?.user.id }]);

      if (insertError) throw insertError;

      toast.success("Utilisateur suspendu avec succès");
      fetchUsers();
    } catch (error) {
      console.error("Erreur lors de la suspension de l'utilisateur:", error);
      toast.error("Erreur lors de la suspension de l'utilisateur");
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
      
      <div className="grid gap-4 mb-8">
        <PlatformCreditsCard totalCredits={totalCredits} />
        <StatisticsCharts ridesData={ridesData} creditsData={creditsData} />
      </div>
      
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="employees">Gestion des employés</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="bg-white rounded-lg shadow">
          <UsersTable users={users} onSuspendUser={handleSuspendUser} />
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <AddEmployeeForm onEmployeeAdded={fetchAuthorizedEmployees} />
          <EmployeesList 
            employees={authorizedEmployees}
            onRemoveEmployee={handleRemoveEmployee}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;