import { useState } from "react";
import { useAuth, authFetch } from "@/hooks/use-auth";
import { useDevices } from "@/hooks/use-devices";
import { useMessages } from "@/hooks/use-messages";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Copy, 
  Smartphone, 
  MessageSquare, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp,
  Activity,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import SEO from "@/components/seo";

function UsageTodayCard() {
  const { data: usage, isLoading } = useQuery<{ plan: string; devices: { used: number; limit: number }; messages: { today: number; limit: number } }>({
    queryKey: ["/api/usage"],
    queryFn: async () => {
      const res = await authFetch("/api/usage");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  const msgToday = usage?.messages.today || 0;
  const msgLimit = usage?.messages.limit || 100;
  const isUnlimited = msgLimit === -1;
  const pct = isUnlimited ? 0 : Math.min((msgToday / msgLimit) * 100, 100);
  const barColor = pct >= 85 ? "bg-red-500" : pct >= 60 ? "bg-yellow-500" : "bg-green-500";

  return (
    <Card className="shadow-sm hover:shadow-md transition-shadow">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Messages Today</CardTitle>
        <TrendingUp className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-2xl font-bold">—</div>
        ) : (
          <>
            <div className="text-2xl font-bold">{msgToday}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {isUnlimited ? "Unlimited plan" : `of ${msgLimit} daily limit`}
            </p>
            {!isUnlimited && (
              <div className="mt-2 h-1.5 w-full bg-muted rounded-full overflow-hidden">
                <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: devices } = useDevices();
  const { data: messages } = useMessages();
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    if (user?.apiKey) {
      navigator.clipboard.writeText(user.apiKey);
      setCopied(true);
      toast({ title: "Copied!", description: "API Key copied to clipboard." });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const connectedDevices = devices?.filter(d => d.status === 'connected') || [];
  const pendingDevices = devices?.filter(d => d.status === 'pending' || d.status === 'disconnected') || [];

  const { data: trafficData, isLoading: trafficLoading } = useQuery<{ date: string; sent: number; failed: number; pending: number }[]>({
    queryKey: ["/api/messages/traffic"],
    queryFn: async () => {
      const res = await authFetch("/api/messages/traffic");
      if (!res.ok) throw new Error("Failed to fetch traffic");
      return res.json();
    },
  });

  const chartData = (trafficData || []).map(d => ({ name: d.date, sent: d.sent, failed: d.failed }));

  return (
    <div className="space-y-8">
      <SEO title="Dashboard" description="Your QuackAPI dashboard - monitor connected devices, message stats, and API usage." noindex={true} />
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-2">Welcome back, {user?.name}. Here's what's happening today.</p>
      </div>

      {/* API Key Section */}
      <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Your API Key
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                Use this key to authenticate your requests to our API. Keep it secret.
              </p>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto bg-background p-1.5 rounded-lg border shadow-sm">
              <code className="flex-1 font-mono text-sm px-3 py-1 text-muted-foreground truncate max-w-[200px] md:max-w-[300px]">
                {user?.apiKey}
              </code>
              <Button size="sm" variant={copied ? "default" : "outline"} onClick={copyApiKey}>
                {copied ? <CheckCircle2 className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? "Copied" : "Copy"}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Devices</CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{devices?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {connectedDevices.length} connected
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Messages Sent</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{messages?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {messages?.filter(m => m.status === 'sent').length || 0} sent, {messages?.filter(m => m.status === 'failed').length || 0} failed
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Subscription</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold capitalize">{(user as any)?.plan || 'starter'}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {user?.subscriptionStatus === 'active' ? 'Full API access enabled' : 'Subscribe to enable API'}
            </p>
          </CardContent>
        </Card>

        <UsageTodayCard />
      </div>

      {/* Analytics Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Message Traffic</CardTitle>
            <CardDescription>Daily message volume over the last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              {trafficLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : chartData.length === 0 || chartData.every(d => d.sent === 0 && d.failed === 0) ? (
                <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                  <MessageSquare className="w-10 h-10 mb-2 opacity-20" />
                  <p className="text-sm">No message activity yet</p>
                  <p className="text-xs mt-1">Send messages to see traffic data here</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} vertical={false} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tickMargin={10} fontSize={12} />
                    <YAxis axisLine={false} tickLine={false} fontSize={12} />
                    <Tooltip 
                      cursor={{ fill: 'transparent' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                    />
                    <Bar dataKey="sent" name="Sent" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    <Bar dataKey="failed" name="Failed" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Device Status List */}
        <Card>
          <CardHeader>
            <CardTitle>Device Health</CardTitle>
            <CardDescription>Status of your connected devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {devices && devices.length > 0 ? (
                devices.map((device) => (
                  <div key={device.id} className="flex items-center justify-between p-3 rounded-lg border bg-muted/30">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${device.status === 'connected' ? 'bg-green-500' : 'bg-red-500'}`} />
                      <div>
                        <p className="text-sm font-medium">{device.deviceName}</p>
                        <p className="text-xs text-muted-foreground">{device.status}</p>
                      </div>
                    </div>
                    {device.status === 'disconnected' && (
                      <Button size="sm" variant="ghost" className="text-xs h-7 text-destructive">Reconnect</Button>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Smartphone className="w-8 h-8 mx-auto mb-2 opacity-20" />
                  <p className="text-sm">No devices connected</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
