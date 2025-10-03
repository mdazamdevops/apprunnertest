import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import React, { type PropsWithChildren } from "react";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY ?? "");

export function StripeProvider({ children }: PropsWithChildren) {
  return <Elements stripe={stripePromise}>{children}</Elements>;
}
