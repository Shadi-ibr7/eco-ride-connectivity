import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { CreditCard, DollarSign, Apple } from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple">("card");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setProcessing(true);
      
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: { 
          rideId,
          price: amount,
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

  return (
    <Card className="p-6 max-w-md mx-auto bg-ecogreen-DEFAULT text-white">
      <h2 className="text-2xl font-bold mb-2">Méthode de paiement</h2>
      <p className="text-gray-300 mb-6">Choisissez votre méthode de paiement préférée.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setPaymentMethod("card")}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
            paymentMethod === "card" 
              ? "border-white bg-ecogreen-light text-white" 
              : "border-gray-600 hover:border-gray-400"
          }`}
        >
          <CreditCard className="h-6 w-6" />
          <span>Carte</span>
        </button>
        <button
          onClick={() => setPaymentMethod("paypal")}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
            paymentMethod === "paypal" 
              ? "border-white bg-ecogreen-light text-white" 
              : "border-gray-600 hover:border-gray-400"
          }`}
        >
          <DollarSign className="h-6 w-6" />
          <span>PayPal</span>
        </button>
        <button
          onClick={() => setPaymentMethod("apple")}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 transition-colors ${
            paymentMethod === "apple" 
              ? "border-white bg-ecogreen-light text-white" 
              : "border-gray-600 hover:border-gray-400"
          }`}
        >
          <Apple className="h-6 w-6" />
          <span>Apple Pay</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-white">Nom</Label>
          <Input
            id="name"
            type="text"
            placeholder="Prénom Nom"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-ecogreen-DEFAULT border-gray-600 text-white placeholder:text-gray-400 focus:border-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city" className="text-white">Ville</Label>
          <Input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-ecogreen-DEFAULT border-gray-600 text-white placeholder:text-gray-400 focus:border-white"
            required
          />
        </div>

        <div className="space-y-2">
          <Label className="text-white">Détails de la carte</Label>
          <div className="p-3 border border-gray-600 rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: '#9CA3AF',
                    },
                  },
                  invalid: {
                    color: '#EF4444',
                  },
                },
              }}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={processing || isLoading}
          className="w-full bg-white text-ecogreen-DEFAULT hover:bg-gray-100"
        >
          {processing ? "Traitement en cours..." : `Payer ${amount}€`}
        </Button>
      </form>
    </Card>
  );
};