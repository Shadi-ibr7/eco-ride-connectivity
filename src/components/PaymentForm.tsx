import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  rideId?: string;
  departure_city?: string;
  arrival_city?: string;
}

export const PaymentForm = ({ 
  amount, 
  onSuccess, 
  onCancel, 
  isLoading,
  rideId,
  departure_city,
  arrival_city 
}: PaymentFormProps) => {
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async () => {
    try {
      setProcessing(true);

      // Ensure amount is a valid number
      const price = Number(amount);
      if (isNaN(price) || price <= 0) {
        toast.error("Le montant du trajet est invalide");
        return;
      }

      // Validate required fields
      if (!rideId || !departure_city || !arrival_city) {
        toast.error("Informations du trajet manquantes");
        return;
      }

      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          rideId,
          price,
          departure_city,
          arrival_city
        }
      });

      if (error) {
        console.error('Error creating checkout session:', error);
        toast.error("Erreur lors de la création de la session de paiement");
        return;
      }

      if (!data?.url) {
        console.error('No checkout URL returned:', data);
        toast.error("Erreur lors de la création de la session de paiement");
        return;
      }

      // Redirect to Stripe Checkout
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Error:', error);
      toast.error("Une erreur est survenue lors du paiement");
    } finally {
      setProcessing(false);
    }
  };

  // Auto-submit when component mounts
  useEffect(() => {
    handleSubmit();
  }, []);

  return null; // No UI needed since we redirect immediately
};