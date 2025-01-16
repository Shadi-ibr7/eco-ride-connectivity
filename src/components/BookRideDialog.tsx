import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "./PaymentForm";
import { AlertTriangle } from "lucide-react";

const stripeKey = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
if (!stripeKey) {
  console.error("Missing Stripe public key. Please check your environment variables.");
}

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
  if (!stripePromise) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-yellow-500" />
              Configuration requise
            </DialogTitle>
            <DialogDescription className="text-base">
              La configuration de paiement n'est pas complète. Veuillez contacter l'administrateur du site.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
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