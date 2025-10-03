import { useEffect, useState } from "react";
import { Link } from "wouter";
import { Navigation } from "../components/navigation";
import { fetchSubscriptionStatus } from "../lib/authUtils";
import { useAuth } from "../hooks/useAuth";

export default function HomePage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<string>("loading");

  useEffect(() => {
    if (!user) return;
    fetchSubscriptionStatus()
      .then((data) => setStatus(data.status))
      .catch(() => setStatus("inactive"));
  }, [user]);

  return (
    <div>
      <Navigation />
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-10">
        <h2 className="text-2xl font-semibold" data-testid="text-dashboard-heading">
          Welcome back{user?.firstName ? `, ${user.firstName}` : ""}!
        </h2>
        <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">Subscription Status</p>
              <p className="text-lg font-medium" data-testid="badge-subscription-status">
                {status}
              </p>
            </div>
            <Link href="/subscribe" data-testid="link-manage-subscription" className="text-sm font-medium text-brand-600">
              Manage subscription
            </Link>
          </div>
        </div>
        <div className="rounded border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold">Ready to send postcards?</h3>
          <p className="mt-2 text-sm text-slate-600">
            Upload a design and order 20 premium postcards for $10.
          </p>
          <Link href="/postcards" className="mt-4 inline-flex text-sm font-semibold text-brand-600" data-testid="link-start-postcards">
            Go to Postcards
          </Link>
        </div>
      </main>
    </div>
  );
}
