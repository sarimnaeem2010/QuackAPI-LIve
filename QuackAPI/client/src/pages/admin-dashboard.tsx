import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Smartphone,
  MessageSquare,
  DollarSign,
  Wifi,
  WifiOff,
  Crown,
  Shield,
  CheckCircle2,
  XCircle,
  Clock,
  Loader2,
  Search,
  CreditCard,
  Lock,
  LogOut,
  Eye,
  EyeOff,
  Trash2,
  Settings2,
  ChevronDown,
  ChevronRight,
  CalendarDays,
  Filter,
  Save,
  Package,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { User, Device, Message, Payment } from "@shared/schema";
import SEO from "@/components/seo";

type AdminStats = {
  totalUsers: number;
  totalDevices: number;
  totalMessages: number;
  totalPayments: number;
  activeSubscriptions: number;
  connectedDevices: number;
  totalRevenue: number;
  sentMessages: number;
  failedMessages: number;
};

type SafeUser = Omit<User, "password">;

type AdminSettingsData = {
  id: number;
  requireEmailOtp: boolean;
  smtpHost: string | null;
  smtpPort: string | null;
  smtpUser: string | null;
  smtpPassSet: boolean;
  notificationEmail: string | null;
};

const ADMIN_TOKEN_KEY = "admin_token";

function getAdminToken(): string | null {
  return localStorage.getItem(ADMIN_TOKEN_KEY);
}
function setAdminToken(token: string) {
  localStorage.setItem(ADMIN_TOKEN_KEY, token);
}
function clearAdminToken() {
  localStorage.removeItem(ADMIN_TOKEN_KEY);
}

function adminFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const headers: Record<string, string> = { ...(options.headers as Record<string, string> || {}) };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return fetch(url, { ...options, headers });
}

function useAdminQuery<T>(key: string, enabled = true) {
  return useQuery<T>({
    queryKey: [key],
    queryFn: async () => {
      const res = await adminFetch(key);
      if (res.status === 401 || res.status === 403) {
        clearAdminToken();
        window.location.reload();
        throw new Error("Unauthorized");
      }
      if (!res.ok) throw new Error("Failed to fetch");
      return res.json();
    },
    enabled,
  });
}

function AdminLoginPage({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.message || "Invalid password");
        setLoading(false);
        return;
      }
      const data = await res.json();
      setAdminToken(data.token);
      onLogin();
    } catch {
      setError("Connection error. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-sm" data-testid="card-admin-login">
        <CardHeader className="text-center space-y-3">
          <div className="mx-auto w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center shadow-lg shadow-primary/20">
            <Shield className="w-7 h-7 text-primary-foreground" />
          </div>
          <CardTitle className="text-xl">Admin Panel</CardTitle>
          <p className="text-sm text-muted-foreground">Enter the admin password to continue</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="admin-password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="admin-password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter admin password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9 pr-9"
                  autoFocus
                  data-testid="input-admin-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-destructive flex items-center gap-1" data-testid="text-admin-error">
                <XCircle className="w-3.5 h-3.5" /> {error}
              </p>
            )}
            <Button type="submit" className="w-full" disabled={loading || !password} data-testid="button-admin-login">
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Shield className="w-4 h-4 mr-2" />}
              {loading ? "Verifying..." : "Access Dashboard"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function StatsCards({ stats }: { stats: AdminStats }) {
  const cards = [
    { label: "Total Users", value: stats.totalUsers, icon: Users, color: "text-blue-500", bg: "bg-blue-500/10", sub: `${stats.activeSubscriptions} active` },
    { label: "Total Devices", value: stats.totalDevices, icon: Smartphone, color: "text-green-500", bg: "bg-green-500/10", sub: `${stats.connectedDevices} connected` },
    { label: "Total Messages", value: stats.totalMessages, icon: MessageSquare, color: "text-purple-500", bg: "bg-purple-500/10", sub: `${stats.sentMessages} sent, ${stats.failedMessages} failed` },
    { label: "Revenue", value: `${(stats.totalRevenue / 100).toLocaleString()}`, icon: DollarSign, color: "text-amber-500", bg: "bg-amber-500/10", sub: `${stats.totalPayments} payments`, prefix: "PKR " },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <Card key={card.label} className="hover:shadow-md transition-shadow" data-testid={`card-stat-${card.label.toLowerCase().replace(/\s/g, '-')}`}>
          <CardContent className="p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">{card.label}</p>
                <p className="text-2xl font-bold mt-1">{card.prefix || ""}{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

function ConfirmDeleteDialog({
  trigger,
  title,
  description,
  onConfirm,
  isPending,
}: {
  trigger: React.ReactNode;
  title: string;
  description: string;
  onConfirm: () => void;
  isPending: boolean;
}) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>{trigger}</AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Trash2 className="w-4 h-4 mr-2" />}
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function UsersTab() {
  const { data: users, isLoading } = useAdminQuery<SafeUser[]>("/api/admin/users");
  const { data: devicesList } = useAdminQuery<Device[]>("/api/admin/devices");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [subFilter, setSubFilter] = useState("all");

  const toggleSubscription = useMutation({
    mutationFn: async ({ userId, status }: { userId: number; status: string }) => {
      const res = await adminFetch(`/api/admin/users/${userId}/subscription`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Updated", description: "Subscription status updated" });
    },
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: number) => {
      const res = await adminFetch(`/api/admin/users/${userId}`, { method: "DELETE" });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Failed to delete");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/users"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Deleted", description: "User and all their data deleted" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = users?.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesSub = subFilter === "all" || u.subscriptionStatus === subFilter;
    return matchesSearch && matchesSub;
  }) || [];

  const getUserDeviceCount = (userId: number) => devicesList?.filter(d => d.userId === userId).length || 0;

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-users" />
        </div>
        <Select value={subFilter} onValueChange={setSubFilter}>
          <SelectTrigger className="w-full sm:w-44" data-testid="select-filter-subscription">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Subscription" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All subscriptions</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">User</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">API Key</th>
                <th className="text-center p-3 font-medium">Devices</th>
                <th className="text-center p-3 font-medium">Subscription</th>
                <th className="text-left p-3 font-medium hidden sm:table-cell">Joined</th>
                <th className="text-center p-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id} className="border-t hover:bg-muted/30 transition-colors" data-testid={`row-user-${u.id}`}>
                  <td className="p-3">
                    <div>
                      <p className="font-medium flex items-center gap-1.5">
                        {u.name}
                        {u.isAdmin && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                      </p>
                      <p className="text-xs text-muted-foreground">{u.email}</p>
                      <p className="text-xs text-muted-foreground/60">ID #{u.id}</p>
                    </div>
                  </td>
                  <td className="p-3 hidden md:table-cell">
                    <code className="text-xs bg-muted px-2 py-1 rounded font-mono">{u.apiKey.slice(0, 12)}...</code>
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant="secondary">{getUserDeviceCount(u.id)}</Badge>
                  </td>
                  <td className="p-3 text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={u.subscriptionStatus === "active" ? "text-green-600 hover:text-green-700" : "text-muted-foreground"}
                      onClick={() => toggleSubscription.mutate({ userId: u.id, status: u.subscriptionStatus === "active" ? "inactive" : "active" })}
                      disabled={toggleSubscription.isPending}
                      data-testid={`button-toggle-subscription-${u.id}`}
                    >
                      {u.subscriptionStatus === "active" ? <><CheckCircle2 className="w-4 h-4 mr-1" /> Active</> : <><XCircle className="w-4 h-4 mr-1" /> Inactive</>}
                    </Button>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground hidden sm:table-cell">
                    {u.createdAt ? format(new Date(u.createdAt), "MMM d, yyyy") : "-"}
                  </td>
                  <td className="p-3 text-center">
                    {!u.isAdmin && (
                      <ConfirmDeleteDialog
                        trigger={
                          <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10" data-testid={`button-delete-user-${u.id}`}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        }
                        title="Delete User"
                        description={`This will permanently delete "${u.name}" and all their devices, messages, and payments. This action cannot be undone.`}
                        onConfirm={() => deleteUser.mutate(u.id)}
                        isPending={deleteUser.isPending}
                      />
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No users found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">{filtered.length} of {users?.length || 0} users</p>
    </div>
  );
}

function DevicesTab() {
  const { data: allDevices, isLoading } = useAdminQuery<Device[]>("/api/admin/devices");
  const { data: users } = useAdminQuery<SafeUser[]>("/api/admin/users");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  const updateStatus = useMutation({
    mutationFn: async ({ deviceId, status }: { deviceId: number; status: string }) => {
      const res = await adminFetch(`/api/admin/devices/${deviceId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Updated", description: "Device status updated" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteDevice = useMutation({
    mutationFn: async (deviceId: number) => {
      const res = await adminFetch(`/api/admin/devices/${deviceId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete device");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/devices"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({ title: "Deleted", description: "Device deleted successfully" });
    },
    onError: (err) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const toggleUser = (userId: number) => {
    setExpandedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const filteredDevices = allDevices?.filter(d => {
    const ownerName = users?.find(u => u.id === d.userId)?.name || "";
    const matchesSearch = d.deviceName.toLowerCase().includes(search.toLowerCase()) ||
      ownerName.toLowerCase().includes(search.toLowerCase()) ||
      (d.phoneNumber || "").includes(search);
    const matchesStatus = statusFilter === "all" || d.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  const userGroups = users?.map(u => ({
    user: u,
    devices: filteredDevices.filter(d => d.userId === u.id),
  })).filter(g => g.devices.length > 0) || [];

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by device, owner, or phone..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-devices" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44" data-testid="select-filter-device-status">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="connected">Connected</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="disconnected">Disconnected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {userGroups.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">No devices found</div>
      ) : (
        <div className="space-y-3">
          {userGroups.map(({ user, devices }) => {
            const isExpanded = expandedUsers.has(user.id) || expandedUsers.size === 0;
            const shouldExpand = expandedUsers.has(user.id) || !expandedUsers.size;
            return (
              <div key={user.id} className="rounded-lg border overflow-hidden" data-testid={`group-devices-user-${user.id}`}>
                <button
                  className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => toggleUser(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2">
                        {user.name}
                        {user.isAdmin && <Crown className="w-3.5 h-3.5 text-amber-500" />}
                        <Badge variant="outline" className="text-xs font-mono py-0">#{user.id}</Badge>
                      </p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{devices.length} device{devices.length !== 1 ? "s" : ""}</Badge>
                    {shouldExpand ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                {shouldExpand && (
                  <div className="divide-y">
                    {devices.map((d) => (
                      <div key={d.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-3 hover:bg-muted/20 transition-colors" data-testid={`row-device-${d.id}`}>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{d.deviceName}</p>
                          <p className="text-xs text-muted-foreground font-mono">{d.phoneNumber || "No phone"}</p>
                          <p className="text-xs text-muted-foreground">{d.createdAt ? format(new Date(d.createdAt), "MMM d, yyyy") : "-"}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge
                            variant={d.status === "connected" ? "default" : d.status === "pending" ? "secondary" : "outline"}
                            className="capitalize"
                          >
                            {d.status === "connected" && <Wifi className="w-3 h-3 mr-1" />}
                            {d.status === "disconnected" && <WifiOff className="w-3 h-3 mr-1" />}
                            {d.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                            {d.status === "connected" ? "Connected" : d.status === "pending" ? "Awaiting QR" : "Disconnected"}
                          </Badge>
                          {d.status !== "connected" ? (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-green-600 border-green-500/30 hover:bg-green-500/10 hover:text-green-700 h-7 text-xs"
                              onClick={() => updateStatus.mutate({ deviceId: d.id, status: "connected" })}
                              disabled={updateStatus.isPending}
                              data-testid={`button-connect-device-${d.id}`}
                            >
                              <Wifi className="w-3 h-3 mr-1" /> Connect
                            </Button>
                          ) : (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-muted-foreground h-7 text-xs"
                              onClick={() => updateStatus.mutate({ deviceId: d.id, status: "disconnected" })}
                              disabled={updateStatus.isPending}
                              data-testid={`button-disconnect-device-${d.id}`}
                            >
                              <WifiOff className="w-3 h-3 mr-1" /> Disconnect
                            </Button>
                          )}
                          <ConfirmDeleteDialog
                            trigger={
                              <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive hover:bg-destructive/10 h-7" data-testid={`button-delete-device-${d.id}`}>
                                <Trash2 className="w-3.5 h-3.5" />
                              </Button>
                            }
                            title="Delete Device"
                            description={`Delete "${d.deviceName}"? This will also remove all messages sent from this device. This action cannot be undone.`}
                            onConfirm={() => deleteDevice.mutate(d.id)}
                            isPending={deleteDevice.isPending}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{filteredDevices.length} device{filteredDevices.length !== 1 ? "s" : ""} across {userGroups.length} user{userGroups.length !== 1 ? "s" : ""}</p>
    </div>
  );
}

function MessagesTab() {
  const { data: allMessages, isLoading } = useAdminQuery<Message[]>("/api/admin/messages");
  const { data: allDevices } = useAdminQuery<Device[]>("/api/admin/devices");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const getDeviceName = (deviceId: number) => allDevices?.find(d => d.id === deviceId)?.deviceName || `Device #${deviceId}`;

  const filtered = allMessages?.filter(m => {
    const matchesSearch = m.toNumber.includes(search) || m.content.toLowerCase().includes(search.toLowerCase()) || getDeviceName(m.deviceId).toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || m.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by device, number, or content..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-messages" />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-44" data-testid="select-filter-message-status">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="sent">Sent</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="rounded-lg border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/50">
                <th className="text-left p-3 font-medium">Device</th>
                <th className="text-left p-3 font-medium">To</th>
                <th className="text-left p-3 font-medium">Content</th>
                <th className="text-center p-3 font-medium hidden sm:table-cell">Type</th>
                <th className="text-center p-3 font-medium">Status</th>
                <th className="text-left p-3 font-medium hidden md:table-cell">Sent</th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 100).map((m) => (
                <tr key={m.id} className="border-t hover:bg-muted/30 transition-colors" data-testid={`row-message-${m.id}`}>
                  <td className="p-3 text-muted-foreground">{getDeviceName(m.deviceId)}</td>
                  <td className="p-3 font-mono text-xs">{m.toNumber}</td>
                  <td className="p-3 max-w-[180px] truncate">{m.content}</td>
                  <td className="p-3 text-center hidden sm:table-cell"><Badge variant="outline" className="capitalize text-xs">{m.type}</Badge></td>
                  <td className="p-3 text-center">
                    <Badge variant={m.status === "sent" ? "default" : m.status === "pending" ? "secondary" : "destructive"} className="capitalize">{m.status}</Badge>
                  </td>
                  <td className="p-3 text-xs text-muted-foreground hidden md:table-cell">
                    {m.createdAt ? format(new Date(m.createdAt), "MMM d, HH:mm") : "-"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No messages found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <p className="text-xs text-muted-foreground">Showing {Math.min(filtered.length, 100)} of {filtered.length} messages</p>
    </div>
  );
}

function PaymentsTab() {
  const { data: allPayments, isLoading } = useAdminQuery<Payment[]>("/api/admin/payments");
  const { data: users } = useAdminQuery<SafeUser[]>("/api/admin/users");
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [expandedUsers, setExpandedUsers] = useState<Set<number>>(new Set());

  const toggleUser = (userId: number) => {
    setExpandedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

  const filteredUsers = users?.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchesPlan = planFilter === "all" || u.plan === planFilter;
    return matchesSearch && matchesPlan;
  }) || [];

  const userGroups = filteredUsers.map(u => ({
    user: u,
    payments: allPayments?.filter(p => p.userId === u.id) || [],
  }));

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search by user name or email..." className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} data-testid="input-search-payments" />
        </div>
        <Select value={planFilter} onValueChange={setPlanFilter}>
          <SelectTrigger className="w-full sm:w-44" data-testid="select-filter-plan">
            <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue placeholder="Plan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All plans</SelectItem>
            <SelectItem value="starter">Starter</SelectItem>
            <SelectItem value="professional">Professional</SelectItem>
            <SelectItem value="enterprise">Enterprise</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {userGroups.length === 0 ? (
        <div className="rounded-lg border p-8 text-center text-muted-foreground">No users found</div>
      ) : (
        <div className="space-y-3">
          {userGroups.map(({ user, payments }) => {
            const shouldExpand = expandedUsers.has(user.id) || !expandedUsers.size;
            const planColors: Record<string, string> = {
              starter: "bg-slate-500/10 text-slate-600",
              professional: "bg-blue-500/10 text-blue-600",
              enterprise: "bg-purple-500/10 text-purple-600",
            };

            return (
              <div key={user.id} className="rounded-lg border overflow-hidden" data-testid={`group-payments-user-${user.id}`}>
                <button
                  className="w-full flex items-center justify-between p-3 bg-muted/30 hover:bg-muted/50 transition-colors text-left"
                  onClick={() => toggleUser(user.id)}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium flex items-center gap-2 flex-wrap">
                        {user.name}
                        <Badge className={`text-xs capitalize ${planColors[user.plan] || planColors.starter}`} variant="outline">
                          {user.plan}
                        </Badge>
                        <Badge variant={user.subscriptionStatus === "active" ? "default" : "outline"} className={`text-xs ${user.subscriptionStatus === "active" ? "bg-green-500/10 text-green-600 border-green-500/30" : ""}`}>
                          {user.subscriptionStatus}
                        </Badge>
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                        {user.email}
                        {user.planExpiresAt && (
                          <span className="flex items-center gap-0.5 ml-1">
                            <CalendarDays className="w-3 h-3" />
                            Next: {format(new Date(user.planExpiresAt), "MMM d, yyyy")}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">{payments.length} payment{payments.length !== 1 ? "s" : ""}</Badge>
                    {shouldExpand ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  </div>
                </button>
                {shouldExpand && (
                  payments.length === 0 ? (
                    <div className="p-4 text-sm text-muted-foreground text-center border-t">No payments yet</div>
                  ) : (
                    <div className="divide-y">
                      {payments.map(p => (
                        <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3 gap-2 hover:bg-muted/20 transition-colors" data-testid={`row-payment-${p.id}`}>
                          <div>
                            <p className="font-medium capitalize">{p.gateway}</p>
                            <p className="text-xs text-muted-foreground font-mono">{p.transactionId || "No transaction ID"}</p>
                            <p className="text-xs text-muted-foreground">{p.createdAt ? format(new Date(p.createdAt), "MMM d, yyyy HH:mm") : "-"}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-semibold">{p.currency} {(p.amount / 100).toFixed(0)}</span>
                            <Badge variant={p.status === "completed" ? "default" : p.status === "pending" ? "secondary" : "destructive"} className="capitalize">
                              {p.status === "completed" && <CheckCircle2 className="w-3 h-3 mr-1" />}
                              {p.status === "pending" && <Clock className="w-3 h-3 mr-1" />}
                              {p.status === "failed" && <XCircle className="w-3 h-3 mr-1" />}
                              {p.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </div>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">{userGroups.length} users, {allPayments?.length || 0} total payments</p>
    </div>
  );
}

function SettingsTab() {
  const { data: settings, isLoading } = useAdminQuery<AdminSettingsData>("/api/admin/settings");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [requireOtp, setRequireOtp] = useState<boolean | null>(null);
  const [smtpHost, setSmtpHost] = useState("");
  const [smtpPort, setSmtpPort] = useState("");
  const [smtpUser, setSmtpUser] = useState("");
  const [smtpPass, setSmtpPass] = useState("");
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [notificationEmail, setNotificationEmail] = useState("sarim.naeem2010@gmail.com");
  const [paypalClientId, setPaypalClientId] = useState("");
  const [paypalClientSecret, setPaypalClientSecret] = useState("");
  const [paypalMode, setPaypalMode] = useState<"sandbox" | "live">("sandbox");
  const [showPaypalSecret, setShowPaypalSecret] = useState(false);
  const [paypalSandboxClientId, setPaypalSandboxClientId] = useState("");
  const [paypalSandboxClientSecret, setPaypalSandboxClientSecret] = useState("");
  const [paypalLiveClientId, setPaypalLiveClientId] = useState("");
  const [paypalLiveClientSecret, setPaypalLiveClientSecret] = useState("");
  const [showSandboxSecret, setShowSandboxSecret] = useState(false);
  const [showLiveSecret, setShowLiveSecret] = useState(false);
  const [initialized, setInitialized] = useState(false);

  if (settings && !initialized) {
    setRequireOtp(settings.requireEmailOtp);
    setSmtpHost(settings.smtpHost || "");
    setSmtpPort(settings.smtpPort || "");
    setSmtpUser(settings.smtpUser || "");
    setNotificationEmail(settings.notificationEmail || "sarim.naeem2010@gmail.com");
    setPaypalClientId(settings.paypalClientId || "");
    setPaypalMode((settings.paypalMode as "sandbox" | "live") || "sandbox");
    setPaypalSandboxClientId(settings.paypalSandboxClientId || "");
    setPaypalLiveClientId(settings.paypalLiveClientId || "");
    setInitialized(true);
  }

  const saveOtpSetting = useMutation({
    mutationFn: async (value: boolean) => {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requireEmailOtp: value }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Saved", description: "OTP setting updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to save setting", variant: "destructive" }),
  });

  const saveSmtp = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = { smtpHost, smtpPort, smtpUser };
      if (smtpPass) body.smtpPass = smtpPass;
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setSmtpPass("");
      toast({ title: "Saved", description: "SMTP settings updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to save SMTP settings", variant: "destructive" }),
  });

  const savePaypalMode = useMutation({
    mutationFn: async (mode: "sandbox" | "live") => {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paypalMode: mode }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: (_data, mode) => {
      setPaypalMode(mode);
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Mode Switched", description: `PayPal is now in ${mode === "live" ? "Live (Production)" : "Sandbox (Test)"} mode.` });
    },
    onError: () => toast({ title: "Error", description: "Failed to switch PayPal mode", variant: "destructive" }),
  });

  const saveAllPaypal = useMutation({
    mutationFn: async () => {
      const body: Record<string, string> = {
        paypalSandboxClientId: paypalSandboxClientId.trim(),
        paypalLiveClientId: paypalLiveClientId.trim(),
      };
      if (paypalSandboxClientSecret) body.paypalSandboxClientSecret = paypalSandboxClientSecret.trim();
      if (paypalLiveClientSecret) body.paypalLiveClientSecret = paypalLiveClientSecret.trim();
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      setPaypalSandboxClientSecret("");
      setPaypalLiveClientSecret("");
      toast({ title: "Saved", description: "PayPal credentials saved." });
    },
    onError: () => toast({ title: "Error", description: "Failed to save credentials", variant: "destructive" }),
  });

  const testPaypal = useMutation({
    mutationFn: async () => {
      const res = await adminFetch("/api/admin/paypal/test", { method: "POST" });
      return res.json() as Promise<{ success: boolean; mode?: string; error?: string }>;
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({ title: "PayPal Connected", description: `Successfully authenticated in ${data.mode} mode.` });
      } else {
        toast({ title: "PayPal Error", description: data.error || "Connection failed", variant: "destructive" });
      }
    },
    onError: () => toast({ title: "Error", description: "Could not reach the server", variant: "destructive" }),
  });

  const saveNotificationEmail = useMutation({
    mutationFn: async () => {
      const res = await adminFetch("/api/admin/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationEmail }),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/settings"] });
      toast({ title: "Saved", description: "Notification email updated" });
    },
    onError: () => toast({ title: "Error", description: "Failed to save notification email", variant: "destructive" }),
  });

  const fixEmailVerified = useMutation({
    mutationFn: async () => {
      const res = await adminFetch("/api/admin/fix-email-verified", { method: "POST" });
      if (!res.ok) throw new Error("Failed");
      return res.json() as Promise<{ count: number }>;
    },
    onSuccess: (data) => {
      toast({ title: "Done", description: `${data.count} user(s) marked as email-verified.` });
    },
    onError: () => toast({ title: "Error", description: "Failed to fix email verification", variant: "destructive" }),
  });

  if (isLoading) return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration Settings</CardTitle>
          <CardDescription>Control how new users sign up for the platform</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4 p-4 rounded-lg border bg-muted/20">
            <div>
              <Label htmlFor="require-otp" className="font-medium">Require email OTP on signup</Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                When enabled, users must verify their email address with a 6-digit code before accessing the platform.
              </p>
            </div>
            <Switch
              id="require-otp"
              checked={requireOtp ?? true}
              onCheckedChange={(val) => {
                setRequireOtp(val);
                saveOtpSetting.mutate(val);
              }}
              disabled={saveOtpSetting.isPending}
              data-testid="switch-require-otp"
            />
          </div>
          <div className="flex items-start justify-between gap-4 p-4 rounded-lg border border-amber-500/20 bg-amber-500/5">
            <div>
              <Label className="font-medium text-amber-700 dark:text-amber-400">Fix Existing Users</Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                Mark all currently unverified users as email-verified so they can log in when OTP is enabled.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="shrink-0 border-amber-500/30 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10" data-testid="button-fix-email-verified">
                  Run Migration
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Mark all users as email-verified?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will set emailVerified = true for all users who are currently unverified. Useful when enabling OTP enforcement on an existing platform. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => fixEmailVerified.mutate()}
                    disabled={fixEmailVerified.isPending}
                    className="bg-amber-600 hover:bg-amber-700"
                  >
                    {fixEmailVerified.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                    Yes, Fix Users
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">SMTP Configuration</CardTitle>
          <CardDescription>
            Override the default SMTP environment variables. Leave blank to use the values from server environment variables.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input
                id="smtp-host"
                placeholder="mail.example.com"
                value={smtpHost}
                onChange={(e) => setSmtpHost(e.target.value)}
                data-testid="input-smtp-host"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input
                id="smtp-port"
                placeholder="465"
                value={smtpPort}
                onChange={(e) => setSmtpPort(e.target.value)}
                data-testid="input-smtp-port"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input
                id="smtp-user"
                placeholder="notification@yourdomain.com"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                data-testid="input-smtp-user"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="smtp-pass">SMTP Password</Label>
              <div className="relative">
                <Input
                  id="smtp-pass"
                  type={showSmtpPass ? "text" : "password"}
                  placeholder={settings?.smtpPassSet ? "••••••••" : "Enter password"}
                  value={smtpPass}
                  onChange={(e) => setSmtpPass(e.target.value)}
                  className="pr-9"
                  data-testid="input-smtp-pass"
                />
                <button
                  type="button"
                  onClick={() => setShowSmtpPass(!showSmtpPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {settings?.smtpPassSet && !smtpPass && (
                <p className="text-xs text-muted-foreground">Password is set. Leave blank to keep current.</p>
              )}
            </div>
          </div>
          <Button
            onClick={() => saveSmtp.mutate()}
            disabled={saveSmtp.isPending}
            data-testid="button-save-smtp"
          >
            {saveSmtp.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save SMTP Settings
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Payment Gateway (PayPal)</CardTitle>
          <CardDescription>
            Store sandbox and live credentials separately. Use the mode toggle to switch which set is active for real transactions.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="space-y-2">
            <Label>Active Mode</Label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => savePaypalMode.mutate("sandbox")}
                disabled={savePaypalMode.isPending}
                className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${paypalMode === "sandbox" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                data-testid="button-paypal-mode-sandbox"
              >
                Test (Sandbox)
              </button>
              <button
                type="button"
                onClick={() => savePaypalMode.mutate("live")}
                disabled={savePaypalMode.isPending}
                className={`px-4 py-1.5 text-sm rounded-md border transition-colors ${paypalMode === "live" ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted"}`}
                data-testid="button-paypal-mode-live"
              >
                Live (Production)
              </button>
              {savePaypalMode.isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
            </div>
            <p className="text-xs text-muted-foreground">
              {paypalMode === "live" ? "Live mode is active — real payments will be processed." : "Test mode is active — no real charges."}
            </p>
          </div>

          {paypalMode === "sandbox" && <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Sandbox (Test) Credentials</p>
            <div className="space-y-2">
              <Label htmlFor="paypal-sandbox-client-id" className="text-xs text-muted-foreground">Client ID</Label>
              <Input
                id="paypal-sandbox-client-id"
                placeholder="Af..."
                value={paypalSandboxClientId}
                onChange={(e) => setPaypalSandboxClientId(e.target.value)}
                data-testid="input-paypal-sandbox-client-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paypal-sandbox-secret" className="text-xs text-muted-foreground">Client Secret</Label>
              <div className="relative">
                <Input
                  id="paypal-sandbox-secret"
                  type={showSandboxSecret ? "text" : "password"}
                  placeholder={settings?.paypalSandboxSecretSet ? "••••••••" : "Enter secret"}
                  value={paypalSandboxClientSecret}
                  onChange={(e) => setPaypalSandboxClientSecret(e.target.value)}
                  className="pr-9"
                  data-testid="input-paypal-sandbox-secret"
                />
                <button
                  type="button"
                  onClick={() => setShowSandboxSecret(!showSandboxSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showSandboxSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {settings?.paypalSandboxSecretSet && !paypalSandboxClientSecret && (
                <p className="text-xs text-muted-foreground">Secret saved. Leave blank to keep current.</p>
              )}
            </div>
          </div>}

          {paypalMode === "live" && <div className="border-t pt-4 space-y-3">
            <p className="text-sm font-medium">Live (Production) Credentials</p>
            <div className="space-y-2">
              <Label htmlFor="paypal-live-client-id" className="text-xs text-muted-foreground">Client ID</Label>
              <Input
                id="paypal-live-client-id"
                placeholder="AX..."
                value={paypalLiveClientId}
                onChange={(e) => setPaypalLiveClientId(e.target.value)}
                data-testid="input-paypal-live-client-id"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="paypal-live-secret" className="text-xs text-muted-foreground">Client Secret</Label>
              <div className="relative">
                <Input
                  id="paypal-live-secret"
                  type={showLiveSecret ? "text" : "password"}
                  placeholder={settings?.paypalLiveSecretSet ? "••••••••" : "Enter secret"}
                  value={paypalLiveClientSecret}
                  onChange={(e) => setPaypalLiveClientSecret(e.target.value)}
                  className="pr-9"
                  data-testid="input-paypal-live-secret"
                />
                <button
                  type="button"
                  onClick={() => setShowLiveSecret(!showLiveSecret)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showLiveSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {settings?.paypalLiveSecretSet && !paypalLiveClientSecret && (
                <p className="text-xs text-muted-foreground">Secret saved. Leave blank to keep current.</p>
              )}
            </div>
          </div>}

          <div className="flex items-center gap-3 pt-1">
            <Button
              onClick={() => saveAllPaypal.mutate()}
              disabled={saveAllPaypal.isPending || testPaypal.isPending}
              data-testid="button-save-paypal"
            >
              {saveAllPaypal.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
              Save Credentials
            </Button>
            <Button
              variant="outline"
              onClick={() => testPaypal.mutate()}
              disabled={testPaypal.isPending || saveAllPaypal.isPending}
              data-testid="button-test-paypal"
            >
              {testPaypal.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {testPaypal.isPending ? "Testing..." : `Test ${paypalMode === "live" ? "Live" : "Sandbox"} Connection`}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Registration Notifications</CardTitle>
          <CardDescription>
            Receive an email at this address whenever a new user registers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="notification-email">Notification Email</Label>
            <Input
              id="notification-email"
              type="email"
              placeholder="admin@yourdomain.com"
              value={notificationEmail}
              onChange={(e) => setNotificationEmail(e.target.value)}
              data-testid="input-notification-email"
            />
          </div>
          <Button
            onClick={() => saveNotificationEmail.mutate()}
            disabled={saveNotificationEmail.isPending}
            data-testid="button-save-notification-email"
          >
            {saveNotificationEmail.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
            Save Notification Email
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

type PlanData = {
  id: number; key: string; name: string; description: string;
  monthlyPrice: number; yearlyPrice: number; devicesLimit: number;
  messagesLimit: number; features: string[]; isPopular: boolean; sortOrder: number;
};

type PlanEditState = {
  name: string; description: string; monthlyPrice: string; yearlyPrice: string;
  devicesLimit: string; messagesLimit: string; features: string; isPopular: boolean;
};

const PLAN_DEFAULTS: Record<string, Partial<PlanEditState>> = {
  starter: { name: "Starter" },
  professional: { name: "Professional", isPopular: true },
  enterprise: { name: "Enterprise" },
};

function planToEditState(p: PlanData): PlanEditState {
  return {
    name: p.name,
    description: p.description,
    monthlyPrice: (p.monthlyPrice / 100).toFixed(2),
    yearlyPrice: (p.yearlyPrice / 100).toFixed(2),
    devicesLimit: p.devicesLimit === -1 ? "unlimited" : String(p.devicesLimit),
    messagesLimit: p.messagesLimit === -1 ? "unlimited" : String(p.messagesLimit),
    features: (p.features || []).join("\n"),
    isPopular: p.isPopular,
  };
}

function PlansTab() {
  const { data: plans, isLoading } = useAdminQuery<PlanData[]>("/api/admin/plans");
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [edits, setEdits] = useState<Record<string, PlanEditState>>({});

  useEffect(() => {
    if (plans && Object.keys(edits).length === 0) {
      const initial: Record<string, PlanEditState> = {};
      plans.forEach(p => { initial[p.key] = planToEditState(p); });
      setEdits(initial);
    }
  }, [plans]);

  const savePlan = useMutation({
    mutationFn: async (key: string) => {
      const e = edits[key];
      const parseLimit = (v: string) => v.toLowerCase() === "unlimited" ? -1 : parseInt(v) || 0;
      if (key !== "starter") {
        const monthly = parseFloat(e.monthlyPrice);
        const yearly = parseFloat(e.yearlyPrice);
        if (!isNaN(monthly) && monthly > 0 && monthly < 1.00) {
          throw new Error("Monthly price must be at least $1.00 (PayPal minimum)");
        }
        if (!isNaN(yearly) && yearly > 0 && yearly < 1.00) {
          throw new Error("Yearly price must be at least $1.00 (PayPal minimum)");
        }
      }
      const body = {
        name: e.name.trim(),
        description: e.description.trim(),
        monthlyPrice: Math.round(parseFloat(e.monthlyPrice) * 100),
        yearlyPrice: Math.round(parseFloat(e.yearlyPrice) * 100),
        devicesLimit: parseLimit(e.devicesLimit),
        messagesLimit: parseLimit(e.messagesLimit),
        features: e.features.split("\n").map(f => f.trim()).filter(Boolean),
        isPopular: e.isPopular,
      };
      const res = await adminFetch(`/api/admin/plans/${key}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed to save");
      return res.json();
    },
    onSuccess: (_data, key) => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/plans"] });
      toast({ title: "Saved", description: `${edits[key]?.name || key} plan updated. Changes are live immediately.` });
    },
    onError: (err: any, key) => {
      toast({ title: "Error", description: err?.message || `Failed to save ${key} plan`, variant: "destructive" });
    },
  });

  const setField = (key: string, field: keyof PlanEditState, value: string | boolean) => {
    setEdits(prev => ({ ...prev, [key]: { ...prev[key], [field]: value } }));
  };

  const PLAN_ORDER = ["starter", "professional", "enterprise"];

  if (isLoading) return <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Subscription Packages</h2>
        <p className="text-sm text-muted-foreground">Edit plan details, pricing, and limits. Changes apply immediately to the billing page and payment processing.</p>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        {PLAN_ORDER.map((key) => {
          const plan = plans?.find(p => p.key === key);
          const e = edits[key];
          if (!e) return null;
          return (
            <Card key={key} className={e.isPopular ? "border-primary" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base capitalize">{key}</CardTitle>
                  {e.isPopular && <Badge className="text-[10px] py-0">Popular</Badge>}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Plan Name</Label>
                  <Input value={e.name} onChange={ev => setField(key, "name", ev.target.value)} data-testid={`input-plan-name-${key}`} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Description</Label>
                  <Input value={e.description} onChange={ev => setField(key, "description", ev.target.value)} data-testid={`input-plan-description-${key}`} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Monthly Price ($)</Label>
                    <Input type="number" min="0" step="0.01" value={e.monthlyPrice} onChange={ev => setField(key, "monthlyPrice", ev.target.value)} data-testid={`input-plan-monthly-${key}`} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Yearly Price ($)</Label>
                    <Input type="number" min="0" step="0.01" value={e.yearlyPrice} onChange={ev => setField(key, "yearlyPrice", ev.target.value)} data-testid={`input-plan-yearly-${key}`} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Devices Limit</Label>
                    <Input placeholder="e.g. 5 or unlimited" value={e.devicesLimit} onChange={ev => setField(key, "devicesLimit", ev.target.value)} data-testid={`input-plan-devices-${key}`} />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Messages/Day</Label>
                    <Input placeholder="e.g. 100 or unlimited" value={e.messagesLimit} onChange={ev => setField(key, "messagesLimit", ev.target.value)} data-testid={`input-plan-messages-${key}`} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Features (one per line)</Label>
                  <Textarea rows={5} value={e.features} onChange={ev => setField(key, "features", ev.target.value)} placeholder={"5 WhatsApp devices\nUnlimited messages\nPriority support"} className="text-xs resize-none" data-testid={`textarea-plan-features-${key}`} />
                </div>
                <div className="flex items-center gap-2 pt-1">
                  <Switch checked={e.isPopular} onCheckedChange={v => setField(key, "isPopular", v)} id={`popular-${key}`} data-testid={`switch-plan-popular-${key}`} />
                  <Label htmlFor={`popular-${key}`} className="text-xs">Mark as Popular</Label>
                </div>
                <Button className="w-full" size="sm" onClick={() => savePlan.mutate(key)} disabled={savePlan.isPending} data-testid={`button-save-plan-${key}`}>
                  {savePlan.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                  Save {e.name || key}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function AdminDashboardContent({ onLogout }: { onLogout: () => void }) {
  const { data: stats, isLoading } = useAdminQuery<AdminStats>("/api/admin/stats");

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Admin Dashboard" description="QuackAPI admin panel for managing users, devices, and platform settings." noindex={true} />
      <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
              Q
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-display font-bold" data-testid="text-admin-title">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Platform overview and management</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-amber-600 border-amber-500/30 bg-amber-500/10 gap-1 hidden sm:flex">
              <Shield className="w-3.5 h-3.5" />
              Admin
            </Badge>
            <Button variant="outline" size="sm" onClick={onLogout} className="gap-1.5 text-destructive border-destructive/30" data-testid="button-admin-logout">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
        ) : stats ? (
          <StatsCards stats={stats} />
        ) : null}

        <Tabs defaultValue="users" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="users" className="gap-1.5" data-testid="tab-admin-users">
              <Users className="w-4 h-4" /> <span className="hidden sm:inline">Users</span>
            </TabsTrigger>
            <TabsTrigger value="devices" className="gap-1.5" data-testid="tab-admin-devices">
              <Smartphone className="w-4 h-4" /> <span className="hidden sm:inline">Devices</span>
            </TabsTrigger>
            <TabsTrigger value="messages" className="gap-1.5" data-testid="tab-admin-messages">
              <MessageSquare className="w-4 h-4" /> <span className="hidden sm:inline">Messages</span>
            </TabsTrigger>
            <TabsTrigger value="payments" className="gap-1.5" data-testid="tab-admin-payments">
              <CreditCard className="w-4 h-4" /> <span className="hidden sm:inline">Payments</span>
            </TabsTrigger>
            <TabsTrigger value="plans" className="gap-1.5" data-testid="tab-admin-plans">
              <Package className="w-4 h-4" /> <span className="hidden sm:inline">Plans</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="gap-1.5" data-testid="tab-admin-settings">
              <Settings2 className="w-4 h-4" /> <span className="hidden sm:inline">Settings</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="users"><UsersTab /></TabsContent>
          <TabsContent value="devices"><DevicesTab /></TabsContent>
          <TabsContent value="messages"><MessagesTab /></TabsContent>
          <TabsContent value="payments"><PaymentsTab /></TabsContent>
          <TabsContent value="plans"><PlansTab /></TabsContent>
          <TabsContent value="settings"><SettingsTab /></TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [authenticated, setAuthenticated] = useState(!!getAdminToken());

  const handleLogout = () => {
    clearAdminToken();
    setAuthenticated(false);
  };

  if (!authenticated) {
    return <AdminLoginPage onLogin={() => setAuthenticated(true)} />;
  }

  return <AdminDashboardContent onLogout={handleLogout} />;
}
