import { useLocation } from "wouter";
import { CardElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { useMutation } from "@tanstack/react-query";
import type { FormEvent } from "react";
import axios from "axios";
import { Navigation } from "../components/navigation";
import { useToast } from "../hooks/use-toast";
import { Button } from "../components/ui/button";

export default function PostcardCheckoutPage() {
  const stripe = useStripe();
  const elements = useElements();
  const [, navigate] = useLocation();
  const { toast } = useToast();

  const confirmPayment = useMutation<
    string | undefined,
    unknown,
    { clientSecret: string; orderId: string }
  >({
    mutationFn: async ({ clientSecret, orderId }) => {
      if (!stripe || !elements) throw new Error("Stripe not ready");
      const card = elements.getElement(CardElement);
      if (!card) throw new Error("Card element missing");

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: { card }
      });

      if (result.error) {
        throw result.error;
      }

      await axios.post(`/api/postcard-orders/${orderId}/confirm`);

      return result.paymentIntent?.id;
    },
    onSuccess: (_intentId, variables) => {
      if (variables?.orderId) {
        sessionStorage.removeItem(`postcard-order-${variables.orderId}`);
      }
      toast("Order confirmed", "success");
      navigate("/postcard-success");
    },
    onError: () => {
      toast("Payment failed", "error");
    }
  });

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const orderId = (formData.get("orderId") as string) ?? "";
    if (!orderId) return;

    const clientSecret = sessionStorage.getItem(`postcard-order-${orderId}`);
    if (!clientSecret) {
      toast("Unable to find payment information", "error");
      return;
    }
    confirmPayment.mutate({ clientSecret, orderId });
  };

  const [location] = useLocation();
  const defaultOrderId = (() => {
    const queryIndex = location.indexOf("?");
    if (queryIndex === -1) return "";
    const params = new URLSearchParams(location.slice(queryIndex + 1));
    return params.get("orderId") ?? "";
  })();

  return (
    <div>
      <Navigation />
      <main className="mx-auto max-w-lg px-6 py-10">
        <h2 className="text-2xl font-semibold">Complete your postcard order</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <input
            name="orderId"
            defaultValue={defaultOrderId}
            placeholder="Order ID"
            className="w-full rounded border border-slate-300 px-3 py-2"
          />
          <div className="rounded border border-slate-200 bg-white p-4">
            <CardElement />
          </div>
          <Button type="submit" data-testid="button-confirm-order" disabled={confirmPayment.isLoading}>
            {confirmPayment.isLoading ? "Processing..." : "Confirm Payment"}
          </Button>
        </form>
      </main>
    </div>
  );
}
