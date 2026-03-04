import { useLocation } from "wouter";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import SEO from "@/components/seo";

export default function PrivacyPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Privacy Policy" description="QuackAPI Privacy Policy - Learn how we collect, use, and protect your data on our WhatsApp API platform." canonical="/privacy" />
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

      <main className="max-w-4xl mx-auto px-6 py-16" data-testid="privacy-content">
        <h1 className="font-display text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-muted-foreground mb-12">Last updated: {new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}</p>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">1. Introduction</h2>
            <p className="text-muted-foreground leading-relaxed mb-3">
              This Privacy Policy (the "Policy") forms a part of the Terms of Service relating to the use of QuackAPI, and by using the platform you expressly consent to our collection, use, and disclosure of your information in accordance with the terms of this Policy.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We may amend this Policy at any time without notice, and such amendments become effective from the date upon which we make them available on the platform.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              If you do not agree to the Policy (including any amendments), then you should immediately cease using the platform.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">2. Definitions</h2>
            <p className="text-muted-foreground leading-relaxed">
              The terms "we", "our", "us" refer to QuackAPI and its subsidiaries, employees, officers, agents, affiliates, or assigned parties. This Privacy Policy is effective as of the date you accept this Policy, and you do so by default through the use of the platform. If any term of this Policy is or may become for any reason invalid or unenforceable at law, the validity and enforceability of the remainder will not be affected.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">3. Information We Collect</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              The type of information we collect from you is either personal to you, or is general in nature:
            </p>

            <h3 className="font-display text-lg font-semibold mb-2">Personal Information</h3>
            <p className="text-muted-foreground leading-relaxed mb-4">
              When you sign up for our Services, register on the platform as a user, update your information, purchase any goods or Services, or request us to contact you, we collect personal information including but not limited to your name, email address, and payment details.
            </p>

            <h3 className="font-display text-lg font-semibold mb-2">General Information</h3>
            <p className="text-muted-foreground leading-relaxed">
              We also receive more general information from you as a result of your visits to, and use of, the platform. This general information does not identify you personally, and can include information such as your IP address, the date and time you access the platform, length of time you spend on the platform, your browsing history, the Internet address of the website from which you linked directly to our platform, and other similar data.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">4. Tracking Technologies</h2>
            <p className="text-muted-foreground leading-relaxed">
              When you visit our platform, sign up for events, or request more information about QuackAPI, we collect information automatically using tracking technologies, like cookies, and through web forms where you type in your information. We collect this information to provide you with what you request through the web form, to learn more about who is interested in our products and services, and to improve navigation experience on our pages.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">5. How We Use Your Information</h2>
            <ul className="list-disc pl-6 space-y-2 text-muted-foreground">
              <li>To provide, maintain, and improve our Services</li>
              <li>To process transactions and send related information</li>
              <li>To send promotional communications (with your consent)</li>
              <li>To respond to your comments, questions, and customer service requests</li>
              <li>To monitor and analyze usage trends and preferences</li>
              <li>To detect, investigate, and prevent fraudulent activities</li>
              <li>To personalize and improve your experience on the platform</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">6. Information Sharing</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              We share your information with our third-party service providers. We partner with and are supported by service providers around the world. Personal information will be made available to these parties only when necessary to fulfill the services they provide to us, such as software, system, and platform support, and direct marketing services.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-3">
              We do not sell or allow your Customer Account Data to be used by third parties for their own marketing purposes, unless you ask us to do this or give us your consent. Further, we do not sell your end users' personal information. We also do not share it with third parties for their own marketing or other purposes, unless you instruct us to do so.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">7. Your Rights</h2>
            <p className="text-muted-foreground leading-relaxed">
              We respect your right to access and control your information, and we will respond to requests for information and, where applicable, will correct, amend, or delete your personal information. Any such request can be made through our{" "}
              <button onClick={() => setLocation("/contact")} className="text-primary hover:underline" data-testid="link-contact">
                Contact page
              </button>{" "}
              or by emailing us directly.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">8. Data Security</h2>
            <p className="text-muted-foreground leading-relaxed">
              We use appropriate technical and organizational measures to protect the security of your personal information both online and offline. These measures vary based on the sensitivity of the personal information we collect, process, and store, and the current state of technology. We also take measures to ensure service providers that process personal data on our behalf have appropriate security controls in place.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">9. Data Retention</h2>
            <p className="text-muted-foreground leading-relaxed">
              We retain your personal information for as long as your account is active or as needed to provide you services. We will retain and use your information as necessary to comply with our legal obligations, resolve disputes, and enforce our agreements.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">10. Changes to This Policy</h2>
            <p className="text-muted-foreground leading-relaxed">
              The most current version of this Privacy Policy will govern our practices for collecting, processing, and disclosing personal data. We will provide notice of any modifications by posting a written notice on our platform. Your continued use of the Service after changes are posted constitutes your acceptance of the updated Policy.
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl font-semibold mb-4">11. Contact Us</h2>
            <p className="text-muted-foreground leading-relaxed">
              If you have any questions or concerns about this Privacy Policy, please reach out through our{" "}
              <button onClick={() => setLocation("/contact")} className="text-primary hover:underline" data-testid="link-contact-bottom">
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
