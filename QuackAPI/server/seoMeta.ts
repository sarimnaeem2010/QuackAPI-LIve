export interface PageMeta {
  title: string;
  description: string;
  ogImage: string;
  canonical: string;
  ogType?: string;
}

const SITE_URL = "https://quackapi.com";

const META_MAP: Record<string, PageMeta> = {
  "/": {
    title: "QuackAPI — The WhatsApp API That Just Works",
    description: "QuackAPI — The ultimate WhatsApp automation stack. Connect multiple WhatsApp devices, send messages via REST API, and receive real-time webhooks. No Meta approval needed.",
    ogImage: "/og-image.png",
    canonical: "/",
  },
  "/pricing": {
    title: "WhatsApp API Pricing — Free, Pro & Enterprise Plans",
    description: "Compare QuackAPI WhatsApp API pricing. Free starter plan, $29/mo Professional, and $99/mo Enterprise. No Meta Business verification required. Start free today.",
    ogImage: "/og-image.png",
    canonical: "/pricing",
  },
  "/docs": {
    title: "WhatsApp API Documentation — REST API Reference",
    description: "Complete QuackAPI documentation. REST API reference, webhook setup, authentication, and code examples in 13+ languages including Python, Node.js, PHP, Go, and Ruby.",
    ogImage: "/og-docs.png",
    canonical: "/docs",
  },
  "/blog": {
    title: "WhatsApp API Blog — Developer Tutorials & Guides",
    description: "WhatsApp API tutorials, integration guides, and developer resources. Learn to send messages, set up webhooks, build chatbots, and automate WhatsApp with QuackAPI.",
    ogImage: "/og-blog.png",
    canonical: "/blog",
    ogType: "website",
  },
  "/compare": {
    title: "WhatsApp API Comparison — QuackAPI vs Top Providers",
    description: "Compare QuackAPI against UltraMsg, Twilio, WATI, AiSensy, and Evolution API. See how we deliver more value at a lower cost with no Meta approval required.",
    ogImage: "/og-image.png",
    canonical: "/compare",
  },
  "/compare/ultramsg": {
    title: "QuackAPI vs UltraMsg — WhatsApp API Comparison 2026",
    description: "QuackAPI vs UltraMsg side-by-side comparison. Compare pricing, message limits, multi-device support, webhook reliability, and developer experience.",
    ogImage: "/og-image.png",
    canonical: "/compare/ultramsg",
  },
  "/compare/twilio": {
    title: "QuackAPI vs Twilio — Cheaper WhatsApp API Alternative",
    description: "QuackAPI vs Twilio for WhatsApp messaging. Skip Meta approval, avoid per-message fees, and save up to 90% vs Twilio's WhatsApp API. Compare features and cost.",
    ogImage: "/og-image.png",
    canonical: "/compare/twilio",
  },
  "/compare/wati": {
    title: "QuackAPI vs WATI — WhatsApp Business API Comparison",
    description: "QuackAPI vs WATI comparison for WhatsApp API. More flexible, cheaper, and no business verification needed. See the full feature and pricing breakdown.",
    ogImage: "/og-image.png",
    canonical: "/compare/wati",
  },
  "/compare/aisensy": {
    title: "QuackAPI vs AiSensy — WhatsApp API Comparison 2026",
    description: "QuackAPI vs AiSensy: which WhatsApp API is right for your business? Compare pricing tiers, device limits, API flexibility, and developer documentation quality.",
    ogImage: "/og-image.png",
    canonical: "/compare/aisensy",
  },
  "/compare/evolution-api": {
    title: "QuackAPI vs Evolution API — SaaS vs Self-Hosted WhatsApp",
    description: "QuackAPI vs Evolution API: managed SaaS vs self-hosted WhatsApp API. Compare setup complexity, maintenance burden, cost, and reliability.",
    ogImage: "/og-image.png",
    canonical: "/compare/evolution-api",
  },
  "/use-cases": {
    title: "WhatsApp API Use Cases — How Businesses Use QuackAPI",
    description: "Discover how businesses use QuackAPI's WhatsApp API for notifications, OTP verification, customer support, marketing automation, e-commerce, and healthcare messaging.",
    ogImage: "/og-image.png",
    canonical: "/use-cases",
  },
  "/use-cases/notifications": {
    title: "WhatsApp Notification API — Automated Alerts & Updates",
    description: "Send real-time WhatsApp notifications: order updates, shipping tracking, appointment reminders, and system alerts. REST API with 98% open rates vs 20% for email.",
    ogImage: "/og-image.png",
    canonical: "/use-cases/notifications",
  },
  "/use-cases/otp": {
    title: "WhatsApp OTP Verification API — 2FA via WhatsApp",
    description: "Implement WhatsApp OTP for two-factor authentication. Higher delivery and open rates than SMS OTP. Easy REST API integration, works without Meta Business Account.",
    ogImage: "/og-image.png",
    canonical: "/use-cases/otp",
  },
  "/use-cases/customer-support": {
    title: "WhatsApp Customer Support API — Automate Support Tickets",
    description: "Build WhatsApp customer support automation. Receive customer messages via webhook, auto-reply with chatbots, and manage conversations through your CRM via REST API.",
    ogImage: "/og-image.png",
    canonical: "/use-cases/customer-support",
  },
  "/use-cases/automation": {
    title: "WhatsApp Automation API — Schedule & Trigger Messages",
    description: "Automate WhatsApp messaging for marketing, sales, and operations. Schedule messages, trigger automated workflows, and build WhatsApp chatbots with QuackAPI.",
    ogImage: "/og-image.png",
    canonical: "/use-cases/automation",
  },
  "/use-cases/ecommerce": {
    title: "WhatsApp API for E-commerce — Orders, Cart & Shipping",
    description: "Use WhatsApp API for e-commerce: abandoned cart recovery, order confirmations, shipping updates, and customer support. Boost sales with automated WhatsApp messaging.",
    ogImage: "/og-image.png",
    canonical: "/use-cases/ecommerce",
  },
  "/use-cases/healthcare": {
    title: "WhatsApp API for Healthcare — Appointment & Patient Alerts",
    description: "Healthcare WhatsApp API for appointment reminders, patient notifications, prescription alerts, and lab result updates. Reduce no-shows and improve patient engagement.",
    ogImage: "/og-image.png",
    canonical: "/use-cases/healthcare",
  },
  "/contact": {
    title: "Contact QuackAPI — WhatsApp API Support & Sales",
    description: "Get in touch with the QuackAPI team. Support for API integration, enterprise sales inquiries, partnership opportunities, or general questions about our WhatsApp API.",
    ogImage: "/og-image.png",
    canonical: "/contact",
  },
  "/terms": {
    title: "Terms of Service | QuackAPI",
    description: "QuackAPI Terms of Service. Read our terms and conditions for using the QuackAPI WhatsApp API platform, including acceptable use, payment terms, and service levels.",
    ogImage: "/og-image.png",
    canonical: "/terms",
  },
  "/privacy": {
    title: "Privacy Policy | QuackAPI",
    description: "QuackAPI Privacy Policy. Learn how we collect, use, store, and protect your personal data and WhatsApp session data on our API platform.",
    ogImage: "/og-image.png",
    canonical: "/privacy",
  },
  "/refund": {
    title: "Refund Policy | QuackAPI",
    description: "QuackAPI Refund Policy. Understand our refund terms and process for requesting a refund on any QuackAPI subscription plan.",
    ogImage: "/og-image.png",
    canonical: "/refund",
  },
};

const BLOG_META_MAP: Record<string, PageMeta> = {
  "send-whatsapp-messages-python": {
    title: "How to Send WhatsApp Messages with Python — Full Tutorial",
    description: "Step-by-step tutorial: send WhatsApp messages using Python and the QuackAPI REST API. Complete code examples with the requests library, error handling, and media sending.",
    ogImage: "/og-blog.png",
    canonical: "/blog/send-whatsapp-messages-python",
    ogType: "article",
  },
  "whatsapp-api-vs-sms": {
    title: "WhatsApp API vs SMS: Which is Better for Business in 2026?",
    description: "WhatsApp API vs SMS compared: open rates, delivery speed, cost per message, and engagement metrics. Find out which messaging channel wins for your business use case.",
    ogImage: "/og-blog.png",
    canonical: "/blog/whatsapp-api-vs-sms",
    ogType: "article",
  },
  "whatsapp-webhook-setup-guide": {
    title: "Complete Guide to Setting Up WhatsApp Webhooks",
    description: "Learn to set up WhatsApp webhooks with QuackAPI. Configure your endpoint, understand the payload structure, handle incoming messages, and test with ngrok.",
    ogImage: "/og-blog.png",
    canonical: "/blog/whatsapp-webhook-setup-guide",
    ogType: "article",
  },
  "whatsapp-otp-verification-nodejs": {
    title: "Implement WhatsApp OTP Verification in Node.js",
    description: "Build WhatsApp OTP verification in Node.js with Express and QuackAPI. Generate secure codes, send via WhatsApp, verify input, and handle expiry — complete tutorial.",
    ogImage: "/og-blog.png",
    canonical: "/blog/whatsapp-otp-verification-nodejs",
    ogType: "article",
  },
  "send-whatsapp-messages-php": {
    title: "How to Send WhatsApp Messages with PHP — Complete Guide",
    description: "Send WhatsApp messages from PHP using QuackAPI. Full tutorial with cURL and Guzzle HTTP examples, error handling, retry logic, and sending images or documents.",
    ogImage: "/og-blog.png",
    canonical: "/blog/send-whatsapp-messages-php",
    ogType: "article",
  },
  "send-whatsapp-messages-nodejs": {
    title: "How to Send WhatsApp Messages with Node.js",
    description: "Send WhatsApp messages with Node.js and QuackAPI. Covers axios setup, authentication, sending text and media, webhook handling, and production best practices.",
    ogImage: "/og-blog.png",
    canonical: "/blog/send-whatsapp-messages-nodejs",
    ogType: "article",
  },
  "build-whatsapp-chatbot-python": {
    title: "Build a WhatsApp Chatbot with Python and Flask",
    description: "Create a WhatsApp chatbot using Python, Flask, and QuackAPI. Handle incoming messages via webhook, build automated responses, add NLP, and deploy your bot.",
    ogImage: "/og-blog.png",
    canonical: "/blog/build-whatsapp-chatbot-python",
    ogType: "article",
  },
  "avoid-whatsapp-number-ban": {
    title: "How to Avoid Getting Your WhatsApp Number Banned",
    description: "Protect your WhatsApp number from being banned when using the API. Rate limiting, opt-in best practices, message template guidelines, and safe sending patterns.",
    ogImage: "/og-blog.png",
    canonical: "/blog/avoid-whatsapp-number-ban",
    ogType: "article",
  },
  "connect-whatsapp-api-crm-integration": {
    title: "How to Integrate WhatsApp API with Your CRM",
    description: "Connect QuackAPI to your CRM via webhook and REST API. Step-by-step guide for HubSpot, Salesforce, Zoho, and custom CRM integrations for WhatsApp messaging.",
    ogImage: "/og-blog.png",
    canonical: "/blog/connect-whatsapp-api-crm-integration",
    ogType: "article",
  },
  "whatsapp-api-messaging-best-practices": {
    title: "WhatsApp API Messaging Best Practices for Developers",
    description: "Developer guide to WhatsApp API best practices: message rate limits, session management, template best practices, error handling strategies, and compliance tips.",
    ogImage: "/og-blog.png",
    canonical: "/blog/whatsapp-api-messaging-best-practices",
    ogType: "article",
  },
  "whatsapp-api-without-meta-approval": {
    title: "How to Use WhatsApp API Without Meta Business Verification",
    description: "Use WhatsApp API without Meta Business account or approval. QuackAPI lets you connect via QR code scan — start sending messages in minutes, no verification required.",
    ogImage: "/og-blog.png",
    canonical: "/blog/whatsapp-api-without-meta-approval",
    ogType: "article",
  },
  "whatsapp-api-free-alternatives": {
    title: "Best Free WhatsApp API Alternatives in 2026",
    description: "Compare the best free and affordable WhatsApp API alternatives in 2026. Self-hosted options, free tiers, and cheap paid plans — no Meta business account needed.",
    ogImage: "/og-blog.png",
    canonical: "/blog/whatsapp-api-free-alternatives",
    ogType: "article",
  },
  "whatsapp-abandoned-cart-recovery": {
    title: "WhatsApp Abandoned Cart Recovery: Boost E-commerce Sales",
    description: "Recover abandoned shopping carts with WhatsApp automation. Set up triggered messages, personalize content with order data, and boost e-commerce conversion rates by 35%.",
    ogImage: "/og-blog.png",
    canonical: "/blog/whatsapp-abandoned-cart-recovery",
    ogType: "article",
  },
};

function escapeAttr(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function resolveRouteMeta(pathname: string): PageMeta | null {
  const normalizedPath = pathname === "/" ? "/" : pathname.replace(/\/$/, "");

  if (META_MAP[normalizedPath]) return META_MAP[normalizedPath];

  const blogMatch = normalizedPath.match(/^\/blog\/([a-z0-9-]+)$/);
  if (blogMatch) {
    return (
      BLOG_META_MAP[blogMatch[1]] ?? {
        title: "WhatsApp API Blog | QuackAPI",
        description: "WhatsApp API tutorials, guides, and developer resources from the QuackAPI team.",
        ogImage: "/og-blog.png",
        canonical: normalizedPath,
        ogType: "article",
      }
    );
  }

  return null;
}

export function injectSeoMeta(html: string, pathname: string): string {
  const meta = resolveRouteMeta(pathname);
  if (!meta) return html;

  const fullCanonical = `${SITE_URL}${meta.canonical}`;
  const fullOgImage = `${SITE_URL}${meta.ogImage}`;
  const ogType = meta.ogType ?? "website";
  const safeTitle = escapeAttr(meta.title);
  const safeDesc = escapeAttr(meta.description);

  let result = html
    .replace(/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`)
    .replace(/<meta name="description"[^>]*\/?>/, `<meta name="description" content="${safeDesc}" />`);

  const injected = `\n    <link rel="canonical" href="${fullCanonical}" />\n    <meta property="og:title" content="${safeTitle}" />\n    <meta property="og:description" content="${safeDesc}" />\n    <meta property="og:image" content="${fullOgImage}" />\n    <meta property="og:url" content="${fullCanonical}" />\n    <meta property="og:type" content="${ogType}" />\n    <meta property="og:site_name" content="QuackAPI" />\n    <meta property="og:locale" content="en_US" />\n    <meta name="twitter:card" content="summary_large_image" />\n    <meta name="twitter:site" content="@QuackAPI" />\n    <meta name="twitter:title" content="${safeTitle}" />\n    <meta name="twitter:description" content="${safeDesc}" />\n    <meta name="twitter:image" content="${fullOgImage}" />`;

  result = result.replace("</head>", `${injected}\n  </head>`);

  return result;
}
