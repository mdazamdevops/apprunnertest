import { useQuery } from "@tanstack/react-query";
import axios from "axios";

interface AuthResponse {
  user: {
    id: string;
    email: string;
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
    subscriptionStatus: string;
  } | null;
}

export function useAuth() {
  const query = useQuery<AuthResponse>({
    queryKey: ["/api/auth/user"],
    queryFn: async () => {
      try {
        const response = await axios.get<AuthResponse>("/api/auth/user", { withCredentials: true });
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          return { user: null };
        }
        throw error;
      }
    }
  });

  const user = query.data?.user ?? null;

  return {
    user,
    isLoading: query.isLoading,
    isAuthenticated: Boolean(user)
  };
}
