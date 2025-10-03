import { QueryClient } from "@tanstack/react-query";
import axios from "axios";

axios.defaults.withCredentials = true;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (axios.isAxiosError(error) && error.response?.status && error.response.status >= 400 && error.response.status < 500) {
          return false;
        }
        return failureCount < 3;
      }
    }
  }
});
