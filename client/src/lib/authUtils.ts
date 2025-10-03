import axios from "axios";

export async function fetchSubscriptionStatus() {
  const { data } = await axios.get<{ status: string; currentPeriodEnd?: number; nextBillingDate?: number }>(
    "/api/subscription-status"
  );
  return data;
}

export async function logout() {
  await axios.get("/api/logout");
  sessionStorage.clear();
  window.location.href = "/";
}
