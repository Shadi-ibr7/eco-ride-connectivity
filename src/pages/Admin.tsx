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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer } from "recharts";
import { subDays, format } from "date-fns";
import { fr } from "date-fns/locale";

const chartConfig = {
  rides: {
    label: "Covoiturages",
    theme: {
      light: "#3b82f6",
      dark: "#60a5fa",
    },
  },
  credits: {
    label: "Crédits",
    theme: {
      light: "#22c55e",
      dark: "#4ade80",
    },
  },
};

const Admin = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [newEmployeeEmail, setNewEmployeeEmail] = useState("");
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

    // Fetch rides per day
    const { data: rides } = await supabase
      .rpc('get_rides_per_day', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

    // Fetch credits per day
    const { data: credits } = await supabase
      .rpc('get_platform_credits_per_day', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

    if (rides) setRidesData(rides);
    if (credits) {
      setCreditsData(credits);
      // Calculate total credits
      const total = credits.reduce((acc: number, curr: any) => acc + Number(curr.credits), 0);
      setTotalCredits(total);
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
      
      <div className="grid gap-4 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Total des crédits de la plateforme</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits} crédits</div>
          </CardContent>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Covoiturages par jour</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={ridesData}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: fr })}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      stroke="#2563eb"
                      fill="#3b82f6"
                      name="rides"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crédits gagnés par jour</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ChartContainer config={chartConfig}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={creditsData}>
                    <XAxis
                      dataKey="date"
                      tickFormatter={(date) => format(new Date(date), 'dd/MM', { locale: fr })}
                    />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Area
                      type="monotone"
                      dataKey="credits"
                      stroke="#16a34a"
                      fill="#22c55e"
                      name="credits"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
      
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