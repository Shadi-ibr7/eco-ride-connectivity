import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Car, CheckCircle } from "lucide-react";

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
      toast.success("Le trajet a démarré ! Bonne route !");
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

      toast.success("Trajet terminé ! Les passagers ont été notifiés pour laisser leur avis.");
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
    <div className="space-y-4">
      {status === "pending" && (
        <div>
          <Button
            onClick={handleStartRide}
            disabled={isUpdating}
            className="bg-ecogreen hover:bg-ecogreen-light w-full sm:w-auto flex items-center justify-center gap-2"
            size="lg"
          >
            <Car className="h-5 w-5" />
            Démarrer le trajet
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Cliquez ici quand tous les passagers sont présents et que vous êtes prêt à partir
          </p>
        </div>
      )}
      {status === "in_progress" && (
        <div>
          <Button
            onClick={handleCompleteRide}
            disabled={isUpdating}
            className="bg-ecogreen hover:bg-ecogreen-light w-full sm:w-auto flex items-center justify-center gap-2"
            size="lg"
          >
            <CheckCircle className="h-5 w-5" />
            Arrivée à destination
          </Button>
          <p className="text-sm text-gray-500 mt-2">
            Cliquez ici une fois arrivé à destination pour permettre aux passagers de laisser leur avis
          </p>
        </div>
      )}
    </div>
  );
};