import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface CancelRideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string;
  onSuccess?: () => void;
}

export function CancelRideDialog({
  isOpen,
  onClose,
  rideId,
  onSuccess,
}: CancelRideDialogProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      // Update ride status to cancelled
      const { error: updateError } = await supabase
        .from("rides")
        .update({ status: "cancelled" })
        .eq("id", rideId);

      if (updateError) throw updateError;

      // Get ride details for notification
      const { data: ride } = await supabase
        .from("rides")
        .select(`
          *,
          profile:profiles(name, id)
        `)
        .eq("id", rideId)
        .single();

      if (!ride) throw new Error("Ride not found");

      // Call the Edge Function to handle notifications and refunds
      const { error: functionError } = await supabase.functions.invoke(
        "notify-ride-cancellation",
        {
          body: { rideId },
        }
      );

      if (functionError) throw functionError;

      toast.success("Trajet annulé avec succès");
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error("Error cancelling ride:", error);
      toast.error("Erreur lors de l'annulation du trajet");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Annuler le trajet</DialogTitle>
          <DialogDescription>
            Êtes-vous sûr de vouloir annuler ce trajet ? Cette action est
            irréversible.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={handleCancel}
            disabled={isLoading}
          >
            {isLoading ? "Annulation..." : "Confirmer l'annulation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}