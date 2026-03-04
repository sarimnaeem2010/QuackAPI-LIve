import { useQuery } from "@tanstack/react-query";
import { authFetch } from "@/hooks/use-auth";
import type { Payment } from "@shared/schema";

export function usePayments() {
  return useQuery({
    queryKey: ["/api/payments"],
    queryFn: async () => {
      const res = await authFetch("/api/payments");
      if (!res.ok) throw new Error("Failed to fetch payments");
      return await res.json() as Payment[];
    },
  });
}
