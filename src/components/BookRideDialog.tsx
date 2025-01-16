import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { PaymentForm } from "./PaymentForm";

interface BookRideDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  rideCost: number;
  isLoading?: boolean;
  rideId?: string;
  departure_city?: string;
  arrival_city?: string;
}

export const BookRideDialog = ({
  isOpen,
  onClose,
  onConfirm,
  rideCost,
  isLoading,
  rideId,
  departure_city,
  arrival_city,
}: BookRideDialogProps) => {
  if (!rideId || !departure_city || !arrival_city) {
    console.error("Missing required ride information:", { rideId, departure_city, arrival_city });
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Réserver ce trajet</DialogTitle>
          <DialogDescription>
            Trajet de {departure_city} à {arrival_city}
          </DialogDescription>
        </DialogHeader>
        <PaymentForm
          amount={rideCost}
          onSuccess={onConfirm}
          onCancel={onClose}
          isLoading={isLoading}
          rideId={rideId}
          departure_city={departure_city}
          arrival_city={arrival_city}
        />
      </DialogContent>
    </Dialog>
  );
};