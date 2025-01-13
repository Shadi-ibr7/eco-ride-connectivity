import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RideStatusActionsProps {
  rideId: string;
  status: string;
  isDriver: boolean;
  onStatusChange?: () => void;
}

export const RideStatusActions = ({
  rideId,
  status,
  isDriver,
  onStatusChange,
}: RideStatusActionsProps) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const handleStartRide = async () => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from("rides")
        .update({ status: "in_progress" })
        .eq("id", rideId);

      if (error) throw error;
      toast.success("Le trajet a démarré");
      onStatusChange?.();
    } catch (error) {
      console.error("Error starting ride:", error);
      toast.error("Erreur lors du démarrage du trajet");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCompleteRide = async () => {
    setIsUpdating(true);
    try {
      const { error: updateError } = await supabase
        .from("rides")
        .update({ status: "completed" })
        .eq("id", rideId);

      if (updateError) throw updateError;

      // Send completion emails
      const { error: notifyError } = await supabase.functions.invoke(
        "notify-ride-completion",
        {
          body: { rideId },
        }
      );

      if (notifyError) {
        console.error("Error sending notifications:", notifyError);
      }

      toast.success("Le trajet est terminé");
      onStatusChange?.();
    } catch (error) {
      console.error("Error completing ride:", error);
      toast.error("Erreur lors de la finalisation du trajet");
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isDriver) return null;

  return (
    <div>
      {status === "pending" && (
        <Button
          onClick={handleStartRide}
          disabled={isUpdating}
          className="bg-ecogreen hover:bg-ecogreen-light"
        >
          Démarrer le trajet
        </Button>
      )}
      {status === "in_progress" && (
        <Button
          onClick={handleCompleteRide}
          disabled={isUpdating}
          className="bg-ecogreen hover:bg-ecogreen-light"
        >
          Arrivée à destination
        </Button>
      )}
    </div>
  );
};