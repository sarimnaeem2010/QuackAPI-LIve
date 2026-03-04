import { useState, useRef } from "react";
import { format, formatDistanceToNow } from "date-fns";
import {
  Check,
  CreditCard,
  Loader2,
  Zap,
  Shield,
  Crown,
  XCircle,
  CheckCircle2,
  Clock,
  ArrowRight,
  Smartphone,
  MessageSquare,
  Webhook,
  Image,
  FileText,
  KeyRound,
  Headphones,
  Infinity,
  CalendarDays,
  ArrowUpRight,
  RefreshCw,
  Download,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { PayPalScriptProvider, PayPalButtons, FUNDING } from "@paypal/react-paypal-js";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { usePayments } from "@/hooks/use-payments";
import { useAuth, authFetch } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import SEO from "@/components/seo";
import { queryClient } from "@/lib/queryClient";

type PlanKey = "starter" | "professional" | "enterprise";

type ApiPlan = {
  id: number; key: string; name: string; description: string;
  monthlyPrice: number; yearlyPrice: number; devicesLimit: number;
  messagesLimit: number; features: string[]; isPopular: boolean; sortOrder: number;
};

const PLAN_META: Record<PlanKey, { icon: any; color: string; bgColor: string; borderColor: string }> = {
  starter: { icon: Zap, color: "text-muted-foreground", bgColor: "bg-muted/50", borderColor: "border-border/50" },
  professional: { icon: Crown, color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/30" },
  enterprise: { icon: Shield, color: "text-purple-600", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
};

const PLAN_FALLBACK = {
  starter: { name: "Starter", description: "Get started with basic WhatsApp API access", monthlyPrice: 0, yearlyPrice: 0, devicesLimit: 1, messagesLimit: 100, features: ["1 WhatsApp device","100 messages/day","REST API access","Basic support"], isPopular: false },
  professional: { name: "Professional", description: "For growing businesses that need more", monthlyPrice: 2900, yearlyPrice: 29000, devicesLimit: 5, messagesLimit: -1, features: ["5 WhatsApp devices","Unlimited messages","Webhook callbacks","Priority support"], isPopular: true },
  enterprise: { name: "Enterprise", description: "For large teams with advanced needs", monthlyPrice: 9900, yearlyPrice: 99000, devicesLimit: -1, messagesLimit: -1, features: ["Unlimited devices","Unlimited messages","Full API access","Dedicated support"], isPopular: false },
};

function usePlans() {
  const { data } = useQuery<ApiPlan[]>({ queryKey: ["/api/plans"] });
  const byKey = (data || []).reduce((acc, p) => ({ ...acc, [p.key]: p }), {} as Record<string, ApiPlan>);
  const defaultMeta = { icon: Zap, color: "text-muted-foreground", bgColor: "bg-muted/50", borderColor: "border-border/50" };
  const get = (key: PlanKey) => {
    const apiData = byKey[key] || { key, ...PLAN_FALLBACK[key] };
    const meta = PLAN_META[key] || defaultMeta;
    return { ...apiData, ...meta };
  };
  return { get, ready: !!data };
}

const PLANS = {
  starter: {
    name: "Starter",
    icon: Zap,
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Get started with basic WhatsApp API access",
    features: [
      { text: "1 WhatsApp device", icon: Smartphone },
      { text: "100 messages/day", icon: MessageSquare },
      { text: "REST API access", icon: KeyRound },
      { text: "QR code pairing", icon: Check },
      { text: "Basic support", icon: Headphones },
    ],
    color: "text-muted-foreground",
    bgColor: "bg-muted/50",
    borderColor: "border-border/50",
  },
  professional: {
    name: "Professional",
    icon: Crown,
    monthlyPrice: 29,
    yearlyPrice: 290,
    description: "For growing businesses that need more",
    features: [
      { text: "5 WhatsApp devices", icon: Smartphone },
      { text: "Unlimited messages", icon: Infinity },
      { text: "REST API access", icon: KeyRound },
      { text: "Webhook callbacks", icon: Webhook },
      { text: "Image & PDF messages", icon: Image },
      { text: "OTP message support", icon: Shield },
      { text: "Priority support", icon: Headphones },
    ],
    color: "text-primary",
    bgColor: "bg-primary/10",
    borderColor: "border-primary/30",
  },
  enterprise: {
    name: "Enterprise",
    icon: Shield,
    monthlyPrice: 99,
    yearlyPrice: 990,
    description: "For large teams with advanced needs",
    features: [
      { text: "Unlimited devices", icon: Smartphone },
      { text: "Unlimited messages", icon: Infinity },
      { text: "Full API access", icon: KeyRound },
      { text: "Webhook callbacks", icon: Webhook },
      { text: "All message types", icon: FileText },
      { text: "Dedicated support", icon: Headphones },
      { text: "Custom integrations", icon: Check },
      { text: "SLA guarantee", icon: Shield },
    ],
    color: "text-purple-600",
    bgColor: "bg-purple-500/10",
    borderColor: "border-purple-500/30",
  },
} as const;

export default function BillingPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { data: payments, isLoading: paymentsLoading } = usePayments();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [selectedPlanForPayment, setSelectedPlanForPayment] = useState<PlanKey>("professional");
  const [changePlanDialogOpen, setChangePlanDialogOpen] = useState(false);

  const plans = usePlans();
  const currentPlan = ((user as any)?.plan as PlanKey) || "starter";
  const isActive = user?.subscriptionStatus === "active";
  const planExpiresAt = (user as any)?.planExpiresAt ? new Date((user as any).planExpiresAt) : null;
  const userBillingCycle = (user as any)?.billingCycle || "monthly";
  const currentPlanData = plans.get(currentPlan);
  const currentPrice = userBillingCycle === "yearly" ? currentPlanData.yearlyPrice / 100 : currentPlanData.monthlyPrice / 100;

  const activateMutation = useMutation({
    mutationFn: async ({ paymentId, plan, billingCycle: cycle }: { paymentId: number; plan: string; billingCycle: string }) => {
      const res = await authFetch(`/api/payments/${paymentId}/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billingCycle: cycle }),
      });
      if (!res.ok) throw new Error("Failed to activate subscription");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
      setPaymentDialogOpen(false);
      setChangePlanDialogOpen(false);
      toast({ title: "Plan Activated", description: "Your plan has been updated successfully." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const changePlanMutation = useMutation({
    mutationFn: async ({ plan, billingCycle: cycle }: { plan: string; billingCycle: string }) => {
      const res = await authFetch("/api/subscription/change-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, billingCycle: cycle }),
      });
      if (!res.ok) throw new Error("Failed to change plan");
      return await res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      setChangePlanDialogOpen(false);
      toast({ title: "Plan Changed", description: data.message });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await authFetch("/api/subscription/cancel", { method: "POST" });
      if (!res.ok) throw new Error("Failed to cancel subscription");
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
      toast({ title: "Subscription Cancelled", description: "You've been moved to the Starter plan." });
    },
    onError: (err) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });


  const handleSelectPlanInDialog = (planKey: PlanKey) => {
    if (planKey === currentPlan) return;

    if (planKey === "starter") {
      if (confirm("Downgrade to Starter? You'll lose API access and paid features.")) {
        changePlanMutation.mutate({ plan: "starter", billingCycle });
      }
      return;
    }

    if (isActive && currentPlan !== "starter") {
      if (confirm(`Switch from ${plans.get(currentPlan).name} to ${plans.get(planKey).name}?`)) {
        changePlanMutation.mutate({ plan: planKey, billingCycle });
      }
      return;
    }

    setSelectedPlanForPayment(planKey);
    setChangePlanDialogOpen(false);
    setPaymentDialogOpen(true);
  };


  const downloadInvoice = async (paymentId: number) => {
    try {
      const res = await authFetch(`/api/invoices/${paymentId}`);
      if (!res.ok) throw new Error("Failed to fetch invoice");
      const invoice = await res.json();
      const invoiceHtml = `
<!DOCTYPE html>
<html><head><title>Invoice ${invoice.invoiceNumber}</title>
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; margin: 0; padding: 40px; color: #1a1a1a; }
  .header { display: flex; justify-content: space-between; align-items: start; margin-bottom: 40px; }
  .logo { font-size: 28px; font-weight: bold; color: #6C47FF; }
  .logo-sub { font-size: 12px; color: #888; }
  .invoice-title { text-align: right; }
  .invoice-title h1 { font-size: 32px; margin: 0; color: #333; }
  .invoice-title p { margin: 4px 0; color: #888; font-size: 14px; }
  .details { display: flex; justify-content: space-between; margin-bottom: 30px; }
  .details-section h3 { font-size: 12px; text-transform: uppercase; color: #888; margin-bottom: 8px; }
  .details-section p { margin: 4px 0; font-size: 14px; }
  table { width: 100%; border-collapse: collapse; margin: 20px 0; }
  th { background: #f5f5f5; text-align: left; padding: 12px; font-size: 12px; text-transform: uppercase; color: #888; border-bottom: 2px solid #eee; }
  td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
  .total-row { font-weight: bold; font-size: 16px; }
  .total-row td { border-top: 2px solid #333; border-bottom: none; }
  .status { display: inline-block; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; }
  .status-completed { background: #e8f5e9; color: #2e7d32; }
  .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #999; border-top: 1px solid #eee; padding-top: 20px; }
</style></head><body>
<div class="header">
  <div><div class="logo">QuackAPI</div><div class="logo-sub">WhatsApp API Platform</div></div>
  <div class="invoice-title"><h1>INVOICE</h1><p>${invoice.invoiceNumber}</p><p>${invoice.date}</p></div>
</div>
<div class="details">
  <div class="details-section"><h3>Bill To</h3><p><strong>${invoice.customerName}</strong></p><p>${invoice.customerEmail}</p></div>
  <div class="details-section"><h3>Payment Info</h3><p>Gateway: <strong style="text-transform:capitalize">${invoice.gateway}</strong></p><p>Transaction: ${invoice.transactionId}</p><p>Status: <span class="status status-${invoice.status}">${invoice.status}</span></p></div>
</div>
<table>
  <thead><tr><th>Description</th><th>Plan</th><th style="text-align:right">Amount</th></tr></thead>
  <tbody>
    <tr><td>QuackAPI API Subscription</td><td style="text-transform:capitalize">${invoice.plan}</td><td style="text-align:right">$${(invoice.amount / 100).toFixed(2)} ${invoice.currency.toUpperCase()}</td></tr>
    <tr class="total-row"><td colspan="2">Total</td><td style="text-align:right">$${(invoice.amount / 100).toFixed(2)} ${invoice.currency.toUpperCase()}</td></tr>
  </tbody>
</table>
<div class="footer"><p>Thank you for choosing QuackAPI!</p><p>If you have questions about this invoice, contact support@quackapi.com</p></div>
</body></html>`;
      const blob = new Blob([invoiceHtml], { type: "text/html" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${invoice.invoiceNumber}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({ title: "Invoice Downloaded", description: `${invoice.invoiceNumber} has been saved.` });
    } catch (err) {
      toast({ title: "Error", description: "Failed to download invoice", variant: "destructive" });
    }
  };

  const isPending = activateMutation.isPending || changePlanMutation.isPending;

  const isExpiringSoon = planExpiresAt && (planExpiresAt.getTime() - Date.now()) < 7 * 24 * 60 * 60 * 1000;

  const { data: usageData } = useQuery<{ plan: string; devices: { used: number; limit: number }; messages: { today: number; limit: number } }>({
    queryKey: ["/api/usage"],
    queryFn: async () => {
      const res = await authFetch("/api/usage");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="space-y-6">
      <SEO title="Billing & Plans" description="Manage your QuackAPI subscription plan, view payment history, and download invoices." noindex={true} />
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground" data-testid="text-billing-title">Billing & Plans</h1>
        <p className="text-muted-foreground mt-1">Manage your subscription and billing details.</p>
      </div>

      <Card data-testid="card-current-plan">
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl ${currentPlanData.bgColor} flex items-center justify-center shrink-0`}>
                <currentPlanData.icon className={`w-6 h-6 sm:w-7 sm:h-7 ${currentPlanData.color}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-lg sm:text-xl">{currentPlanData.name} Plan</h3>
                  <Badge
                    className={isActive
                      ? "bg-green-500/20 text-green-600 border-green-500/30"
                      : "bg-muted text-muted-foreground border-border"
                    }
                    data-testid="badge-subscription-status"
                  >
                    {isActive ? "Active" : currentPlan === "starter" ? "Free" : "Inactive"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{currentPlanData.description}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Price</p>
                  <p className="text-sm font-semibold" data-testid="text-plan-price">
                    {currentPrice === 0 ? "Free" : `$${currentPrice}/${userBillingCycle === "yearly" ? "yr" : "mo"}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Billing Cycle</p>
                  <p className="text-sm font-semibold capitalize" data-testid="text-billing-cycle">
                    {currentPlan === "starter" ? "N/A" : userBillingCycle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                <CalendarDays className={`w-4 h-4 shrink-0 ${isExpiringSoon ? "text-yellow-500" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-xs text-muted-foreground">
                    {isActive ? "Renewal Date" : "Expiry Date"}
                  </p>
                  <p className={`text-sm font-semibold ${isExpiringSoon ? "text-yellow-600" : ""}`} data-testid="text-plan-expiry">
                    {planExpiresAt
                      ? `${format(planExpiresAt, "MMM d, yyyy")} (${formatDistanceToNow(planExpiresAt, { addSuffix: true })})`
                      : currentPlan === "starter" ? "Never" : "—"
                    }
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Device Limit</p>
                  <p className="text-sm font-semibold" data-testid="text-device-limit">
                    {currentPlanData.devicesLimit === -1 ? "Unlimited" : String(currentPlanData.devicesLimit)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Messages</p>
                  <p className="text-sm font-semibold" data-testid="text-message-limit">
                    {currentPlanData.messagesLimit === -1 ? "Unlimited" : `${currentPlanData.messagesLimit}/day`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Shield className={`w-4 h-4 shrink-0 ${isActive ? "text-green-500" : "text-muted-foreground"}`} />
                <div>
                  <p className="text-xs text-muted-foreground">API Access</p>
                  <p className={`text-sm font-semibold ${isActive ? "text-green-600" : ""}`} data-testid="text-api-status">
                    {isActive ? "Enabled" : "Disabled"}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-border/50">
              <Button
                onClick={() => setChangePlanDialogOpen(true)}
                disabled={isPending}
                className="w-full sm:w-auto"
                data-testid="button-change-plan"
              >
                <ArrowUpRight className="w-4 h-4 mr-2" />
                {currentPlan === "starter" ? "Upgrade Plan" : "Change Plan"}
              </Button>
              {isActive && currentPlan !== "starter" && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive w-full sm:w-auto"
                  onClick={() => {
                    if (confirm("Cancel your subscription? You'll be moved to the free Starter plan.")) {
                      cancelMutation.mutate();
                    }
                  }}
                  disabled={cancelMutation.isPending}
                  data-testid="button-cancel-subscription"
                >
                  {cancelMutation.isPending ? <Loader2 className="w-3 h-3 mr-1 animate-spin" /> : <XCircle className="w-3 h-3 mr-1" />}
                  Cancel Subscription
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {isExpiringSoon && planExpiresAt && (
        <Card className="border-yellow-500/30 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
            <div>
              <p className="text-sm font-medium">Your subscription expires {formatDistanceToNow(planExpiresAt, { addSuffix: true })}</p>
              <p className="text-xs text-muted-foreground">Renew your plan to keep using premium features.</p>
            </div>
          </CardContent>
        </Card>
      )}

      {usageData && (() => {
        const devUsed = usageData.devices.used;
        const devLimit = usageData.devices.limit;
        const devUnlimited = devLimit === -1;
        const devPct = devUnlimited ? 0 : Math.min((devUsed / devLimit) * 100, 100);
        const devBarColor = devPct >= 85 ? "bg-red-500" : devPct >= 60 ? "bg-yellow-500" : "bg-green-500";

        const msgUsed = usageData.messages.today;
        const msgLimit = usageData.messages.limit;
        const msgUnlimited = msgLimit === -1;
        const msgPct = msgUnlimited ? 0 : Math.min((msgUsed / msgLimit) * 100, 100);
        const msgBarColor = msgPct >= 85 ? "bg-red-500" : msgPct >= 60 ? "bg-yellow-500" : "bg-green-500";
        const showMsgWarning = !msgUnlimited && msgPct >= 80;

        return (
          <Card data-testid="card-usage">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4" />
                Current Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {showMsgWarning && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/20 text-sm text-yellow-700 dark:text-yellow-400">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>You're approaching your daily message limit. Consider upgrading your plan.</span>
                </div>
              )}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5 text-muted-foreground" /> Devices</span>
                  <span className="text-muted-foreground">{devUsed} / {devUnlimited ? "Unlimited" : devLimit}</span>
                </div>
                {!devUnlimited && (
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${devBarColor}`} style={{ width: `${devPct}%` }} />
                  </div>
                )}
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium flex items-center gap-1.5"><MessageSquare className="w-3.5 h-3.5 text-muted-foreground" /> Messages Today</span>
                  <span className="text-muted-foreground">{msgUsed} / {msgUnlimited ? "Unlimited" : msgLimit}</span>
                </div>
                {!msgUnlimited && (
                  <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all ${msgBarColor}`} style={{ width: `${msgPct}%` }} />
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })()}

      {user?.apiKey && isActive && (
        <Card data-testid="card-api-key">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <KeyRound className="w-4 h-4" />
              API Key
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-3 bg-muted/50 rounded-lg border border-dashed">
              <code className="text-xs font-mono break-all" data-testid="text-api-key">{user.apiKey}</code>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Use this key in the Authorization header for API requests.</p>
          </CardContent>
        </Card>
      )}

      <Card data-testid="card-payment-history">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Payment History</CardTitle>
        </CardHeader>
        <CardContent>
          {paymentsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : !payments || payments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              <CreditCard className="w-8 h-8 mx-auto mb-2 opacity-20" />
              <p className="text-sm">No payments yet</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {[...payments].reverse().map((payment) => (
                <div key={payment.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 rounded-lg bg-muted/30" data-testid={`row-payment-${payment.id}`}>
                  <div className="flex items-center gap-3">
                    <div className="shrink-0">
                      {payment.status === "completed" && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                      {payment.status === "pending" && <Clock className="w-4 h-4 text-yellow-500" />}
                      {payment.status === "failed" && <XCircle className="w-4 h-4 text-red-500" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-medium capitalize">{payment.gateway}</p>
                      <p className="text-[10px] text-muted-foreground truncate">
                        {payment.createdAt ? format(new Date(payment.createdAt), "MMM d, yyyy 'at' h:mm a") : ""}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 ml-7 sm:ml-0">
                    {payment.status === "completed" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs"
                        onClick={() => downloadInvoice(payment.id)}
                        data-testid={`button-invoice-${payment.id}`}
                      >
                        <Download className="w-3 h-3 mr-1" />
                        Invoice
                      </Button>
                    )}
                    <div className="text-right">
                      <p className="text-sm font-semibold">${(payment.amount / 100).toFixed(2)}</p>
                      <Badge
                        variant={payment.status === "completed" ? "default" : payment.status === "pending" ? "secondary" : "destructive"}
                        className="text-[10px] capitalize"
                      >
                        {payment.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <ChangePlanDialog
        open={changePlanDialogOpen}
        onOpenChange={setChangePlanDialogOpen}
        currentPlan={currentPlan}
        isActive={isActive}
        billingCycle={billingCycle}
        onBillingCycleChange={setBillingCycle}
        onSelectPlan={handleSelectPlanInDialog}
        isPending={isPending}
      />

      <PaymentDialog
        open={paymentDialogOpen}
        onOpenChange={setPaymentDialogOpen}
        planKey={selectedPlanForPayment}
        billingCycle={billingCycle}
        onSuccess={() => {
          setPaymentDialogOpen(false);
          queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
          queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
        }}
      />
    </div>
  );
}

function ChangePlanDialog({
  open,
  onOpenChange,
  currentPlan,
  isActive,
  billingCycle,
  onBillingCycleChange,
  onSelectPlan,
  isPending,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentPlan: PlanKey;
  isActive: boolean;
  billingCycle: "monthly" | "yearly";
  onBillingCycleChange: (cycle: "monthly" | "yearly") => void;
  onSelectPlan: (plan: PlanKey) => void;
  isPending: boolean;
}) {
  const apiPlans = usePlans();

  const getButtonLabel = (planKey: PlanKey) => {
    if (planKey === currentPlan) return "Current Plan";
    if (planKey === "starter" && currentPlan !== "starter") return "Downgrade";
    const order: PlanKey[] = ["starter", "professional", "enterprise"];
    if (order.indexOf(planKey) > order.indexOf(currentPlan)) return "Upgrade";
    return "Switch";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-change-plan">
        <DialogHeader>
          <DialogTitle>Change Plan</DialogTitle>
          <DialogDescription>Choose the plan that best fits your needs.</DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-3 pt-2">
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === "monthly" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => onBillingCycleChange("monthly")}
            data-testid="tab-monthly"
          >
            Monthly
          </button>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              billingCycle === "yearly" ? "bg-primary text-primary-foreground shadow-md" : "bg-muted text-muted-foreground hover:bg-muted/80"
            }`}
            onClick={() => onBillingCycleChange("yearly")}
            data-testid="tab-yearly"
          >
            Yearly
            <Badge variant="secondary" className="ml-2 text-[10px] py-0">Save 17%</Badge>
          </button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 pt-2">
          {(["starter", "professional", "enterprise"] as PlanKey[]).map((planKey) => {
            const plan = apiPlans.get(planKey);
            const isCurrent = planKey === currentPlan;
            const rawPrice = billingCycle === "monthly" ? plan.monthlyPrice : plan.yearlyPrice;
            const price = rawPrice / 100;
            const period = billingCycle === "monthly" ? "/mo" : "/yr";
            const isPopular = plan.isPopular;

            return (
              <div
                key={planKey}
                className={`relative rounded-2xl p-6 transition-all duration-300 flex flex-col ${
                  isPopular
                    ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/25 border-2 border-primary md:scale-105"
                    : isCurrent
                      ? `${plan.bgColor.replace('/10', '/5').replace('/50', '/10')} border-2 ${plan.borderColor}`
                      : "bg-background border border-border/50 hover:shadow-lg"
                }`}
                data-testid={`card-plan-${planKey}`}
              >
                {isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-4 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                {isCurrent && !isPopular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-3 py-1 rounded-full">
                    Current
                  </div>
                )}

                <div className={`w-10 h-10 rounded-lg ${isPopular ? "bg-primary-foreground/20" : plan.bgColor} flex items-center justify-center mb-3`}>
                  <plan.icon className={`w-5 h-5 ${isPopular ? "text-primary-foreground" : plan.color}`} />
                </div>

                <h3 className="font-display text-lg font-semibold mb-1">{plan.name}</h3>
                <p className={`text-xs mb-3 ${isPopular ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1 mb-4">
                  <span className="text-3xl font-bold">
                    {price === 0 ? "Free" : `$${price.toFixed(2)}`}
                  </span>
                  {price > 0 && <span className={isPopular ? "text-primary-foreground/70" : "text-muted-foreground"}>{period}</span>}
                </div>

                <ul className="space-y-2 mb-5 flex-1">
                  {(plan.features as (string | { text: string })[]).map((feature, j) => (
                    <li key={j} className="flex items-center gap-2 text-sm">
                      <Check className={`w-4 h-4 flex-shrink-0 ${isPopular ? "text-primary-foreground" : plan.color}`} />
                      <span>{typeof feature === "string" ? feature : feature.text}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className={`w-full ${
                    isPopular && !isCurrent
                      ? "bg-background text-foreground hover:bg-background/90"
                      : isCurrent ? "opacity-50" : "shadow-lg shadow-primary/25"
                  }`}
                  variant={isPopular && !isCurrent ? "secondary" : isCurrent ? "outline" : "default"}
                  disabled={isCurrent || isPending}
                  onClick={() => onSelectPlan(planKey)}
                  data-testid={`button-select-plan-${planKey}`}
                >
                  {isPending && !isCurrent ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  {getButtonLabel(planKey)}
                  {!isCurrent && <ArrowRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}

function PaymentDialog({
  open,
  onOpenChange,
  planKey,
  billingCycle,
  onSuccess,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  planKey: PlanKey;
  billingCycle: "monthly" | "yearly";
  onSuccess: () => void;
}) {
  const apiPlans = usePlans();
  const plan = apiPlans.get(planKey);
  const price = billingCycle === "monthly" ? plan.monthlyPrice / 100 : plan.yearlyPrice / 100;
  const { toast } = useToast();
  const paymentIdRef = useRef<number | null>(null);

  const { data: paypalConfig, isLoading: configLoading, error: configError } = useQuery<{ clientId: string; mode: string }>({
    queryKey: ["/api/paypal/client-id"],
    enabled: open,
  });

  const handleCreateOrder = async () => {
    const res = await authFetch("/api/paypal/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey, billingCycle }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || "Failed to create order");
    }
    const data = await res.json();
    paymentIdRef.current = data.paymentId;
    return data.orderId as string;
  };

  const handleApprove = async (data: { orderID: string }) => {
    try {
      const res = await authFetch("/api/paypal/capture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderId: data.orderID,
          paymentId: paymentIdRef.current,
          plan: planKey,
          billingCycle,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Payment capture failed");
      }
      toast({ title: "Payment Successful!", description: `Your ${plan.name} plan is now active.` });
      onSuccess();
    } catch (err: any) {
      toast({ title: "Payment Error", description: err.message, variant: "destructive" });
    }
  };

  const handleError = (err: Record<string, unknown>) => {
    console.error("PayPal error:", err);
    toast({ title: "Payment Failed", description: "Something went wrong. Please try again.", variant: "destructive" });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" data-testid="dialog-payment">
        <DialogHeader>
          <DialogTitle>Subscribe to {plan.name}</DialogTitle>
          <DialogDescription>
            ${price.toFixed(2)}/{billingCycle === "monthly" ? "month" : "year"} — Pay securely with your card or PayPal account. No PayPal account required.
          </DialogDescription>
        </DialogHeader>

        <div className="pt-2 min-h-[120px]">
          {configLoading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          )}
          {configError && (
            <p className="text-sm text-destructive text-center py-4">
              Failed to load payment options. Please refresh and try again.
            </p>
          )}
          {paypalConfig && (
            <PayPalScriptProvider
              options={{
                clientId: paypalConfig.clientId,
                currency: "USD",
                intent: "capture",
                components: "buttons",
              }}
            >
              <div className="space-y-3" data-testid="paypal-buttons-container">
                <PayPalButtons
                  fundingSource={FUNDING.CARD}
                  style={{ layout: "vertical", shape: "rect", label: "pay", height: 45 }}
                  createOrder={handleCreateOrder}
                  onApprove={handleApprove}
                  onError={handleError}
                  data-testid="button-pay-card"
                />
                <PayPalButtons
                  fundingSource={FUNDING.PAYPAL}
                  style={{ layout: "vertical", shape: "rect", label: "pay", height: 45 }}
                  createOrder={handleCreateOrder}
                  onApprove={handleApprove}
                  onError={handleError}
                  data-testid="button-pay-paypal"
                />
              </div>
            </PayPalScriptProvider>
          )}
        </div>

        <p className="text-xs text-center text-muted-foreground pb-1">
          Payments are securely processed by PayPal. No PayPal account needed for card payments.
        </p>
      </DialogContent>
    </Dialog>
  );
}
