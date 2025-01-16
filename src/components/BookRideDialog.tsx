import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { PaymentForm } from "./PaymentForm";

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
}

export const BookRideDialog = ({
  isOpen,
  onClose,
  onConfirm,
  rideCost,
  isLoading,
}: BookRideDialogProps) => {
  if (!stripePromise) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Error</DialogTitle>
          </DialogHeader>
          <p className="text-red-500">
            Payment system is not properly configured. Please try again later.
          </p>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Book this ride</DialogTitle>
        </DialogHeader>
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={rideCost}
            onSuccess={onConfirm}
            onCancel={onClose}
            isLoading={isLoading}
          />
        </Elements>
      </DialogContent>
    </Dialog>
  );
};