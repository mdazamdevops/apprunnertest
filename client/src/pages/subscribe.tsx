import { type FormEvent, useEffect, useState } from "react";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import axios from "axios";
import { Navigation } from "../components/navigation";
import { useToast } from "../hooks/use-toast";

export default function SubscribePage() {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!stripe) {
      console.warn("Stripe has not loaded yet");
    }
  }, [stripe]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setIsLoading(true);
    try {
      const { data } = await axios.post("/api/create-subscription");
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element not found");

      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card }
      });

      if (result.error) {
        throw result.error;
      }

      toast("Subscription activated", "success");
      window.location.href = "/";
    } catch (error) {
      console.error(error);
      toast("Failed to process subscription", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Navigation />
      <main className="mx-auto max-w-lg px-6 py-10">
        <h2 className="text-2xl font-semibold">Subscribe for $1/month</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="rounded border border-slate-200 bg-white p-4">
            <CardElement options={{ hidePostalCode: true }} />
          </div>
          <button
            type="submit"
            className="w-full rounded bg-brand-600 py-2 text-sm font-semibold text-white"
            data-testid="button-confirm-payment"
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Confirm subscription"}
          </button>
        </form>
      </main>
    </div>
  );
}
