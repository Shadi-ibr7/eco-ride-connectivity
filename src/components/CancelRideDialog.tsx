import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Database } from "@/integrations/supabase/types";

interface CancelRideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  rideId: string | undefined;
  isDriver: boolean;
  onSuccess?: () => void;
}

type Rides = Database['public']['Tables']['rides']['Row'];
type RideBookings = Database['public']['Tables']['ride_bookings']['Row'];

export const CancelRideDialog = ({
  isOpen,
  onClose,
  rideId,
  isDriver,
  onSuccess,
}: CancelRideDialogProps) => {
  const handleCancel = async () => {
    try {
      if (!rideId) {
        toast.error("ID du trajet manquant");
        return;
      }

      if (isDriver) {
        // Get ride details first
        const { data: ride } = await supabase
          .from('rides')
          .select(`
            id,
            price,
            seats_available
          `)
          .eq('id', rideId)
          .maybeSingle();

        if (!ride) {
          throw new Error("Ride not found");
        }

        // Get all bookings for this ride
        const { data: bookings } = await supabase
          .from('ride_bookings')
          .select('passenger_id')
          .eq('ride_id', rideId);

        // Refund credits to passengers
        if (bookings) {
          for (const booking of bookings) {
            await supabase.rpc('refund_ride_credits', {
              user_id: booking.passenger_id,
              amount: ride.price,
            });
          }
        }

        // Delete all bookings
        await supabase
          .from('ride_bookings')
          .delete()
          .eq('ride_id', rideId);

        // Delete the ride
        await supabase
          .from('rides')
          .delete()
          .eq('id', rideId);

        // Notify passengers
        const response = await fetch("/api/notify-ride-cancellation", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rideId }),
        });

        if (!response.ok) {
          console.error("Failed to send cancellation notifications");
        }
      } else {
        // Get the booking and ride details
        const { data: booking } = await supabase
          .from('ride_bookings')
          .select(`
            *,
            ride:rides (
              id,
              price,
              seats_available
            )
          `)
          .eq('ride_id', rideId)
          .maybeSingle();

        if (booking) {
          // Delete the booking
          await supabase
            .from('ride_bookings')
            .delete()
            .eq('ride_id', rideId);

          // Update available seats
          await supabase
            .from('rides')
            .update({ seats_available: (booking.ride as Rides).seats_available + 1 })
            .eq('id', rideId);

          // Refund credits to the passenger
          await supabase.rpc('refund_ride_credits', {
            user_id: booking.passenger_id,
            amount: (booking.ride as Rides).price,
          });
        }
      }

      toast.success(
        isDriver
          ? "Le covoiturage a été annulé et les passagers ont été notifiés"
          : "Votre réservation a été annulée et vos crédits ont été remboursés"
      );
      onSuccess?.();
    } catch (error) {
      console.error("Error cancelling ride:", error);
      toast.error("Une erreur est survenue lors de l'annulation");
    } finally {
      onClose();
    }
  };

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Confirmer l'annulation</AlertDialogTitle>
          <AlertDialogDescription>
            {isDriver
              ? "Êtes-vous sûr de vouloir annuler ce covoiturage ? Tous les passagers seront notifiés et remboursés."
              : "Êtes-vous sûr de vouloir annuler votre participation à ce covoiturage ? Vos crédits seront remboursés."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel}>Confirmer</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};