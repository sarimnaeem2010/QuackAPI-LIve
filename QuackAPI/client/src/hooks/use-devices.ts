import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { Device, InsertDevice, UpdateDeviceRequest } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { authFetch } from "@/hooks/use-auth";

export function useDevices() {
  return useQuery({
    queryKey: [api.devices.list.path],
    queryFn: async () => {
      const res = await authFetch(api.devices.list.path);
      if (!res.ok) throw new Error("Failed to fetch devices");
      return await res.json() as Device[];
    },
  });
}

export function useDevice(id: number) {
  return useQuery({
    queryKey: [api.devices.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.devices.get.path, { id });
      const res = await authFetch(url);
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch device");
      return await res.json() as Device;
    },
    enabled: !!id,
    refetchInterval: (query) => query.state.data?.status === "connected" ? false : 3000,
  });
}

export function useDeviceQR(id: number) {
  return useQuery({
    queryKey: [api.devices.qr.path, id],
    queryFn: async () => {
      const url = buildUrl(api.devices.qr.path, { id });
      const res = await authFetch(url);
      if (!res.ok) throw new Error("Failed to fetch QR");
      return await res.json() as { qrCode: string | null; status: string };
    },
    enabled: !!id,
    refetchInterval: (data) => {
      return data?.state?.data?.status === "connected" ? false : 3000;
    },
  });
}

export function useCreateDevice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: { deviceName: string }) => {
      const res = await authFetch(api.devices.create.path, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to create device");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
      toast({ title: "Success", description: "Device created successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}

export function useUpdateDevice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updates }: UpdateDeviceRequest & { id: number }) => {
      const url = buildUrl(api.devices.update.path, { id });
      const res = await authFetch(url, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error("Failed to update device");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
      toast({ title: "Success", description: "Device updated successfully" });
    },
  });
}

export function useDeleteDevice() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.devices.delete.path, { id });
      const res = await authFetch(url, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.message || "Failed to delete device");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
      toast({ title: "Success", description: "Device deleted successfully" });
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });
}
