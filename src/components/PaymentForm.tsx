import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, CreditCard } from "lucide-react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { Button } from "./ui/button";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  rideId?: string;
  departure_city?: string;
  arrival_city?: string;
}

const CheckoutForm = ({ amount, onSuccess, onCancel }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/payment-success`,
        },
      });

      if (paymentError) {
        toast.error(paymentError.message || "Une erreur est survenue lors du paiement");
      } else {
        toast.success("Paiement effectué avec succès");
        onSuccess();
      }
    } catch (error) {
      console.error("Erreur de paiement:", error);
      toast.error("Une erreur est survenue lors du paiement");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <PaymentElement />
      <div className="flex justify-between gap-4 mt-4">
        <Button
          variant="outline"
          onClick={onCancel}
          type="button"
          disabled={isProcessing}
        >
          Annuler
        </Button>
        <Button
          type="submit"
          disabled={!stripe || isProcessing}
          className="flex items-center gap-2"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Traitement...
            </>
          ) : (
            <>
              <CreditCard className="h-4 w-4" />
              Payer {amount}€
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export const PaymentForm = (props: PaymentFormProps) => {
  const [clientSecret, setClientSecret] = useState<string | null>(null);

  useEffect(() => {
    const initializePayment = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('create-payment-intent', {
          body: { 
            amount: props.amount,
            rideId: props.rideId,
            departure_city: props.departure_city,
            arrival_city: props.arrival_city
          }
        });

        if (error) throw error;
        setClientSecret(data.clientSecret);
      } catch (error) {
        console.error('Error:', error);
        toast.error("Une erreur est survenue lors de l'initialisation du paiement");
      }
    };

    initializePayment();
  }, [props.amount, props.rideId, props.departure_city, props.arrival_city]);

  if (!clientSecret) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4">
        <Loader2 className="h-6 w-6 animate-spin" />
        <p>Initialisation du paiement...</p>
      </div>
    );
  }

  return (
    <Elements stripe={stripePromise} options={{ clientSecret }}>
      <CheckoutForm {...props} />
    </Elements>
  );
};