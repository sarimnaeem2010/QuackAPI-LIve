import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useLocation } from "wouter";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  Trash2, 
  RefreshCw, 
  Smartphone, 
  MoreVertical, 
  Link as LinkIcon,
  Loader2,
  Check,
  Unplug,
  Wifi,
  ExternalLink
} from "lucide-react";
import { useDevices, useCreateDevice, useDeviceQR, useDeleteDevice, useUpdateDevice } from "@/hooks/use-devices";
import { useQueryClient } from "@tanstack/react-query";
import { api } from "@shared/routes";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/seo";

const createDeviceSchema = z.object({
  deviceName: z.string().min(2, "Device name is required"),
});

export default function DevicesPage() {
  const { data: devices, isLoading } = useDevices();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedDeviceId, setSelectedDeviceId] = useState<number | null>(null);

  return (
    <div className="space-y-8">
      <SEO title="Devices" description="Manage your connected WhatsApp devices. Add new devices, scan QR codes, and monitor connection status." noindex={true} />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Devices</h1>
          <p className="text-muted-foreground mt-2">Manage your WhatsApp connections and sessions.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="shadow-lg shadow-primary/25">
          <Plus className="w-4 h-4 mr-2" />
          Add Device
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-muted/20 animate-pulse" />
          ))}
        </div>
      ) : devices?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-muted/10 rounded-3xl border-2 border-dashed border-muted-foreground/10">
          <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
            <Smartphone className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold">No Devices Found</h3>
          <p className="text-muted-foreground mb-6 max-w-sm text-center">
            Connect your first WhatsApp account to start sending and receiving messages.
          </p>
          <Button onClick={() => setIsCreateOpen(true)}>Connect Device</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {devices?.map((device) => (
            <DeviceCard 
              key={device.id} 
              device={device} 
              onViewQR={() => setSelectedDeviceId(device.id)}
            />
          ))}
        </div>
      )}

      {/* Create Device Dialog */}
      <CreateDeviceDialog open={isCreateOpen} onOpenChange={setIsCreateOpen} />

      {/* QR Code Dialog */}
      {selectedDeviceId && (
        <QRDialog 
          deviceId={selectedDeviceId} 
          open={!!selectedDeviceId} 
          onOpenChange={(open) => !open && setSelectedDeviceId(null)} 
        />
      )}
    </div>
  );
}

function DeviceCard({ device, onViewQR }: { device: any, onViewQR: () => void }) {
  const [, setLocation] = useLocation();
  const deleteMutation = useDeleteDevice();
  const updateMutation = useUpdateDevice();
  const queryClient = useQueryClient();
  const [isEditingWebhook, setIsEditingWebhook] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState(device.webhookUrl || "");
  const [isReconnecting, setIsReconnecting] = useState(false);

  const handleUpdateWebhook = () => {
    updateMutation.mutate({ id: device.id, webhookUrl });
    setIsEditingWebhook(false);
  };

  const handleDisconnect = async () => {
    if (!confirm("Disconnect this device from WhatsApp?")) return;
    const token = localStorage.getItem("auth_token");
    await fetch(`/api/devices/${device.id}/disconnect`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
  };

  const handleConnectQR = async () => {
    if (device.status === "pending") {
      onViewQR();
      return;
    }
    setIsReconnecting(true);
    try {
      const token = localStorage.getItem("auth_token");
      await fetch(`/api/devices/${device.id}/reconnect`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
      onViewQR();
    } finally {
      setIsReconnecting(false);
    }
  };

  return (
    <Card className="group hover:shadow-lg transition-all duration-300 border-border/50" data-testid={`card-device-${device.id}`}>
      <CardHeader className="flex flex-row items-start justify-between pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold flex items-center gap-2" data-testid={`text-device-name-${device.id}`}>
            {device.deviceName}
          </CardTitle>
          <CardDescription className="font-mono text-xs">ID: {device.id}</CardDescription>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="-mr-2 text-muted-foreground" data-testid={`button-device-menu-${device.id}`}>
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-popover border shadow-md">
            <DropdownMenuItem onClick={() => setIsEditingWebhook(true)}>
              Webhook Settings
            </DropdownMenuItem>
            {device.status === 'connected' && (
              <DropdownMenuItem onClick={handleDisconnect} data-testid={`button-disconnect-${device.id}`}>
                <Unplug className="w-4 h-4 mr-2" />
                Disconnect
              </DropdownMenuItem>
            )}
            {device.status === 'disconnected' && (
              <DropdownMenuItem onClick={handleConnectQR} data-testid={`button-reconnect-${device.id}`}>
                <Wifi className="w-4 h-4 mr-2" />
                Reconnect
              </DropdownMenuItem>
            )}
            <DropdownMenuItem 
              className="text-destructive focus:text-destructive"
              onClick={() => {
                if(confirm("Are you sure you want to delete this device?")) {
                  deleteMutation.mutate(device.id);
                }
              }}
              data-testid={`button-delete-device-${device.id}`}
            >
              Delete Device
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={device.status === 'connected' ? 'default' : device.status === 'pending' ? 'secondary' : 'destructive'} data-testid={`badge-status-${device.id}`}>
              {device.status === 'connected' ? 'Connected' : device.status === 'pending' ? 'Awaiting QR' : 'Disconnected'}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Phone</span>
            <span className="font-medium" data-testid={`text-phone-${device.id}`}>{device.phoneNumber || "Not Connected"}</span>
          </div>

          {isEditingWebhook ? (
            <div className="flex items-center gap-2 mt-2">
              <Input 
                value={webhookUrl} 
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-api.com/webhook"
                className="h-8 text-xs"
                data-testid={`input-webhook-${device.id}`}
              />
              <Button size="icon" className="h-8 w-8" onClick={handleUpdateWebhook} data-testid={`button-save-webhook-${device.id}`}>
                <Check className="w-3 h-3" />
              </Button>
            </div>
          ) : (
            <div className="text-xs text-muted-foreground truncate bg-muted/50 p-2 rounded-md border border-dashed">
              {device.webhookUrl || "No webhook configured"}
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex gap-2">
        {device.status !== 'connected' ? (
          <Button 
            variant="outline" 
            className="flex-1 border-primary/20 text-primary"
            onClick={handleConnectQR}
            disabled={isReconnecting}
            data-testid={`button-scan-qr-${device.id}`}
          >
            {isReconnecting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            {isReconnecting ? "Connecting..." : "Scan QR"}
          </Button>
        ) : (
          <Button variant="outline" className="flex-1 text-green-600" disabled>
            <Check className="w-4 h-4 mr-2" />
            Connected
          </Button>
        )}
        <Button
          variant="outline"
          className="flex-1"
          onClick={() => setLocation(`/devices/${device.id}`)}
          data-testid={`button-manage-${device.id}`}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          Manage
        </Button>
      </CardFooter>
    </Card>
  );
}

function CreateDeviceDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (o: boolean) => void }) {
  const createMutation = useCreateDevice();
  const form = useForm<z.infer<typeof createDeviceSchema>>({
    resolver: zodResolver(createDeviceSchema),
    defaultValues: { deviceName: "" },
  });

  const onSubmit = (data: z.infer<typeof createDeviceSchema>) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        onOpenChange(false);
        form.reset();
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Device</DialogTitle>
          <DialogDescription>
            Create a new device session. You'll need to scan a QR code after creation.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="deviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Device Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Business WhatsApp" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? "Creating..." : "Create Device"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function QRDialog({ deviceId, open, onOpenChange }: { deviceId: number, open: boolean, onOpenChange: (o: boolean) => void }) {
  const { data, isError } = useDeviceQR(deviceId);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (data?.status === 'connected') {
      queryClient.invalidateQueries({ queryKey: [api.devices.list.path] });
      const timer = setTimeout(() => onOpenChange(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [data?.status]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-qr">
        <DialogHeader>
          <DialogTitle className="text-center">Scan QR Code</DialogTitle>
          <DialogDescription className="text-center">
            Open WhatsApp on your phone, go to <strong>Linked Devices</strong>, and scan this code.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-6 space-y-6">
          {data?.status === 'connected' ? (
            <div className="flex flex-col items-center text-green-600 animate-in" data-testid="status-connected">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                <Check className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold">Successfully Connected!</h3>
              <p className="text-sm text-muted-foreground mt-1">Your WhatsApp is now linked.</p>
            </div>
          ) : data?.qrCode ? (
            <div className="bg-white p-4 rounded-xl shadow-inner border" data-testid="qr-image-container">
              <img 
                src={data.qrCode} 
                alt="WhatsApp QR Code" 
                className="w-64 h-64 object-contain" 
                data-testid="img-qr-code"
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground" data-testid="status-loading">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <p>Generating QR Code...</p>
              <p className="text-xs mt-2">This may take a few seconds...</p>
            </div>
          )}
          
          <div className="text-sm text-center text-muted-foreground" data-testid="text-status">
            Status: <span className="font-medium text-foreground">{data?.status === 'connected' ? 'Connected' : data?.status === 'pending' ? 'Awaiting QR' : data?.status === 'disconnected' ? 'Disconnected' : 'Loading...'}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
