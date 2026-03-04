import { useState } from "react";
import { useRoute, useLocation, Link } from "wouter";
import Navbar from "@/components/navbar";
import {
  Bell,
  Lock,
  Users,
  Bot,
  ArrowRight,
  Check,
  Copy,
  CheckCheck,
  Package,
  Truck,
  Calendar,
  CreditCard,
  ShieldCheck,
  Fingerprint,
  Phone,
  KeyRound,
  MessageCircle,
  Headphones,
  TicketCheck,
  Heart,
  Clock,
  Workflow,
  Sparkles,
  Repeat,
  ChevronRight,
  Zap,
  ShoppingCart,
  TrendingUp,
  Star,
  Stethoscope,
  Pill,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/seo";

interface UseCaseData {
  slug: string;
  title: string;
  description: string;
  metaDescription: string;
  keywords: string;
  icon: typeof Bell;
  heroDescription: string;
  benefits: { icon: typeof Bell; title: string; description: string }[];
  steps: { title: string; description: string }[];
  codeExample: string;
  codeFilename: string;
}

const useCasesData: Record<string, UseCaseData> = {
  notifications: {
    slug: "notifications",
    title: "WhatsApp Notifications API",
    description: "Send order confirmations, shipping updates, appointment reminders, and payment alerts directly to your customers on WhatsApp.",
    metaDescription: "Send WhatsApp notifications for order confirmations, shipping updates, appointment reminders, and payment alerts using QuackAPI API. Integrate WhatsApp notification API in minutes.",
    keywords: "whatsapp notification api, whatsapp order notification, whatsapp shipping alerts",
    icon: Bell,
    heroDescription: "Deliver critical business notifications instantly through WhatsApp. From order confirmations to payment alerts, ensure your customers never miss an important update with delivery rates exceeding 98%.",
    benefits: [
      { icon: Package, title: "Order Confirmations", description: "Automatically send order confirmation messages with details like order ID, items, and estimated delivery right after purchase." },
      { icon: Truck, title: "Shipping Updates", description: "Keep customers informed with real-time shipping status updates, tracking numbers, and delivery notifications." },
      { icon: Calendar, title: "Appointment Reminders", description: "Reduce no-shows by sending automated appointment reminders with date, time, and location details." },
      { icon: CreditCard, title: "Payment Alerts", description: "Notify customers about successful payments, pending invoices, subscription renewals, and billing updates." },
      { icon: Zap, title: "Instant Delivery", description: "WhatsApp messages are delivered instantly with read receipts, ensuring your notifications are seen within minutes." },
      { icon: Check, title: "98%+ Open Rate", description: "WhatsApp notifications have significantly higher open rates compared to email or SMS, ensuring your messages are read." },
    ],
    steps: [
      { title: "Connect Your WhatsApp Device", description: "Add a WhatsApp device to your QuackAPI account and scan the QR code to link your business number." },
      { title: "Trigger Notifications via API", description: "Use our REST API to send notifications from your backend when events occur, such as new orders, shipment updates, or appointment changes." },
      { title: "Track Delivery Status", description: "Monitor message delivery status in real-time through webhooks and the QuackAPI dashboard to ensure every notification reaches your customer." },
    ],
    codeExample: `const response = await fetch(
  "https://your-domain.com/api/messages/send",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "wa_your_api_key_here"
    },
    body: JSON.stringify({
      deviceId: 1,
      to: "923001234567",
      content: "Your order #12345 has been confirmed! Estimated delivery: Jan 20, 2026. Track: https://track.example.com/12345",
      type: "text"
    })
  }
);

const result = await response.json();
console.log(result); // { id: 42, status: "sent" }`,
    codeFilename: "send-notification.js",
  },
  otp: {
    slug: "otp",
    title: "WhatsApp OTP & Verification",
    description: "Deliver one-time passwords, 2FA codes, account verification, and phone number verification securely through WhatsApp.",
    metaDescription: "Send OTP and verification codes via WhatsApp API with QuackAPI. Implement 2FA, account verification, and phone number verification with high delivery rates and security.",
    keywords: "whatsapp otp api, whatsapp verification code, whatsapp 2fa",
    icon: Lock,
    heroDescription: "Secure your user authentication with WhatsApp-based OTP delivery. Achieve faster verification times, higher delivery rates than SMS, and a better user experience with end-to-end encrypted one-time passwords.",
    benefits: [
      { icon: ShieldCheck, title: "One-Time Passwords", description: "Send secure OTP codes for login verification, transaction approval, and sensitive account actions with automatic expiry." },
      { icon: Fingerprint, title: "Two-Factor Authentication", description: "Add an extra layer of security with WhatsApp-based 2FA that users prefer over traditional SMS verification." },
      { icon: KeyRound, title: "Account Verification", description: "Verify new user accounts during registration by sending confirmation codes directly to their WhatsApp number." },
      { icon: Phone, title: "Phone Number Verification", description: "Confirm phone number ownership by sending verification codes through WhatsApp, ensuring the number is active and reachable." },
      { icon: Lock, title: "End-to-End Encrypted", description: "WhatsApp messages are encrypted by default, making OTP delivery more secure than traditional SMS channels." },
      { icon: Zap, title: "Faster Than SMS", description: "WhatsApp OTP messages are delivered instantly with no carrier delays, reducing user friction during authentication flows." },
    ],
    steps: [
      { title: "Generate OTP in Your Backend", description: "Generate a secure one-time password in your application backend and store it with an expiry time for validation." },
      { title: "Send OTP via QuackAPI API", description: "Call our REST API to deliver the OTP code to the user's WhatsApp number instantly with a clear, branded message." },
      { title: "Verify the Code", description: "When the user enters the code, validate it against your stored OTP. The entire flow takes seconds with near-instant delivery." },
    ],
    codeExample: `const otp = Math.floor(100000 + Math.random() * 900000);

const response = await fetch(
  "https://your-domain.com/api/messages/send",
  {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "wa_your_api_key_here"
    },
    body: JSON.stringify({
      deviceId: 1,
      to: "923001234567",
      content: \`Your QuackAPI verification code is: \${otp}. This code expires in 5 minutes. Do not share this code.\`,
      type: "text"
    })
  }
);

const result = await response.json();
console.log(result); // { id: 43, status: "sent" }`,
    codeFilename: "send-otp.js",
  },
  "customer-support": {
    slug: "customer-support",
    title: "WhatsApp Customer Support",
    description: "Enable live chat, automated responses, ticket creation, and customer engagement through WhatsApp with QuackAPI.",
    metaDescription: "Build WhatsApp customer support with QuackAPI API. Enable live chat, automated responses, helpdesk ticket creation, and real-time customer engagement on WhatsApp.",
    keywords: "whatsapp customer support api, whatsapp live chat, whatsapp helpdesk",
    icon: Users,
    heroDescription: "Transform your customer support with WhatsApp. Meet your customers where they already are, provide instant responses, and build stronger relationships with conversational support that feels personal and immediate.",
    benefits: [
      { icon: MessageCircle, title: "Live Chat Support", description: "Enable real-time conversations with customers through WhatsApp. Agents can respond instantly using webhooks to receive incoming messages." },
      { icon: Bot, title: "Automated Responses", description: "Set up automated replies for frequently asked questions, business hours, and common support queries to reduce response times." },
      { icon: TicketCheck, title: "Ticket Creation", description: "Automatically create support tickets from WhatsApp messages and route them to the right team for resolution." },
      { icon: Heart, title: "Customer Engagement", description: "Build lasting relationships with personalized follow-ups, satisfaction surveys, and proactive customer outreach." },
      { icon: Headphones, title: "Multi-Agent Support", description: "Connect multiple WhatsApp devices for different support teams or departments, each with their own number and webhook." },
      { icon: Clock, title: "24/7 Availability", description: "Combine automated responses with live agents to provide round-the-clock support coverage for your customers." },
    ],
    steps: [
      { title: "Set Up Webhooks for Incoming Messages", description: "Configure webhook URLs on your QuackAPI devices to receive incoming WhatsApp messages from customers in real-time." },
      { title: "Route Messages to Your Support System", description: "Process incoming webhook payloads to create tickets, trigger auto-replies, or route conversations to available agents." },
      { title: "Respond via the API", description: "Send replies back to customers through the QuackAPI REST API. Include text, images, documents, or links as needed." },
    ],
    codeExample: `app.post("/webhook/whatsapp", (req, res) => {
  const { from, message } = req.body;
  console.log(\`New message from \${from}: \${message.content}\`);

  // Auto-reply to incoming support messages
  await fetch("https://your-domain.com/api/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "wa_your_api_key_here"
    },
    body: JSON.stringify({
      deviceId: 1,
      to: from,
      content: "Thanks for reaching out! A support agent will be with you shortly. In the meantime, check our FAQ: https://example.com/faq",
      type: "text"
    })
  });

  res.sendStatus(200);
});`,
    codeFilename: "webhook-handler.js",
  },
  automation: {
    slug: "automation",
    title: "WhatsApp Message Automation",
    description: "Build auto-replies, scheduled messages, workflow triggers, and chatbot integrations with QuackAPI's WhatsApp automation API.",
    metaDescription: "Automate WhatsApp messages with QuackAPI API. Build auto-replies, scheduled messages, workflow triggers, and chatbot integrations for your business communication.",
    keywords: "whatsapp automation api, whatsapp auto reply, whatsapp chatbot",
    icon: Bot,
    heroDescription: "Automate your WhatsApp communication at scale. From intelligent auto-replies to complex workflow triggers, QuackAPI lets you build powerful message automation that saves time and improves customer satisfaction.",
    benefits: [
      { icon: Repeat, title: "Auto-Replies", description: "Set up intelligent automatic responses based on keywords, message patterns, or business rules to handle common inquiries instantly." },
      { icon: Clock, title: "Scheduled Messages", description: "Schedule messages to be sent at specific times for reminders, follow-ups, promotional campaigns, and recurring notifications." },
      { icon: Workflow, title: "Workflow Triggers", description: "Connect WhatsApp messaging to your existing workflows. Trigger messages based on CRM events, form submissions, or database changes." },
      { icon: Sparkles, title: "Chatbot Integration", description: "Integrate AI chatbots or rule-based bots to handle conversations automatically, escalating to human agents when needed." },
      { icon: Zap, title: "Event-Driven Messaging", description: "React to real-time events with instant WhatsApp messages. Connect via webhooks to any system that generates events." },
      { icon: Users, title: "Bulk Messaging", description: "Send personalized messages to multiple recipients with template variables, scheduling, and delivery tracking." },
    ],
    steps: [
      { title: "Define Your Automation Rules", description: "Set up triggers and conditions for when automated messages should be sent, such as incoming message keywords or external events." },
      { title: "Configure Webhooks & API Calls", description: "Use QuackAPI webhooks to receive incoming messages and the REST API to send automated responses based on your logic." },
      { title: "Monitor & Optimize", description: "Track message delivery, response rates, and automation performance through the QuackAPI dashboard to continuously improve." },
    ],
    codeExample: `app.post("/webhook/whatsapp", async (req, res) => {
  const { from, message } = req.body;
  const text = message.content.toLowerCase();

  let reply = "";
  if (text.includes("pricing")) {
    reply = "Our plans start at $29/month. Visit https://example.com/pricing for details.";
  } else if (text.includes("demo")) {
    reply = "Book a demo here: https://example.com/demo. We'd love to show you around!";
  } else if (text.includes("support")) {
    reply = "Creating a support ticket for you now. A team member will respond within 1 hour.";
  } else {
    reply = "Hi! I'm QuackAPI Bot. I can help with: pricing, demo, or support. What do you need?";
  }

  await fetch("https://your-domain.com/api/messages/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "wa_your_api_key_here"
    },
    body: JSON.stringify({
      deviceId: 1,
      to: from,
      content: reply,
      type: "text"
    })
  });

  res.sendStatus(200);
});`,
    codeFilename: "auto-reply-bot.js",
  },
  ecommerce: {
    slug: "ecommerce",
    title: "WhatsApp E-commerce API",
    description: "Recover abandoned carts, send order updates, and engage shoppers with personalized WhatsApp messages to boost e-commerce sales.",
    metaDescription: "Use WhatsApp API to recover abandoned carts, send order confirmations, shipping updates, and boost e-commerce sales by 35%. Integrate with Shopify, WooCommerce, and any backend.",
    keywords: "whatsapp abandoned cart, whatsapp ecommerce notifications, whatsapp order tracking, whatsapp shopify integration",
    icon: ShoppingCart,
    heroDescription: "Turn abandoned carts into completed orders. WhatsApp messages see 98% open rates versus 21% for email, making it the highest-converting recovery channel for e-commerce businesses in 2026.",
    benefits: [
      { icon: ShoppingCart, title: "Abandoned Cart Recovery", description: "Send timely, personalized WhatsApp reminders to shoppers who leave items in their cart. Recover 25–35% of abandoned carts." },
      { icon: Package, title: "Order Confirmations", description: "Instantly confirm orders with item details, total, and estimated delivery. Reduce customer anxiety and support tickets." },
      { icon: Truck, title: "Shipping & Delivery Updates", description: "Keep customers informed with real-time shipping status, tracking numbers, and delivery notifications directly on WhatsApp." },
      { icon: CreditCard, title: "Payment Alerts", description: "Notify customers of successful payments, failed transactions, subscription renewals, and refund confirmations." },
      { icon: TrendingUp, title: "Upsell & Cross-sell", description: "Send personalized product recommendations based on purchase history. WhatsApp's engagement rates make upsell campaigns highly effective." },
      { icon: Star, title: "Post-Purchase Reviews", description: "Request product reviews and testimonials over WhatsApp within 48 hours of delivery when satisfaction is highest." },
    ],
    steps: [
      { title: "Connect Your WhatsApp Device", description: "Add a business WhatsApp number to QuackAPI by scanning a QR code. Takes under 2 minutes — no Meta Business approval required." },
      { title: "Hook Into Your E-commerce Events", description: "Trigger WhatsApp messages from your Shopify, WooCommerce, or custom backend when cart abandonment, order, or payment events occur." },
      { title: "Recover Carts & Delight Customers", description: "Send a 3-step recovery sequence at 30 minutes, 24 hours, and 72 hours. Track recovery rates via webhooks and optimize your messaging." },
    ],
    codeExample: `// Shopify / WooCommerce abandoned cart webhook handler
app.post('/webhook/cart-abandoned', async (req, res) => {
  const { customer, cart, checkoutUrl } = req.body;

  // Wait 30 minutes before sending first message
  setTimeout(async () => {
    const items = cart.items.map(i =>
      \`• \${i.name} x\${i.quantity} — $\${i.price}\`
    ).join('\\n');

    await fetch('https://quackapi.com/api/messages/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.QUACKAPI_KEY
      },
      body: JSON.stringify({
        deviceId: 1,
        to: customer.phone,  // e.g. "12025551234"
        content: \`Hi \${customer.name}! You left items in your cart:\\n\${items}\\n\\nTotal: $\${cart.total}\\n\\nComplete your order: \${checkoutUrl}\`,
        type: 'text'
      })
    });
  }, 30 * 60 * 1000);  // 30 minutes

  res.sendStatus(200);
});`,
    codeFilename: "cart-recovery.js",
  },
  healthcare: {
    slug: "healthcare",
    title: "WhatsApp Healthcare Communication API",
    description: "Reduce no-shows by 40% with automated WhatsApp appointment reminders, prescription alerts, and patient follow-up messages for clinics and healthcare providers.",
    metaDescription: "Send WhatsApp appointment reminders, prescription notifications, and patient follow-ups for healthcare with QuackAPI. Reduce no-shows by 40% and improve patient outcomes.",
    keywords: "whatsapp appointment reminder, whatsapp patient communication, whatsapp healthcare api, whatsapp medical notifications",
    icon: Stethoscope,
    heroDescription: "Improve patient outcomes and reduce administrative burden with WhatsApp communication. Patients read WhatsApp messages immediately — making it the most effective channel for appointment reminders, lab results, and care follow-ups.",
    benefits: [
      { icon: Calendar, title: "Appointment Reminders", description: "Send automated reminders 24 hours and 2 hours before appointments. Reduce no-shows by up to 40% and free up calendar slots for other patients." },
      { icon: Pill, title: "Prescription Reminders", description: "Remind patients to take their medication on schedule. Improve treatment adherence and patient health outcomes with gentle automated reminders." },
      { icon: Activity, title: "Lab Result Notifications", description: "Notify patients when lab results are ready with a secure link to their patient portal. Reduce inbound calls from patients checking on results." },
      { icon: Heart, title: "Post-Care Follow-ups", description: "Check in with patients after procedures or hospital stays. Automated follow-up messages improve satisfaction scores and catch complications early." },
      { icon: MessageCircle, title: "Two-Way Patient Communication", description: "Receive patient replies via webhooks. Allow patients to confirm, cancel, or reschedule appointments by replying to a WhatsApp message." },
      { icon: ShieldCheck, title: "Secure Messaging", description: "WhatsApp uses end-to-end encryption by default. Messages are protected in transit, making it suitable for non-sensitive health communications." },
    ],
    steps: [
      { title: "Connect Your Clinic WhatsApp", description: "Link your clinic's WhatsApp number to QuackAPI by scanning a QR code. No Meta Business verification needed — up and running in 2 minutes." },
      { title: "Integrate With Your Booking System", description: "Connect QuackAPI to your practice management software (Calendly, SimplePractice, custom EHR) via webhooks or REST API calls." },
      { title: "Automate Patient Communication", description: "Set up reminder sequences for appointments, prescriptions, and follow-ups. Patients reply directly and you receive those replies via webhook." },
    ],
    codeExample: `// Send appointment reminder 24 hours before
async function sendAppointmentReminder(patient, appointment) {
  const apptDate = new Date(appointment.datetime).toLocaleString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const message =
    \`Hi \${patient.name}! 👋\\n\\n\` +
    \`This is a reminder for your appointment:\\n\` +
    \`📅 \${apptDate}\\n\` +
    \`📍 \${appointment.location}\\n\` +
    \`👨‍⚕️ Dr. \${appointment.doctorName}\\n\\n\` +
    \`Reply YES to confirm, NO to cancel, or RESCHEDULE to pick a new time.\\n\\n\` +
    \`Need to call us? \${appointment.clinicPhone}\`;

  await fetch('https://quackapi.com/api/messages/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': process.env.QUACKAPI_KEY
    },
    body: JSON.stringify({
      deviceId: 1,
      to: patient.phone,
      content: message,
      type: 'text'
    })
  });
}

// Handle patient replies via webhook
app.post('/webhook/patient-reply', async (req, res) => {
  const { from, message } = req.body;
  const reply = message.content.toUpperCase().trim();

  if (reply === 'YES') {
    await confirmAppointment(from);
    await sendWhatsApp(from, 'Appointment confirmed! See you soon. 🏥');
  } else if (reply === 'NO') {
    await cancelAppointment(from);
    await sendWhatsApp(from, 'Appointment cancelled. Book again at: https://yourclinic.com/book');
  }

  res.sendStatus(200);
});`,
    codeFilename: "appointment-reminder.js",
  },
};

const allUseCases = [
  { slug: "notifications", title: "WhatsApp Notifications", description: "Send order confirmations, shipping updates, appointment reminders, and payment alerts.", icon: Bell },
  { slug: "otp", title: "OTP & Verification", description: "Deliver one-time passwords, 2FA codes, and account verification securely.", icon: Lock },
  { slug: "customer-support", title: "Customer Support", description: "Enable live chat, automated responses, and helpdesk ticket creation.", icon: Users },
  { slug: "automation", title: "Message Automation", description: "Build auto-replies, scheduled messages, and chatbot integrations.", icon: Bot },
  { slug: "ecommerce", title: "E-commerce & Cart Recovery", description: "Recover abandoned carts, send order updates, and boost sales with personalized WhatsApp messages.", icon: ShoppingCart },
  { slug: "healthcare", title: "Healthcare Communication", description: "Reduce no-shows with appointment reminders, prescription alerts, and patient follow-ups.", icon: Stethoscope },
];

function UseCaseCodeBlock({ code, filename }: { code: string; filename: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#1e1e2e] rounded-xl overflow-hidden border border-white/10">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
        <span className="text-white/40 text-xs font-mono">{filename}</span>
        <button
          onClick={handleCopy}
          className="text-white/40 hover:text-white/80 transition-colors p-1"
          data-testid="button-copy-code"
        >
          {copied ? <CheckCheck className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
        </button>
      </div>
      <pre className="p-4 text-sm overflow-x-auto max-h-[500px]">
        <code className="text-green-300 font-mono whitespace-pre leading-relaxed">{code}</code>
      </pre>
    </div>
  );
}


function UseCaseFooter() {
  return (
    <footer className="border-t border-border/50 bg-card/50" data-testid="usecase-footer">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg shadow-primary/20">
              W
            </div>
            <span className="font-display font-bold text-lg">QuackAPI</span>
          </div>
          <div className="flex items-center gap-6 flex-wrap justify-center">
            <Link href="/terms" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-terms">Terms</Link>
            <Link href="/privacy" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-privacy">Privacy</Link>
            <Link href="/contact" className="text-sm text-muted-foreground hover:text-foreground transition-colors" data-testid="link-contact">Contact</Link>
          </div>
          <p className="text-sm text-muted-foreground">QuackAPI. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}

function UseCaseIndexPage() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="WhatsApp API Use Cases"
        description="Explore how businesses use QuackAPI WhatsApp API for notifications, OTP verification, customer support, and message automation. Find the right use case for your business."
        canonical="/use-cases"
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb" data-testid="breadcrumb">
          <a href="/" className="hover:text-foreground transition-colors" data-testid="breadcrumb-home">Home</a>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium">Use Cases</span>
        </nav>

        <div className="text-center mb-16">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-6">WhatsApp API Use Cases</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Discover how businesses leverage QuackAPI to streamline their WhatsApp communication. From transactional notifications to intelligent automation.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-20">
          {allUseCases.map((uc) => (
            <Card
              key={uc.slug}
              className="border-border/50 hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer bg-background"
              onClick={() => setLocation(`/use-cases/${uc.slug}`)}
              data-testid={`card-usecase-${uc.slug}`}
            >
              <CardContent className="p-8">
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <uc.icon className="w-7 h-7 text-primary" />
                </div>
                <h2 className="font-display text-xl font-semibold mb-3">{uc.title}</h2>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">{uc.description}</p>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary" data-testid={`link-learn-more-${uc.slug}`}>
                  Learn more <ArrowRight className="w-4 h-4" />
                </span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <UseCaseFooter />
    </div>
  );
}

function UseCaseDetailPage({ data }: { data: UseCaseData }) {
  const [, setLocation] = useLocation();
  const Icon = data.icon;

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: typeof window !== "undefined" ? window.location.origin : "" },
      { "@type": "ListItem", position: 2, name: "Use Cases", item: typeof window !== "undefined" ? `${window.location.origin}/use-cases` : "" },
      { "@type": "ListItem", position: 3, name: data.title },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: data.title,
    description: data.metaDescription,
    keywords: data.keywords,
    publisher: { "@type": "Organization", name: "QuackAPI" },
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={data.title}
        description={data.metaDescription}
        canonical={`/use-cases/${data.slug}`}
        ogImage="/og-image.png"
        jsonLd={[breadcrumbJsonLd, articleJsonLd]}
      />
      <Navbar />

      <div className="max-w-7xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb" data-testid="breadcrumb">
          <a href="/" className="hover:text-foreground transition-colors" data-testid="breadcrumb-home">Home</a>
          <ChevronRight className="w-4 h-4" />
          <Link href="/use-cases" className="hover:text-foreground transition-colors" data-testid="breadcrumb-use-cases">Use Cases</Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-foreground font-medium" data-testid="breadcrumb-current">{data.title}</span>
        </nav>
      </div>

      <section className="relative overflow-hidden pt-8 pb-20" data-testid="section-hero">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl opacity-20" />
        <div className="relative max-w-4xl mx-auto px-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Icon className="w-8 h-8 text-primary" />
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold tracking-tight mb-6" data-testid="text-title">{data.title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed" data-testid="text-description">
            {data.heroDescription}
          </p>
          <div className="mt-8">
            <Button size="lg" onClick={() => setLocation("/auth")} className="shadow-xl shadow-primary/25" data-testid="button-hero-cta">
              Get Started Free <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>

      <section className="py-20" data-testid="section-benefits">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
              Why Use WhatsApp for {data.slug === "notifications" ? "Notifications" : data.slug === "otp" ? "OTP & Verification" : data.slug === "customer-support" ? "Customer Support" : "Automation"}?
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Discover the advantages of using WhatsApp as your communication channel
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.benefits.map((benefit, i) => (
              <Card key={i} className="border-border/50 bg-background" data-testid={`card-benefit-${i}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <benefit.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-display text-lg font-semibold mb-2">{benefit.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{benefit.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 bg-card/50" data-testid="section-how-it-works">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">How It Works with QuackAPI</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              Get up and running in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {data.steps.map((step, i) => (
              <div key={i} className="text-center" data-testid={`card-step-${i}`}>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative">
                  <span className="text-2xl font-bold text-primary">{i + 1}</span>
                </div>
                <h3 className="font-display text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20" data-testid="section-code-example">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">Implementation Example</h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              See how easy it is to implement with just a few lines of code
            </p>
          </div>
          <UseCaseCodeBlock code={data.codeExample} filename={data.codeFilename} />
        </div>
      </section>

      <section className="py-20 bg-card/50" data-testid="section-cta">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="font-display text-3xl md:text-4xl font-bold mb-4">
            Ready to Get Started?
          </h2>
          <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto leading-relaxed">
            Create your free QuackAPI account and start sending WhatsApp messages in minutes. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button size="lg" onClick={() => setLocation("/auth")} className="shadow-xl shadow-primary/25" data-testid="button-cta-signup">
              Start Free Trial <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => setLocation("/docs")} data-testid="button-cta-docs">
              View API Docs
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16" data-testid="section-related-tutorials">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="font-display text-2xl font-bold mb-6">Related Tutorials</h2>
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {data.slug === "notifications" && (
                <>
                  <a href="/blog/send-whatsapp-messages-python" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-python">Send Messages with Python</a>
                  <a href="/blog/send-whatsapp-messages-nodejs" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-nodejs">Send Messages with Node.js</a>
                  <a href="/blog/whatsapp-webhook-setup-guide" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-webhooks">Webhook Setup Guide</a>
                </>
              )}
              {data.slug === "otp" && (
                <>
                  <a href="/blog/whatsapp-otp-verification-nodejs" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-otp">OTP Verification in Node.js</a>
                  <a href="/blog/send-whatsapp-messages-python" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-python">Send Messages with Python</a>
                  <a href="/docs" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-docs">API Documentation</a>
                </>
              )}
              {data.slug === "customer-support" && (
                <>
                  <a href="/blog/build-whatsapp-chatbot-python" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-chatbot">Build a Chatbot with Python</a>
                  <a href="/blog/whatsapp-webhook-setup-guide" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-webhooks">Webhook Setup Guide</a>
                  <a href="/docs" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-docs">API Documentation</a>
                </>
              )}
              {data.slug === "automation" && (
                <>
                  <a href="/blog/connect-whatsapp-api-crm-integration" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-crm">CRM Integration Guide</a>
                  <a href="/blog/whatsapp-webhook-setup-guide" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-webhooks">Webhook Setup Guide</a>
                  <a href="/blog/build-whatsapp-chatbot-python" className="text-sm font-medium text-primary hover:underline" data-testid="link-related-chatbot">Build a Chatbot with Python</a>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <UseCaseFooter />
    </div>
  );
}

export default function UseCasesPage() {
  const [matched, params] = useRoute("/use-cases/:slug");

  if (!matched || !params?.slug) {
    return <UseCaseIndexPage />;
  }

  const data = useCasesData[params.slug];

  if (!data) {
    return <UseCaseIndexPage />;
  }

  return <UseCaseDetailPage data={data} />;
}
