import { Link } from "wouter";
import { Navigation } from "../components/navigation";

export default function PostcardSuccessPage() {
  return (
    <div>
      <Navigation />
      <main className="mx-auto flex min-h-[50vh] max-w-2xl flex-col items-center justify-center px-6 py-10 text-center">
        <h1 className="text-3xl font-semibold" data-testid="text-order-success">
          Your postcard order is confirmed!
        </h1>
        <p className="mt-4 text-slate-600">
          We&apos;ll start processing your order right away. You can review your orders from the postcards dashboard.
        </p>
        <Link href="/postcards" className="mt-6 text-sm font-semibold text-brand-600" data-testid="link-back-postcards">
          Back to postcards
        </Link>
      </main>
    </div>
  );
}
