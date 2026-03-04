import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { SiWhatsapp } from "react-icons/si";
import { useEffect } from "react";
import { GA4_MEASUREMENT_ID } from "@/lib/config";

import AuthPage from "@/pages/auth-page";
import LandingPage from "@/pages/landing-page";
import Dashboard from "@/pages/dashboard";
import DevicesPage from "@/pages/devices-page";
import DeviceDetailPage from "@/pages/device-detail-page";
import MessagesPage from "@/pages/messages-page";
import BillingPage from "@/pages/billing-page";
import ProfilePage from "@/pages/profile-page";
import AdminDashboard from "@/pages/admin-dashboard";
import TermsPage from "@/pages/terms-page";
import PrivacyPage from "@/pages/privacy-page";
import RefundPage from "@/pages/refund-page";
import ContactPage from "@/pages/contact-page";
import UseCasesPage from "@/pages/use-cases-page";
import BlogPage from "@/pages/blog-page";
import ComparePage from "@/pages/compare-page";
import DocsPage from "@/pages/docs-page";
import PricingPage from "@/pages/pricing-page";
import NotFound from "@/pages/not-found";
import LayoutShell from "@/components/layout-shell";
import { PayPalSuccessPage, PayPalCancelPage } from "@/pages/paypal-return-page";
import { Loader2 } from "lucide-react";

function GATracker() {
  const [location] = useLocation();
  useEffect(() => {
    if (typeof window !== "undefined" && typeof (window as any).gtag === "function") {
      (window as any).gtag("config", GA4_MEASUREMENT_ID, { page_path: location });
    }
  }, [location]);
  return null;
}

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <AuthPage />;
  }

  return (
    <LayoutShell>
      <Component />
    </LayoutShell>
  );
}

function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (user) {
    return (
      <LayoutShell>
        <Dashboard />
      </LayoutShell>
    );
  }

  return <LandingPage />;
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/auth/reset-password" component={AuthPage} />
      <Route path="/" component={HomePage} />
      <Route path="/dashboard" component={() => <ProtectedRoute component={Dashboard} />} />
      <Route path="/devices" component={() => <ProtectedRoute component={DevicesPage} />} />
      <Route path="/devices/:id" component={() => <ProtectedRoute component={DeviceDetailPage} />} />
      <Route path="/messages" component={() => <ProtectedRoute component={MessagesPage} />} />
      <Route path="/billing" component={() => <ProtectedRoute component={BillingPage} />} />
      <Route path="/profile" component={() => <ProtectedRoute component={ProfilePage} />} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/terms" component={TermsPage} />
      <Route path="/privacy" component={PrivacyPage} />
      <Route path="/refund" component={RefundPage} />
      <Route path="/contact" component={ContactPage} />
      <Route path="/docs" component={DocsPage} />
      <Route path="/use-cases" component={UseCasesPage} />
      <Route path="/use-cases/:slug" component={UseCasesPage} />
      <Route path="/blog" component={BlogPage} />
      <Route path="/blog/:slug" component={BlogPage} />
      <Route path="/compare" component={ComparePage} />
      <Route path="/compare/:slug" component={ComparePage} />
      <Route path="/pricing" component={PricingPage} />
      <Route path="/paypal/success" component={PayPalSuccessPage} />
      <Route path="/paypal/cancel" component={PayPalCancelPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function WhatsAppFloatButton() {
  return (
    <a
      href="https://wa.me/923122398166?text=Hi%2C+I+need+help+with+QuackAPI"
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 text-white rounded-full shadow-2xl shadow-green-500/40 flex items-center justify-center transition-all duration-200 hover:scale-110 group"
      data-testid="button-whatsapp-float"
      aria-label="Chat with us on WhatsApp"
    >
      <SiWhatsapp className="w-7 h-7" />
      <span className="absolute right-16 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none shadow-lg">
        How can I help you?
      </span>
    </a>
  );
}

function App() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <GATracker />
          <Router />
          <Toaster />
          <WhatsAppFloatButton />
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
