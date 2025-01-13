import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ChartContainer, ChartTooltip } from "@/components/ui/chart";

const Employee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [ridesData, setRidesData] = useState<any[]>([]);
  const [creditsData, setCreditsData] = useState<any[]>([]);
  const [totalCredits, setTotalCredits] = useState(0);

  useEffect(() => {
    checkUser();
    loadData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profile || profile.role !== "employee") {
      navigate("/");
      toast.error("Accès non autorisé");
    } else {
      setLoading(false);
    }
  };

  const loadData = async () => {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();

    // Charger les données des trajets par jour
    const { data: rides } = await supabase
      .rpc('get_rides_per_day', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
    
    if (rides) {
      setRidesData(rides.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(),
        count: item.count
      })));
    }

    // Charger les données des crédits par jour
    const { data: credits } = await supabase
      .rpc('get_platform_credits_per_day', {
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });

    if (credits) {
      const totalCredits = credits.reduce((acc: number, curr: any) => acc + Number(curr.credits), 0);
      setTotalCredits(totalCredits);
      
      setCreditsData(credits.map((item: any) => ({
        date: new Date(item.date).toLocaleDateString(),
        credits: item.credits
      })));
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Tableau de bord employé</h1>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Trajets par jour</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={ridesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Crédits par jour</CardTitle>
            </CardHeader>
            <CardContent className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={creditsData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="credits" stroke="#82ca9d" fill="#82ca9d" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Total des crédits de la plateforme</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">{totalCredits} crédits</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Employee;