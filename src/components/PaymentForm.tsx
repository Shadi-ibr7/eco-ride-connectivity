import { useState } from "react";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card } from "./ui/card";
import { CreditCard, Paypal, Apple } from "lucide-react";

interface PaymentFormProps {
  amount: number;
  onSuccess: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PaymentForm = ({ amount, onSuccess, onCancel, isLoading }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [paymentMethod, setPaymentMethod] = useState<"card" | "paypal" | "apple">("card");
  const [name, setName] = useState("");
  const [city, setCity] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.origin + "/success",
      },
    });

    if (error) {
      console.error("Payment error:", error);
    } else {
      onSuccess();
    }
  };

  return (
    <Card className="p-6 max-w-md mx-auto bg-black text-white">
      <h2 className="text-2xl font-bold mb-2">Payment Method</h2>
      <p className="text-gray-400 mb-6">Add a new payment method to your account.</p>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setPaymentMethod("card")}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 ${
            paymentMethod === "card" ? "border-white" : "border-gray-700"
          }`}
        >
          <CreditCard className="h-6 w-6" />
          <span>Card</span>
        </button>
        <button
          onClick={() => setPaymentMethod("paypal")}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 ${
            paymentMethod === "paypal" ? "border-white" : "border-gray-700"
          }`}
        >
          <Paypal className="h-6 w-6" />
          <span>PayPal</span>
        </button>
        <button
          onClick={() => setPaymentMethod("apple")}
          className={`p-4 border rounded-lg flex flex-col items-center justify-center gap-2 ${
            paymentMethod === "apple" ? "border-white" : "border-gray-700"
          }`}
        >
          <Apple className="h-6 w-6" />
          <span>Apple</span>
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="First Last"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-black border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            className="bg-black border-gray-700 text-white"
          />
        </div>

        <div className="space-y-2">
          <Label>Card Details</Label>
          <div className="p-3 border border-gray-700 rounded-md">
            <CardElement
              options={{
                style: {
                  base: {
                    fontSize: '16px',
                    color: '#ffffff',
                    '::placeholder': {
                      color: '#aab7c4',
                    },
                  },
                  invalid: {
                    color: '#fa755a',
                  },
                },
              }}
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={!stripe || isLoading}
          className="w-full bg-white text-black hover:bg-gray-100"
        >
          {isLoading ? "Processing..." : "Continue"}
        </Button>
      </form>
    </Card>
  );
};