import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authFetch } from "@/hooks/use-auth";
import { useQueryClient } from "@tanstack/react-query";

export function PayPalSuccessPage() {
  const [, navigate] = useLocation();
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const paymentId = sessionStorage.getItem("paypal_payment_id");
    const plan = sessionStorage.getItem("paypal_plan") || "professional";
    const billingCycle = sessionStorage.getItem("paypal_billing_cycle") || "monthly";

    if (!token) {
      setErrorMsg("Missing PayPal token. Please try again.");
      setStatus("error");
      return;
    }

    authFetch("/api/paypal/capture", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId: token, paymentId: paymentId ? Number(paymentId) : null, plan, billingCycle }),
    })
      .then(async (res) => {
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.message || "Payment capture failed");
        }
        return res.json();
      })
      .then(() => {
        sessionStorage.removeItem("paypal_payment_id");
        sessionStorage.removeItem("paypal_plan");
        sessionStorage.removeItem("paypal_billing_cycle");
        queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
        queryClient.invalidateQueries({ queryKey: ["/api/payments"] });
        setStatus("success");
        setTimeout(() => navigate("/billing"), 2500);
      })
      .catch((err) => {
        setErrorMsg(err.message || "Something went wrong");
        setStatus("error");
      });
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        {status === "loading" && (
          <>
            <Loader2 className="w-14 h-14 animate-spin text-primary mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Confirming your payment...</h2>
            <p className="text-muted-foreground mt-2 text-sm">Please wait while we activate your subscription.</p>
          </>
        )}
        {status === "success" && (
          <>
            <CheckCircle2 className="w-14 h-14 text-green-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Payment Successful!</h2>
            <p className="text-muted-foreground mt-2 text-sm">Your subscription has been activated. Redirecting to billing...</p>
          </>
        )}
        {status === "error" && (
          <>
            <XCircle className="w-14 h-14 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-semibold">Payment Failed</h2>
            <p className="text-muted-foreground mt-2 text-sm">{errorMsg}</p>
            <Button className="mt-6" onClick={() => navigate("/billing")}>
              Back to Billing
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

export function PayPalCancelPage() {
  const [, navigate] = useLocation();

  useEffect(() => {
    sessionStorage.removeItem("paypal_payment_id");
    sessionStorage.removeItem("paypal_plan");
    sessionStorage.removeItem("paypal_billing_cycle");
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center max-w-md px-6">
        <XCircle className="w-14 h-14 text-muted-foreground mx-auto mb-4" />
        <h2 className="text-xl font-semibold">Payment Cancelled</h2>
        <p className="text-muted-foreground mt-2 text-sm">
          You were not charged. You can try again anytime from your billing page.
        </p>
        <Button className="mt-6" onClick={() => navigate("/billing")}>
          Back to Billing
        </Button>
      </div>
    </div>
  );
}
