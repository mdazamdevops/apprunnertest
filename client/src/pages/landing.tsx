import { Button } from "../components/ui/button";

export default function LandingPage() {
  const login = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50">
      <h1 className="text-3xl font-bold" data-testid="text-hero-title">
        Welcome to CrazyTrainAI
      </h1>
      <p className="mt-4 max-w-lg text-center text-slate-600" data-testid="text-hero-subtitle">
        Upload your custom postcard designs and let us handle printing and delivery. Subscribe for $1/month to get
        started.
      </p>
      <Button className="mt-8" onClick={login} data-testid="button-login">
        Login with Google
      </Button>
    </div>
  );
}
