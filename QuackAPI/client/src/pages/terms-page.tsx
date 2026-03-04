import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/seo";

export default function TermsPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Terms of Service" description="QuackAPI Terms of Service - Read our terms and conditions for using the WhatsApp API platform." canonical="/terms" />
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

      <main className="max-w-4xl mx-auto px-6 py-16" data-testid="terms-content">
        <h1 className="font-display text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground leading-relaxed">
              By accessing and using QuackAPI (the "Service"), you agree to be bound by these Terms of Service (the "Terms"). If you do not agree to these Terms, you should immediately cease using the Service. These Terms constitute a legally binding agreement between you and QuackAPI.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">2. Description of Service</h2>
            <p className="text-muted-foreground leading-relaxed">
              QuackAPI provides a WhatsApp API platform that allows users to connect WhatsApp devices, send messages through a REST API, and receive incoming messages via webhooks. The Service is designed for developers and businesses who require programmatic access to WhatsApp messaging capabilities.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">3. User Obligations</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              By using the Service, the client undertakes to obtain in advance from the user to whom the message is to be sent consent in any form, such as oral, written, email, or other verifiable means.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              The customer is obligated not to send any message that falls under the following prohibited activities:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>Spam or unsolicited bulk messages</li>
              <li>Messages that may cause malfunction of the platform's equipment or infrastructure</li>
              <li>Messages containing pornographic, offensive, or otherwise objectionable content</li>
              <li>Messages that mislead recipients, such as those sent under false identity or containing false information</li>
              <li>Transmission of inaccurate or confidential information without authorization</li>
              <li>Transfer of information that has been unlawfully obtained or violates the copyrights or related rights of third parties</li>
              <li>Advertising of alcohol, tobacco, drugs, or other illegal substances</li>
              <li>Transmission of information that violates the norms of applicable legislation or international law</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">4. Communication with WhatsApp Inc. & Disclaimers</h2>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
              <li>The Service and the QuackAPI platform are not supported, endorsed, or approved in any way by WhatsApp Inc. The Customer understands all risks associated with the use of the Service, platform, and API.</li>
              <li>QuackAPI is not responsible for the Customer's inability to access the Service, API, or accounts for reasons related to disruption of the Internet channel, equipment, or software of the Customer.</li>
              <li>The Customer agrees that their WhatsApp account may be blocked and/or banned by WhatsApp and/or WhatsApp Inc. at any time.</li>
              <li>QuackAPI is not responsible for the Customer's inability to access the Service or API due to software changes made by WhatsApp Inc.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">5. Website Usage</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You are permitted to print and download extracts from the Website for your own use on the following basis:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>No documents or related graphics on the Website are modified in any way</li>
              <li>No graphics on the Website are used separately from accompanying text</li>
              <li>Our copyright and trade mark notices and this permission notice appear in all copies</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">6. Subscription & Refunds</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              You can open a trial account for free. Therefore, paid subscription fees are non-refundable.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              You can cancel your subscription at any time, and your instance will remain active until the end of the subscription term. Cancellation of the subscription must be made before the start date of the next billing cycle.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">7. Intellectual Property</h2>
            <p className="text-muted-foreground leading-relaxed">
              All content on the QuackAPI platform, including but not limited to text, graphics, logos, icons, software, and documentation, is the property of QuackAPI and is protected by applicable intellectual property laws. You may not reproduce, distribute, or create derivative works without our prior written consent.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">8. Limitation of Liability</h2>
            <p className="text-muted-foreground leading-relaxed">
              To the maximum extent permitted by applicable law, QuackAPI shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly, or any loss of data, use, goodwill, or other intangible losses resulting from your use of the Service.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">9. Miscellaneous</h2>
            <ul className="list-disc pl-6 space-y-3 text-muted-foreground">
              <li>If any part of these Terms of Service are found to be unenforceable, the enforceability of any other part of these Terms will not be affected.</li>
              <li>These Terms set out the whole of our agreement relating to use of and access to the Website and Service. They may not be varied by you at any time.</li>
              <li>Nothing said by any person on our behalf should be understood as a variation of these Terms or an authorized representation about the Website or the nature and quality of services provided.</li>
              <li>We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the Service after any changes constitutes acceptance of the new Terms.</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">10. Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions about these Terms of Service, please contact us through our{" "}
              <button onClick={() => setLocation("/contact")} className="text-primary hover:underline" data-testid="link-contact">
                Contact page
              </button>.
            </p>
          </section>
        </div>
      </main>

      <footer className="border-t border-border/50 py-8 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} QuackAPI. All rights reserved.</p>
      </footer>
    </div>
  );
}
