import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Navbar } from "@/components/Navbar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown } from "lucide-react";

const Employee = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [pendingReviews, setPendingReviews] = useState<any[]>([]);
  const [problematicRides, setProblematicRides] = useState<any[]>([]);

  useEffect(() => {
    checkUser();
    loadData();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/employee/auth");
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profile || profile.role !== "employee") {
      navigate("/employee/auth");
      toast.error("Accès non autorisé");
    } else {
      setLoading(false);
    }
  };

  const loadData = async () => {
    // Charger les avis en attente
    const { data: reviews, error: reviewsError } = await supabase
      .from("driver_reviews")
      .select(`
        *,
        reviewer:profiles!reviewer_id(name),
        driver:profiles!driver_id(name)
      `)
      .eq("status", "pending");

    if (reviewsError) {
      console.error("Error loading reviews:", reviewsError);
      toast.error("Erreur lors du chargement des avis");
    } else {
      setPendingReviews(reviews || []);
    }

    // Charger les trajets problématiques
    const { data: rides, error: ridesError } = await supabase
      .from("problematic_rides")
      .select("*")
      .not("is_positive", "is", null);

    if (ridesError) {
      console.error("Error loading problematic rides:", ridesError);
      toast.error("Erreur lors du chargement des trajets problématiques");
    } else {
      setProblematicRides(rides || []);
    }
  };

  const handleReviewAction = async (reviewId: string, status: 'approved' | 'rejected') => {
    try {
      const { error } = await supabase
        .from("driver_reviews")
        .update({ status })
        .eq("id", reviewId);

      if (error) throw error;

      toast.success(`Avis ${status === 'approved' ? 'approuvé' : 'rejeté'} avec succès`);
      loadData(); // Recharger les données
    } catch (error) {
      console.error("Error updating review:", error);
      toast.error("Erreur lors de la mise à jour de l'avis");
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

        {/* Avis en attente */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Avis en attente de validation</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead>Auteur</TableHead>
                  <TableHead>Note</TableHead>
                  <TableHead>Commentaire</TableHead>
                  <TableHead>Expérience</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>{review.driver?.name || "Anonyme"}</TableCell>
                    <TableCell>{review.reviewer?.name || "Anonyme"}</TableCell>
                    <TableCell>{review.rating}/5</TableCell>
                    <TableCell>{review.comment || "-"}</TableCell>
                    <TableCell>
                      {review.is_positive ? (
                        <Badge className="bg-green-500">Positive</Badge>
                      ) : (
                        <Badge className="bg-red-500">Négative</Badge>
                      )}
                    </TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        className="bg-green-500 hover:bg-green-600"
                        onClick={() => handleReviewAction(review.id, 'approved')}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleReviewAction(review.id, 'rejected')}
                      >
                        <ThumbsDown className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {pendingReviews.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Aucun avis en attente
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Trajets problématiques */}
        <Card>
          <CardHeader>
            <CardTitle>Trajets problématiques</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID Trajet</TableHead>
                  <TableHead>Chauffeur</TableHead>
                  <TableHead>Passager</TableHead>
                  <TableHead>Trajet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Commentaire</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {problematicRides.map((ride) => (
                  <TableRow key={ride.ride_id}>
                    <TableCell className="font-mono">
                      {ride.ride_id?.slice(0, 8)}...
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{ride.driver_name || "Anonyme"}</div>
                        <div className="text-sm text-gray-500">{ride.driver_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>{ride.passenger_name || "Anonyme"}</div>
                        <div className="text-sm text-gray-500">{ride.passenger_email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {ride.departure_city} → {ride.arrival_city}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div>
                          {ride.departure_date && format(new Date(ride.departure_date), "Pp", { locale: fr })}
                        </div>
                        <div className="text-sm text-gray-500">
                          {ride.arrival_time && format(new Date(ride.arrival_time), "Pp", { locale: fr })}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{ride.review_comment || "-"}</TableCell>
                  </TableRow>
                ))}
                {problematicRides.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center">
                      Aucun trajet problématique
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Employee;