import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/seo";

export default function RefundPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Refund Policy" description="QuackAPI Refund Policy - Understand our refund terms and how to request a refund for QuackAPI services." canonical="/refund" />
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border/50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <button onClick={() => setLocation("/")} className="flex items-center gap-3 hover:opacity-80 transition-opacity" data-testid="link-home">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-lg shadow-lg shadow-primary/20">
              W
            </div>
            <span className="font-display font-bold text-xl">QuackAPI</span>
          </button>
          <Button variant="ghost" onClick={() => setLocation("/")} data-testid="button-back-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-16" data-testid="refund-content">
        <h1 className="font-display text-4xl font-bold mb-2">Refund Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <p className="text-muted-foreground leading-relaxed mb-12">
          At QuackAPI.com, we strive to provide high-quality services and a seamless experience for all our customers. Please read our refund policy carefully before making a purchase.
        </p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">1. General Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              All purchases of QuackAPI.com services are final. Once payment is completed, the services are considered delivered. We do not offer refunds for digital products or services that have been accessed or downloaded.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">2. Eligibility for Refund</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              A refund may only be considered in the following exceptional cases:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Duplicate charges due to system error.</li>
              <li>Payment processed but the service was not delivered.</li>
              <li>Technical issues on our end preventing access to the service for more than 48 hours after submission of a support request.</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Refund requests outside of these scenarios will not be accepted.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">3. Refund Process</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              To request a refund, please contact our support team at{" "}
              <a href="mailto:support@quackapi.com" className="text-primary hover:underline">support@quackapi.com</a>{" "}
              with:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Order number or transaction ID</li>
              <li>Detailed explanation of the issue</li>
            </ul>
            <p className="text-muted-foreground leading-relaxed mt-4">
              Our team will review your request and respond within 3–5 business days. If approved, refunds will be processed to the original payment method. Processing time may vary depending on the payment provider.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">4. Non-Refundable Cases</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Refunds will not be issued for:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>Change of mind after purchase</li>
              <li>Services already delivered and used</li>
              <li>Partial usage of a subscription or service</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">5. Subscription Services</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you have purchased a subscription:
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground">
              <li>You may cancel at any time to prevent future billing.</li>
              <li>No refunds will be issued for the current billing period after a subscription has started.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">6. Support Contact</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              If you encounter any issues, our support team is available to assist:
            </p>
            <div className="bg-muted/50 rounded-xl p-6 space-y-2">
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Email:</span>{" "}
                <a href="mailto:support@quackapi.com" className="text-primary hover:underline">support@quackapi.com</a>
              </p>
              <p className="text-muted-foreground">
                <span className="font-medium text-foreground">Response time:</span> Within 24–48 hours
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
