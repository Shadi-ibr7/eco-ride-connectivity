import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RideReviewFormProps {
  rideId: string;
  driverId: string;
  onSubmit?: () => void;
}

export const RideReviewForm = ({
  rideId,
  driverId,
  onSubmit,
}: RideReviewFormProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isPositive, setIsPositive] = useState<boolean | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (isPositive === null) {
      toast.error("Veuillez indiquer si le trajet s'est bien passé");
      return;
    }

    setIsSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      // First check if a review already exists
      const { data: existingReview } = await supabase
        .from("driver_reviews")
        .select("id")
        .eq("reviewer_id", user.id)
        .eq("driver_id", driverId)
        .single();

      let error;
      
      if (existingReview) {
        // Update existing review
        const { error: updateError } = await supabase
          .from("driver_reviews")
          .update({
            rating,
            comment,
            is_positive: isPositive,
          })
          .eq("id", existingReview.id);
        error = updateError;
      } else {
        // Create new review
        const { error: insertError } = await supabase
          .from("driver_reviews")
          .insert({
            driver_id: driverId,
            reviewer_id: user.id,
            rating,
            comment,
            is_positive: isPositive,
          });
        error = insertError;
      }

      if (error) throw error;

      toast.success(existingReview 
        ? "Votre avis a été mis à jour avec succès"
        : "Votre avis a été soumis avec succès"
      );
      onSubmit?.();
    } catch (error) {
      console.error("Error submitting review:", error);
      toast.error("Erreur lors de la soumission de l'avis");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2">Comment s'est passé votre trajet ?</p>
        <div className="space-x-2">
          <Button
            variant={isPositive === true ? "default" : "outline"}
            onClick={() => setIsPositive(true)}
          >
            Bien passé
          </Button>
          <Button
            variant={isPositive === false ? "default" : "outline"}
            onClick={() => setIsPositive(false)}
          >
            Mal passé
          </Button>
        </div>
      </div>

      <div>
        <p className="mb-2">Note :</p>
        <div className="flex space-x-1">
          {[1, 2, 3, 4, 5].map((value) => (
            <button
              key={value}
              onClick={() => setRating(value)}
              className={`p-1 ${
                value <= rating ? "text-yellow-500" : "text-gray-300"
              }`}
            >
              <Star className="h-6 w-6" />
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2">Commentaire :</p>
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Partagez votre expérience..."
          className="h-24"
        />
      </div>

      <Button
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0 || isPositive === null}
        className="w-full bg-ecogreen hover:bg-ecogreen-light"
      >
        {isSubmitting ? "Envoi en cours..." : "Soumettre mon avis"}
      </Button>
    </div>
  );
};