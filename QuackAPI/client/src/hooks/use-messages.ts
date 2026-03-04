import { useQuery } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Message } from "@shared/schema";
import { authFetch } from "@/hooks/use-auth";

export function useMessages(deviceId?: number) {
  return useQuery({
    queryKey: [api.messages.list.path, deviceId],
    queryFn: async () => {
      let url = api.messages.list.path;
      if (deviceId) {
        url += `?deviceId=${deviceId}`;
      }
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch messages");
      return await res.json() as Message[];
    },
  });
}
