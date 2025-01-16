import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "./PaymentForm";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const stripePromise = stripeKey ? loadStripe(stripeKey) : null;

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
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Réserver ce trajet</DialogTitle>
          <DialogDescription>
            Trajet de {departure_city} à {arrival_city}
          </DialogDescription>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={rideCost}
            onSuccess={onConfirm}
            onCancel={onClose}
            isLoading={isLoading}
            rideId={rideId}
            departure_city={departure_city}
            arrival_city={arrival_city}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};