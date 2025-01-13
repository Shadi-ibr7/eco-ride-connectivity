import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const Employee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [reviews, setReviews] = useState<any[]>([]);
  const [problematicRides, setProblematicRides] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
    loadReviews();
    loadProblematicRides();
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
      .single();

    if (profile?.role !== "employee") {
      navigate("/");
      toast.error("Accès non autorisé");
      return;
    }

    setLoading(false);
  };

  const loadReviews = async () => {
    const { data, error } = await supabase
      .from("driver_reviews")
      .select(`
        *,
        reviewer:profiles!driver_reviews_reviewer_id_fkey(name),
        driver:profiles!driver_reviews_driver_id_fkey(name)
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erreur lors du chargement des avis");
    } else {
      setReviews(data || []);
    }
  };

  const loadProblematicRides = async () => {
    const { data, error } = await supabase
      .from("problematic_rides")
      .select("*");

    if (error) {
      toast.error("Erreur lors du chargement des trajets problématiques");
    } else {
      setProblematicRides(data || []);
    }
  };

  const handleApproveReview = async (reviewId: string) => {
    const { error } = await supabase
      .from("driver_reviews")
      .update({ status: "approved" })
      .eq("id", reviewId);

    if (error) {
      toast.error("Erreur lors de l'approbation de l'avis");
    } else {
      toast.success("Avis approuvé avec succès");
      loadReviews();
    }
  };

  const handleRejectReview = async (reviewId: string) => {
    const { error } = await supabase
      .from("driver_reviews")
      .update({ status: "rejected" })
      .eq("id", reviewId);

    if (error) {
      toast.error("Erreur lors du rejet de l'avis");
    } else {
      toast.success("Avis rejeté avec succès");
      loadReviews();
    }
  };

  if (loading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-8">Interface Employé</h1>

        <Tabs defaultValue="reviews" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reviews">Avis à modérer</TabsTrigger>
            <TabsTrigger value="problematic">Trajets problématiques</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Avis à modérer</CardTitle>
                <CardDescription>
                  Gérez les avis des utilisateurs sur les conducteurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Conducteur</TableHead>
                      <TableHead>Évaluateur</TableHead>
                      <TableHead>Note</TableHead>
                      <TableHead>Commentaire</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell>
                          {new Date(review.created_at).toLocaleDateString()}
                        </TableCell>
                        <TableCell>{review.driver?.name}</TableCell>
                        <TableCell>{review.reviewer?.name}</TableCell>
                        <TableCell>{review.rating}/5</TableCell>
                        <TableCell>{review.comment}</TableCell>
                        <TableCell>{review.status}</TableCell>
                        <TableCell>
                          {review.status === "pending" && (
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleApproveReview(review.id)}
                              >
                                <CheckCircle className="h-4 w-4 mr-1" />
                                Approuver
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleRejectReview(review.id)}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Rejeter
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="problematic">
            <Card>
              <CardHeader>
                <CardTitle>Trajets problématiques</CardTitle>
                <CardDescription>
                  Consultez les trajets ayant reçu des avis négatifs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Trajet</TableHead>
                      <TableHead>Conducteur</TableHead>
                      <TableHead>Passager</TableHead>
                      <TableHead>Commentaire</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {problematicRides.map((ride) => (
                      <TableRow key={ride.ride_id}>
                        <TableCell>
                          {new Date(ride.departure_date).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          {ride.departure_city} → {ride.arrival_city}
                        </TableCell>
                        <TableCell>{ride.driver_name}</TableCell>
                        <TableCell>{ride.passenger_name}</TableCell>
                        <TableCell>{ride.review_comment}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Employee;