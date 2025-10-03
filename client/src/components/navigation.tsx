import { Link } from "wouter";
import { logout } from "../lib/authUtils";
import { useAuth } from "../hooks/useAuth";

export function Navigation() {
  const { user } = useAuth();

  return (
    <nav className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3">
      <div className="flex items-center gap-4">
        <span className="text-lg font-semibold" data-testid="text-brand-name">
          CrazyTrainAI
        </span>
        <Link href="/postcards" className="text-sm font-medium" data-testid="link-postcards">
          Postcards
        </Link>
        <Link href="/subscribe" className="text-sm font-medium" data-testid="link-subscribe">
          Subscription
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {user && (
          <span className="text-sm" data-testid="text-user-email">
            {user.email}
          </span>
        )}
        <button
          type="button"
          className="rounded bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white"
          onClick={() => logout()}
          data-testid="button-logout"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
