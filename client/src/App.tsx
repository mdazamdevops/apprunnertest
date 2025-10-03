import { Route, Switch } from "wouter";
import LandingPage from "./pages/landing";
import HomePage from "./pages/home";
import SubscribePage from "./pages/subscribe";
import PostcardsPage from "./pages/postcards";
import PostcardCheckoutPage from "./pages/postcard-checkout";
import PostcardSuccessPage from "./pages/postcard-success";
import { useAuth } from "./hooks/useAuth";

export default function App() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50" data-testid="text-app-loading">
        Loading...
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={isAuthenticated ? HomePage : LandingPage} />
      <Route path="/subscribe" component={SubscribePage} />
      <Route path="/postcards" component={PostcardsPage} />
      <Route path="/postcard-checkout" component={PostcardCheckoutPage} />
      <Route path="/postcard-success" component={PostcardSuccessPage} />
    </Switch>
  );
}
