import { useCallback } from "react";

type ToastVariant = "default" | "success" | "error";

export function useToast() {
  const toast = useCallback((message: string, variant: ToastVariant = "default") => {
    // Placeholder toast implementation
    // In a real app this would integrate with a UI toast system
    if (variant === "error") {
      console.error(message);
    } else {
      console.log(message);
    }
  }, []);

  return { toast };
}
