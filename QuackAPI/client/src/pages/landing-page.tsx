import { useState } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import Navbar from "@/components/navbar";
import { 
  Smartphone, 
  QrCode, 
  Send, 
  Webhook, 
  Shield, 
  Zap, 
  KeyRound, 
  ArrowRight, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Bell, 
  Lock, 
  Users, 
  Bot,
  Code2,
  Copy,
  CheckCheck
} from "lucide-react";
import { SiX, SiLinkedin, SiFacebook, SiInstagram, SiYoutube } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/seo";
import { SITE_URL } from "@/lib/config";

const SOCIAL_URLS = [
  "https://twitter.com/QuackAPI",
  "https://www.linkedin.com/company/quackapi",
  "https://www.facebook.com/quackapi",
  "https://www.instagram.com/quackapi",
  "https://www.youtube.com/@quackapi",
];

const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "QuackAPI",
  description: "Enterprise-level WhatsApp API platform for developers and businesses.",
  url: SITE_URL,
  logo: `${SITE_URL}/favicon.png`,
  email: "support@quackapi.com",
  sameAs: SOCIAL_URLS,
  contactPoint: {
    "@type": "ContactPoint",
    email: "support@quackapi.com",
    contactType: "customer support",
  },
};

const serviceSchema = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "QuackAPI WhatsApp API",
  url: SITE_URL,
  description: "Enterprise-level WhatsApp API platform for developers and businesses.",
  provider: { "@type": "Organization", name: "QuackAPI", url: SITE_URL },
  serviceType: "WhatsApp API",
  areaServed: "Worldwide",
  sameAs: SOCIAL_URLS,
};

const productSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "QuackAPI",
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  description: "WhatsApp API platform to connect multiple devices, send messages via REST API, and receive webhooks.",
  offers: [
    { "@type": "Offer", name: "Starter", price: "0", priceCurrency: "USD", description: "Free plan with 1 device and 100 messages/day" },
    { "@type": "Offer", name: "Professional", price: "29", priceCurrency: "USD", description: "5 devices, unlimited messages, webhooks, priority support" },
    { "@type": "Offer", name: "Enterprise", price: "99", priceCurrency: "USD", description: "Unlimited devices, SLA guarantee, custom integrations" },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "47",
    bestRating: "5",
    worstRating: "1",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "QuackAPI",
  url: SITE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${SITE_URL}/blog?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const faqSchemaData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    { "@type": "Question", name: "What is QuackAPI?", acceptedAnswer: { "@type": "Answer", text: "QuackAPI is the ultimate WhatsApp automation stack for 2026 — a SaaS platform that lets you connect multiple WhatsApp accounts, automate messaging through a REST API, and receive real-time webhooks for incoming messages." } },
    { "@type": "Question", name: "How do I connect my WhatsApp?", acceptedAnswer: { "@type": "Answer", text: "After creating an account, you add a new device and scan the QR code with your WhatsApp app. Once scanned, your WhatsApp account is connected and ready to send/receive messages via the API." } },
    { "@type": "Question", name: "What types of messages can I send?", acceptedAnswer: { "@type": "Answer", text: "You can send text messages, images, PDF documents, interactive button messages, and OTP verification codes through our REST API." } },
    { "@type": "Question", name: "How do webhooks work?", acceptedAnswer: { "@type": "Answer", text: "You can configure a webhook URL for each connected device. When that device receives an incoming WhatsApp message, our system forwards the message data to your webhook URL in real-time." } },
    { "@type": "Question", name: "Is the connection secure?", acceptedAnswer: { "@type": "Answer", text: "Yes. WhatsApp uses end-to-end encryption via the Signal protocol. Your session credentials are stored securely, and API access requires authentication." } },
    { "@type": "Question", name: "Can I connect multiple WhatsApp numbers?", acceptedAnswer: { "@type": "Answer", text: "Yes, you can connect multiple WhatsApp devices, each with its own phone number and session, managed independently." } },
  ],
};

export default function LandingPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <SEO
        canonical="/"
        description="QuackAPI — The ultimate WhatsApp automation stack for 2026. Connect multiple devices, automate messaging via REST API, and receive real-time webhooks. Built for developers and businesses."
        ogImage="/og-image.png"
        jsonLd={[organizationSchema, serviceSchema, productSchema, faqSchemaData, websiteSchema]}
      />
      <Navbar />
      <HeroSection onNavigate={setLocation} />
      <HowItWorksSection />
      <APIExampleSection />
      <FeaturesSection />
      <UseCasesSection />
      <PricingSection onNavigate={setLocation} />
      <FAQSection />
      <BlogPreviewSection />
      <CTASection onNavigate={setLocation} />
      <Footer />
    </div>
  );
}


function HeroSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section className="relative overflow-hidden pt-20 pb-32" data-testid="section-hero">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <motion.div 
        className="absolute top-20 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-3xl opacity-30"
        animate={{ scale: [1, 1.05, 1], opacity: [0.3, 0.4, 0.3] }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      />
      
      <div className="relative max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-8"
        >
          <Zap className="w-4 h-4" />
          The Ultimate WhatsApp Automation Stack
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="font-display text-5xl md:text-7xl font-bold tracking-tight mb-6"
        >
          WhatsApp API Now
          <span className="block text-primary mt-2">For Your Business</span>
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Connect multiple WhatsApp devices, automate messaging through a powerful REST API, 
          and receive real-time webhooks. Built for developers and businesses who demand speed and scale in 2026.
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
        >
          <Button 
            size="lg" 
            onClick={() => onNavigate("/auth")} 
            className="h-12 px-8 text-base font-semibold shadow-xl shadow-primary/25"
            data-testid="button-hero-signup"
          >
            Start Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline" 
            onClick={() => {
              document.getElementById("api")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="h-12 px-8 text-base"
            data-testid="button-hero-api"
          >
            <Code2 className="mr-2 w-5 h-5" />
            View API Docs
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10 text-sm text-muted-foreground"
        >
          <div className="flex items-center gap-1.5">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-4 h-4 text-yellow-400 fill-yellow-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
            ))}
            <span className="ml-1 font-medium text-foreground">4.9/5</span>
          </div>
          <span className="hidden sm:block text-border">|</span>
          <span>Trusted by <strong className="text-foreground">500+ developers</strong> worldwide</span>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto">
          {[
            { label: "REST API", icon: Code2 },
            { label: "Multi-Device", icon: Smartphone },
            { label: "Webhooks", icon: Webhook },
            { label: "Secure", icon: Shield },
          ].map((item, index) => (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 + index * 0.1 }}
              className="flex flex-col items-center gap-2 text-muted-foreground"
            >
              <div className="w-12 h-12 rounded-xl bg-card border border-border/50 shadow-sm flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-medium">{item.label}</span>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    {
      step: "01",
      title: "Create an Account",
      description: "Register on QuackAPI and get your unique API key instantly. No credit card required to start.",
      icon: KeyRound,
    },
    {
      step: "02",
      title: "Add Device & Scan QR",
      description: "Add a new WhatsApp device and scan the QR code with your phone to link your WhatsApp account.",
      icon: QrCode,
    },
    {
      step: "03",
      title: "Send Messages via API",
      description: "Use our REST API to send text messages, images, PDFs, and more. Set up webhooks for incoming messages.",
      icon: Send,
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-card/50" data-testid="section-how-it-works">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Get started in minutes with three simple steps
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((item, index) => (
            <div key={item.step} className="relative" data-testid={`card-step-${index}`}>
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-16 left-[60%] w-[80%] border-t-2 border-dashed border-primary/20" />
              )}
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative">
                  <item.icon className="w-7 h-7 text-primary" />
                  <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center shadow-md">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{item.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const CODE_EXAMPLES: Record<string, { label: string; filename: string; code: string }> = {
  curl: {
    label: "cURL",
    filename: "send-message.sh",
    code: `curl -X POST "https://your-domain.com/v1/messages/chat" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: wa_your_api_key_here" \\
  -d '{
    "deviceId": 1,
    "to": "923001234567",
    "body": "Hello from QuackAPI!"
  }'`,
  },
  javascript: {
    label: "JavaScript",
    filename: "send-message.js",
    code: `// Send a WhatsApp message via REST API
const response = await fetch(
  "https://your-domain.com/v1/messages/chat",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "wa_your_api_key_here"
    },
    body: JSON.stringify({
      deviceId: 1,
      to: "923001234567",
      body: "Hello from QuackAPI!"
    })
  }
);

const result = await response.json();
// { id: 42, status: "sent", ... }`,
  },
  python: {
    label: "Python",
    filename: "send_message.py",
    code: `import requests

response = requests.post(
    "https://your-domain.com/v1/messages/chat",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "wa_your_api_key_here"
    },
    json={
        "deviceId": 1,
        "to": "923001234567",
        "body": "Hello from QuackAPI!"
    }
)

result = response.json()
print(result)  # {'id': 42, 'status': 'sent', ...}`,
  },
  php: {
    label: "PHP",
    filename: "send_message.php",
    code: `<?php
$curl = curl_init();
curl_setopt_array($curl, [
    CURLOPT_URL => "https://your-domain.com/v1/messages/chat",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_CUSTOMREQUEST => "POST",
    CURLOPT_POSTFIELDS => json_encode([
        "deviceId" => 1,
        "to" => "923001234567",
        "body" => "Hello from QuackAPI!"
    ]),
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-api-key: wa_your_api_key_here"
    ],
]);
$response = curl_exec($curl);
curl_close($curl);
echo $response;`,
  },
  nodejs: {
    label: "Node.js",
    filename: "send-message.js",
    code: `const axios = require("axios");

const { data } = await axios.post(
  "https://your-domain.com/v1/messages/chat",
  {
    deviceId: 1,
    to: "923001234567",
    body: "Hello from QuackAPI!"
  },
  {
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "wa_your_api_key_here"
    }
  }
);

console.log(data);
// { id: 42, status: "sent", ... }`,
  },
};

function APIExampleSection() {
  const [copied, setCopied] = useState(false);
  const [activeLang, setActiveLang] = useState("javascript");

  const activeExample = CODE_EXAMPLES[activeLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(activeExample.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="api" className="py-24" data-testid="section-api">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
              Developer-Friendly
              <span className="block text-primary">REST API</span>
            </h2>
            <p className="text-muted-foreground text-lg mb-8 leading-relaxed">
              Integrate WhatsApp messaging into your application with just a few lines of code. 
              Our API supports text, images, PDFs, buttons, and OTP messages.
            </p>

            <div className="space-y-4">
              {[
                "Simple API key authentication",
                "Send text, images, PDFs, and button messages",
                "Real-time delivery status tracking",
                "Webhook callbacks for incoming messages",
                "Multi-device support with separate sessions",
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-3 h-3 text-primary" />
                  </div>
                  <span className="text-foreground/80">{item}</span>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Button
                size="lg"
                onClick={() => window.location.href = "/docs"}
                className="h-11 px-6 text-base font-semibold shadow-lg shadow-primary/20"
                data-testid="button-view-api-docs"
              >
                <Code2 className="mr-2 w-5 h-5" />
                View Full API Docs
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="relative">
            <div className="bg-[#1e1e2e] rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {Object.entries(CODE_EXAMPLES).map(([key, ex]) => (
                    <button
                      key={key}
                      onClick={() => { setActiveLang(key); setCopied(false); }}
                      className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${activeLang === key ? "bg-white/15 text-white" : "text-white/40 hover:text-white/70"}`}
                      data-testid={`button-lang-${key}`}
                    >
                      {ex.label}
                    </button>
                  ))}
                </div>
                <button 
                  onClick={handleCopy}
                  className="text-white/40 hover:text-white/80 transition-colors p-1 shrink-0 ml-2"
                  data-testid="button-copy-code"
                >
                  {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
                </button>
              </div>
              <div className="px-2 pt-2 pb-1 border-b border-white/5">
                <span className="text-white/30 text-xs font-mono px-2">{activeExample.filename}</span>
              </div>
              <pre className="p-5 text-sm overflow-x-auto max-h-80">
                <code className="text-green-300 font-mono whitespace-pre leading-relaxed text-xs">
                  {activeExample.code}
                </code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      icon: Smartphone,
      title: "Multi-Device Support",
      description: "Connect and manage multiple WhatsApp accounts simultaneously. Each device gets its own session and API endpoint.",
    },
    {
      icon: Send,
      title: "Multiple Message Types",
      description: "Send text messages, images, PDFs, interactive buttons, and OTP verification codes through a unified API.",
    },
    {
      icon: Webhook,
      title: "Webhook Callbacks",
      description: "Receive real-time notifications for incoming messages via configurable webhook URLs per device.",
    },
    {
      icon: KeyRound,
      title: "API Key Authentication",
      description: "Secure your API calls with unique API keys. Each user gets a dedicated key for programmatic access.",
    },
    {
      icon: QrCode,
      title: "Easy QR Pairing",
      description: "Link your WhatsApp account by scanning a QR code. No phone number verification or business approval needed.",
    },
    {
      icon: Shield,
      title: "Secure & Encrypted",
      description: "All WhatsApp sessions use end-to-end encryption via the Signal protocol. Your data stays protected.",
    },
  ];

  return (
    <section id="features" className="py-24 bg-card/50" data-testid="section-features">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Everything You Need to
            <span className="text-primary"> Communicate</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Powerful features designed for developers and businesses
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <Card key={i} className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 bg-background" data-testid={`card-feature-${i}`}>
              <CardContent className="p-6">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-display text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}

function UseCasesSection() {
  const useCases = [
    {
      icon: Bell,
      title: "Notifications",
      description: "Send order confirmations, shipping updates, appointment reminders, and custom alerts directly to your customers on WhatsApp.",
    },
    {
      icon: Lock,
      title: "OTP & Verification",
      description: "Deliver one-time passwords and verification codes for secure user authentication and account recovery.",
    },
    {
      icon: Users,
      title: "Customer Communication",
      description: "Engage with your audience through personalized messages, support responses, and promotional content.",
    },
    {
      icon: Bot,
      title: "Automated Messages",
      description: "Set up webhook-triggered automated responses for common queries, welcome messages, and status updates.",
    },
  ];

  return (
    <section id="use-cases" className="py-24" data-testid="section-use-cases">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            WhatsApp API Use Cases
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            See how businesses use QuackAPI to reach their customers
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {useCases.map((uc, i) => {
            const slugMap: Record<string, string> = {
              "Notifications": "/use-cases/notifications",
              "OTP & Verification": "/use-cases/otp",
              "Customer Communication": "/use-cases/customer-support",
              "Automated Messages": "/use-cases/automation",
            };
            return (
              <a key={i} href={slugMap[uc.title] || "/use-cases"} className="text-center p-6 rounded-xl border border-border/50 bg-card hover:shadow-lg hover:border-primary/20 transition-all duration-300 block" data-testid={`card-usecase-${i}`}>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                  <uc.icon className="w-7 h-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg mb-2">{uc.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{uc.description}</p>
                <span className="inline-flex items-center gap-1 text-primary text-sm font-medium mt-3">
                  Learn more <ArrowRight className="w-3 h-3" />
                </span>
              </a>
            );
          })}
        </div>
        <div className="text-center mt-8">
          <a href="/use-cases" className="inline-flex items-center gap-2 text-primary font-medium hover:underline" data-testid="link-all-use-cases">
            View All Use Cases <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function PricingSection({ onNavigate }: { onNavigate: (path: string) => void }) {
  const plans = [
    {
      name: "Starter",
      price: "Free",
      period: "",
      description: "Get started with basic WhatsApp API access",
      features: [
        "1 WhatsApp device",
        "100 messages/day",
        "REST API access",
        "QR code pairing",
        "Basic support",
      ],
      cta: "Start Free",
      highlighted: false,
    },
    {
      name: "Professional",
      price: "$29",
      period: "/month",
      description: "For growing businesses that need more capacity",
      features: [
        "5 WhatsApp devices",
        "Unlimited messages",
        "REST API access",
        "Webhook callbacks",
        "Image, PDF & button messages",
        "OTP message support",
        "Priority support",
      ],
      cta: "Get Started",
      highlighted: true,
    },
    {
      name: "Enterprise",
      price: "$99",
      period: "/month",
      description: "For large teams with advanced requirements",
      features: [
        "Unlimited devices",
        "Unlimited messages",
        "Full API access",
        "Webhook callbacks",
        "All message types",
        "Dedicated support",
        "Custom integrations",
        "SLA guarantee",
      ],
      cta: "Contact Us",
      highlighted: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-card/50" data-testid="section-pricing">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Choose the plan that fits your messaging needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <div
              key={i}
              className={`relative rounded-2xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground shadow-2xl shadow-primary/25 md:scale-105 border-2 border-primary"
                  : "bg-background border border-border/50 hover:shadow-lg"
              }`}
              data-testid={`card-plan-${i}`}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-foreground text-background text-xs font-bold px-4 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <h3 className="font-display text-xl font-semibold mb-2">{plan.name}</h3>
              <div className="flex items-baseline gap-1 mb-2">
                <span className="text-4xl font-bold">{plan.price}</span>
                {plan.period && <span className={plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}>{plan.period}</span>}
              </div>
              <p className={`text-sm mb-6 ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, j) => (
                  <li key={j} className="flex items-center gap-3 text-sm">
                    <Check className={`w-4 h-4 flex-shrink-0 ${plan.highlighted ? "text-primary-foreground" : "text-primary"}`} />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={`w-full ${
                  plan.highlighted
                    ? "bg-background text-foreground hover:bg-background/90"
                    : "shadow-lg shadow-primary/25"
                }`}
                variant={plan.highlighted ? "secondary" : "default"}
                onClick={() => onNavigate("/auth")}
                data-testid={`button-plan-${i}`}
              >
                {plan.cta}
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQSection() {
  const faqs = [
    {
      question: "What is QuackAPI?",
      answer: "QuackAPI is the ultimate WhatsApp automation stack for 2026 — a platform that lets you connect multiple WhatsApp accounts, automate messaging through a REST API, and receive incoming messages via real-time webhooks. Designed for developers and businesses who need fast, reliable programmatic WhatsApp access.",
    },
    {
      question: "How do I connect my WhatsApp?",
      answer: "After creating an account, you add a new device and scan the QR code with your WhatsApp app (go to Linked Devices in WhatsApp settings). Once scanned, your WhatsApp account is connected and ready to send/receive messages via the API.",
    },
    {
      question: "What types of messages can I send?",
      answer: "You can send text messages, images, PDF documents, interactive button messages, and OTP (one-time password) verification codes. All message types are accessible through our REST API with your API key.",
    },
    {
      question: "How do webhooks work?",
      answer: "You can configure a webhook URL for each connected device. When that device receives an incoming WhatsApp message, our system will forward the message data to your webhook URL in real-time via an HTTP POST request.",
    },
    {
      question: "Is the connection secure?",
      answer: "Yes. WhatsApp uses end-to-end encryption via the Signal protocol. Your session credentials are stored securely on our servers. API access requires authentication via your unique API key or JWT token.",
    },
    {
      question: "Can I connect multiple WhatsApp numbers?",
      answer: "Yes, you can connect multiple WhatsApp devices, each with its own phone number and session. Each device can be managed independently with its own webhook URL and message history.",
    },
  ];

  return (
    <section id="faq" className="py-24" data-testid="section-faq">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-lg">
            Everything you need to know about the ultimate WhatsApp automation stack
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <FAQItem key={i} question={faq.question} answer={faq.answer} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQItem({ question, answer, index }: { question: string; answer: string; index: number }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-border/50 rounded-xl overflow-hidden bg-card" data-testid={`faq-item-${index}`}>
      <button
        className="w-full flex items-center justify-between p-5 text-left hover:bg-accent/50 transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        data-testid={`button-faq-${index}`}
      >
        <span className="font-medium text-foreground">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        ) : (
          <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
        )}
      </button>
      {isOpen && (
        <div className="px-5 pb-5 text-muted-foreground leading-relaxed animate-in">
          {answer}
        </div>
      )}
    </div>
  );
}

function BlogPreviewSection() {
  const articles = [
    { title: "How to Send WhatsApp Messages with PHP", href: "/blog/send-whatsapp-messages-php" },
    { title: "Send WhatsApp Messages with Node.js", href: "/blog/send-whatsapp-messages-nodejs" },
    { title: "Build a WhatsApp Chatbot with Python", href: "/blog/build-whatsapp-chatbot-python" },
    { title: "How to Avoid WhatsApp Number Ban", href: "/blog/avoid-whatsapp-number-ban" },
  ];

  return (
    <section className="py-24 bg-card/50" data-testid="section-blog-preview">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            From the Developer Blog
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Tutorials, guides, and best practices for WhatsApp API integration
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {articles.map((article, i) => (
            <a key={i} href={article.href} className="p-5 rounded-xl border border-border/50 bg-background hover:shadow-lg hover:border-primary/20 transition-all duration-300 block" data-testid={`card-blog-preview-${i}`}>
              <h3 className="font-display font-semibold text-sm mb-3 leading-snug">{article.title}</h3>
              <span className="inline-flex items-center gap-1 text-primary text-sm font-medium">
                Read article <ArrowRight className="w-3 h-3" />
              </span>
            </a>
          ))}
        </div>

        <div className="text-center mt-8">
          <a href="/blog" className="inline-flex items-center gap-2 text-primary font-medium hover:underline" data-testid="link-view-blog">
            View All Articles <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
}

function CTASection({ onNavigate }: { onNavigate: (path: string) => void }) {
  return (
    <section className="py-24 bg-primary/5" data-testid="section-cta">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <h2 className="font-display text-3xl md:text-4xl font-bold mb-6">
          Ready to Get Started?
        </h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto mb-10">
          Create your account now and start sending WhatsApp messages through our API in minutes.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button 
            size="lg" 
            onClick={() => onNavigate("/auth")} 
            className="h-12 px-10 text-base font-semibold shadow-xl shadow-primary/25"
            data-testid="button-cta-signup"
          >
            Create Free Account
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="bg-foreground text-background py-16" data-testid="footer">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <img src="/favicon.png" className="w-9 h-9 rounded-xl" alt="QuackAPI" />
              <span className="font-display font-bold text-xl">QuackAPI</span>
            </div>
            <p className="text-background/60 text-sm leading-relaxed mb-4">
              Enterprise-level WhatsApp API platform for developers and businesses.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://twitter.com/QuackAPI" target="_blank" rel="noopener noreferrer" className="text-background/50 hover:text-background transition-colors" aria-label="QuackAPI on X (Twitter)">
                <SiX size={16} />
              </a>
              <a href="https://www.linkedin.com/company/quackapi" target="_blank" rel="noopener noreferrer" className="text-background/50 hover:text-background transition-colors" aria-label="QuackAPI on LinkedIn">
                <SiLinkedin size={16} />
              </a>
              <a href="https://www.facebook.com/quackapi" target="_blank" rel="noopener noreferrer" className="text-background/50 hover:text-background transition-colors" aria-label="QuackAPI on Facebook">
                <SiFacebook size={16} />
              </a>
              <a href="https://www.instagram.com/quackapi" target="_blank" rel="noopener noreferrer" className="text-background/50 hover:text-background transition-colors" aria-label="QuackAPI on Instagram">
                <SiInstagram size={16} />
              </a>
              <a href="https://www.youtube.com/@quackapi" target="_blank" rel="noopener noreferrer" className="text-background/50 hover:text-background transition-colors" aria-label="QuackAPI on YouTube">
                <SiYoutube size={16} />
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-background/90">Product</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><a href="#features" className="hover:text-background transition-colors">Features</a></li>
              <li><a href="#pricing" className="hover:text-background transition-colors">Pricing</a></li>
              <li><a href="/docs" className="hover:text-background transition-colors" data-testid="footer-link-docs">API Documentation</a></li>
              <li><a href="/blog" className="hover:text-background transition-colors" data-testid="footer-link-blog">Blog</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-background/90">Use Cases</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><a href="/use-cases/notifications" className="hover:text-background transition-colors">Notifications</a></li>
              <li><a href="/use-cases/otp" className="hover:text-background transition-colors">OTP Verification</a></li>
              <li><a href="/use-cases/customer-support" className="hover:text-background transition-colors">Customer Support</a></li>
              <li><a href="/use-cases/automation" className="hover:text-background transition-colors">Automated Messages</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4 text-background/90">Company</h4>
            <ul className="space-y-2 text-sm text-background/60">
              <li><a href="#faq" className="hover:text-background transition-colors">FAQ</a></li>
              <li><a href="/contact" className="hover:text-background transition-colors" data-testid="footer-link-contact">Contact Us</a></li>
              <li><a href="mailto:support@quackapi.com" className="hover:text-background transition-colors" data-testid="footer-link-email">support@quackapi.com</a></li>
              <li><a href="/terms" className="hover:text-background transition-colors" data-testid="footer-link-terms">Terms of Service</a></li>
              <li><a href="/privacy" className="hover:text-background transition-colors" data-testid="footer-link-privacy">Privacy Policy</a></li>
              <li><a href="/compare/ultramsg" className="hover:text-background transition-colors">QuackAPI vs UltraMsg</a></li>
              <li><a href="/compare/twilio" className="hover:text-background transition-colors">QuackAPI vs Twilio</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-background/10 pt-8 text-center text-sm text-background/40">
          <p>&copy; {new Date().getFullYear()} QuackAPI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
