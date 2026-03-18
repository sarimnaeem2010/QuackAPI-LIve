import { useState } from "react";
import { useRoute, useLocation } from "wouter";
import { Check, X, ArrowRight, Zap, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import SEO from "@/components/seo";
import Navbar from "@/components/navbar";
import { SITE_URL } from "@/lib/config";

function CompareTopBanner({ competitorName }: { competitorName: string }) {
  return (
    <div className="bg-primary/10 border-b border-primary/20" data-testid="compare-top-banner">
      <div className="max-w-5xl mx-auto px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3">
        <p className="text-sm font-medium text-foreground">
          Looking for a {competitorName} alternative? QuackAPI starts free — no Meta approval needed.
        </p>
        <div className="flex items-center gap-3 flex-shrink-0">
          <a
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            data-testid="banner-link-pricing"
          >
            See Pricing
          </a>
          <a
            href="/auth"
            className="inline-flex items-center gap-1.5 bg-primary text-primary-foreground text-sm font-semibold px-4 py-1.5 rounded-lg hover:opacity-90 transition-opacity"
            data-testid="banner-link-signup"
          >
            Switch to QuackAPI →
          </a>
        </div>
      </div>
    </div>
  );
}

interface ComparisonRow {
  feature: string;
  quackapi: string;
  competitor: string;
  quackapiStatus: "yes" | "no" | "partial";
  competitorStatus: "yes" | "no" | "partial";
}

interface ComparisonData {
  slug: string;
  name: string;
  seoTitle: string;
  seoDescription: string;
  heroSubtitle: string;
  rows: ComparisonRow[];
  pricingQuackapi: string;
  pricingCompetitor: string;
  pricingCompetitorDetail: string;
  whyChoose: string[];
}

const comparisons: Record<string, ComparisonData> = {
  ultramsg: {
    slug: "ultramsg",
    name: "UltraMsg",
    seoTitle: "QuackAPI vs UltraMsg - WhatsApp API Comparison 2026",
    seoDescription: "Compare QuackAPI and UltraMsg WhatsApp API platforms. See features, pricing, and performance side-by-side.",
    heroSubtitle: "See how QuackAPI and UltraMsg compare for WhatsApp API features, pricing, and developer experience.",
    rows: [
      { feature: "Multi-device support", quackapi: "Yes", competitor: "Limited", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "Free tier", quackapi: "Yes (100 msg/day)", competitor: "No", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Webhook support", quackapi: "Yes", competitor: "Yes", quackapiStatus: "yes", competitorStatus: "yes" },
      { feature: "Message types", quackapi: "8 types", competitor: "6 types", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "API documentation", quackapi: "13+ languages", competitor: "Limited", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "QR code pairing", quackapi: "Yes", competitor: "Yes", quackapiStatus: "yes", competitorStatus: "yes" },
      { feature: "Custom webhooks per device", quackapi: "Yes", competitor: "No", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Real-time delivery tracking", quackapi: "Yes", competitor: "Basic", quackapiStatus: "yes", competitorStatus: "partial" },
    ],
    pricingQuackapi: "Free / $29/mo / $99/mo",
    pricingCompetitor: "Starts at ~$13/month",
    pricingCompetitorDetail: "No free tier, limited message types and documentation support at lower tiers.",
    whyChoose: [
      "More message types (8 vs 6) for richer communication",
      "API documentation in 13+ programming languages",
      "Generous free tier with 100 messages per day",
      "True multi-device support with independent sessions",
    ],
  },
  twilio: {
    slug: "twilio",
    name: "Twilio",
    seoTitle: "QuackAPI vs Twilio - WhatsApp API Comparison 2026",
    seoDescription: "Compare QuackAPI and Twilio for WhatsApp messaging. Find the best WhatsApp API for your business needs.",
    heroSubtitle: "See how QuackAPI and Twilio compare for WhatsApp messaging features, setup, and pricing.",
    rows: [
      { feature: "Setup complexity", quackapi: "Simple QR scan", competitor: "Business approval required", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Free tier", quackapi: "Yes", competitor: "Pay-per-message", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Multi-device", quackapi: "Yes", competitor: "Single number", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "Webhook support", quackapi: "Yes", competitor: "Yes", quackapiStatus: "yes", competitorStatus: "yes" },
      { feature: "Message types", quackapi: "8 types", competitor: "Templates only (unless approved)", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "No business approval needed", quackapi: "Yes", competitor: "No", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Self-hosted option", quackapi: "Yes", competitor: "No", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "API documentation", quackapi: "Excellent", competitor: "Excellent", quackapiStatus: "yes", competitorStatus: "yes" },
    ],
    pricingQuackapi: "Free / $29/mo / $99/mo",
    pricingCompetitor: "Per-message (~$0.005-0.05/msg)",
    pricingCompetitorDetail: "Pay-per-message pricing that scales with volume. No flat-rate option available. Business approval process required before sending.",
    whyChoose: [
      "No business approval process - start sending in minutes",
      "Simple QR scan setup instead of complex onboarding",
      "Flat monthly pricing with no per-message charges",
      "True multi-device support with separate sessions",
      "All 8 message types without template restrictions",
    ],
  },
  wati: {
    slug: "wati",
    name: "Wati",
    seoTitle: "QuackAPI vs Wati: WhatsApp API Comparison 2026",
    seoDescription: "Compare QuackAPI and Wati for WhatsApp API. See setup speed, pricing, multi-device support, and developer features side-by-side.",
    heroSubtitle: "See how QuackAPI stacks up against Wati for WhatsApp API access, pricing, and developer experience.",
    rows: [
      { feature: "Setup time", quackapi: "Under 2 minutes (QR scan)", competitor: "Days (Meta approval required)", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Business verification required", quackapi: "No", competitor: "Yes (Meta Business)", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Free tier", quackapi: "Yes (100 msg/day)", competitor: "No free tier", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Multi-device support", quackapi: "Yes", competitor: "Limited", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "REST API access", quackapi: "Full REST API", competitor: "API available", quackapiStatus: "yes", competitorStatus: "yes" },
      { feature: "Webhook support", quackapi: "Per-device webhooks", competitor: "Yes", quackapiStatus: "yes", competitorStatus: "yes" },
      { feature: "Flat monthly pricing", quackapi: "Yes", competitor: "Per-conversation charges", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Developer documentation", quackapi: "13+ language examples", competitor: "Basic", quackapiStatus: "yes", competitorStatus: "partial" },
    ],
    pricingQuackapi: "Free / $29/mo / $99/mo",
    pricingCompetitor: "From ~$49/mo + per-conversation fees",
    pricingCompetitorDetail: "Wati charges a monthly base fee plus per-conversation fees aligned with Meta's pricing model. Costs scale unpredictably with volume.",
    whyChoose: [
      "Start in minutes with a QR scan — no Meta approval wait",
      "Generous free tier to test before committing",
      "Predictable flat monthly pricing, no surprise per-message bills",
      "Full REST API with examples in 13+ programming languages",
      "Per-device webhook configuration for granular control",
    ],
  },
  aisensy: {
    slug: "aisensy",
    name: "AiSensy",
    seoTitle: "QuackAPI vs AiSensy: WhatsApp API Developer Comparison 2026",
    seoDescription: "Compare QuackAPI vs AiSensy for WhatsApp messaging. QuackAPI offers a full REST API with instant QR setup while AiSensy focuses on no-code marketing tools.",
    heroSubtitle: "QuackAPI is built for developers; AiSensy is built for marketers. See which fits your use case.",
    rows: [
      { feature: "Target audience", quackapi: "Developers & technical teams", competitor: "Non-technical marketers", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "REST API access", quackapi: "Full REST API", competitor: "API available (limited)", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "No-code setup", quackapi: "QR scan, no approval", competitor: "Requires Meta Business", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "Free tier", quackapi: "Yes (100 msg/day)", competitor: "Trial only", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "Multi-device support", quackapi: "Yes", competitor: "Limited", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "Webhook support", quackapi: "Yes, per-device", competitor: "Yes", quackapiStatus: "yes", competitorStatus: "yes" },
      { feature: "Code examples (13+ langs)", quackapi: "Yes", competitor: "No", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Flat predictable pricing", quackapi: "Yes", competitor: "Usage-based add-ons", quackapiStatus: "yes", competitorStatus: "partial" },
    ],
    pricingQuackapi: "Free / $29/mo / $99/mo",
    pricingCompetitor: "From ~$19/mo + Meta conversation fees",
    pricingCompetitorDetail: "AiSensy's base plan is affordable but adds Meta's conversation-based charges on top, making costs variable and harder to predict.",
    whyChoose: [
      "True developer-first REST API with full programmatic control",
      "No Meta Business approval — connect any WhatsApp in minutes",
      "Flat pricing with no hidden per-conversation fees",
      "Code examples in Python, Node.js, PHP, Go and 9 more languages",
      "Multiple devices with independent API keys and webhooks",
    ],
  },
  "evolution-api": {
    slug: "evolution-api",
    name: "Evolution API",
    seoTitle: "QuackAPI vs Evolution API: Managed vs Self-Hosted WhatsApp API 2026",
    seoDescription: "Compare QuackAPI (managed) vs Evolution API (self-hosted) for WhatsApp messaging. Learn the tradeoffs of cloud-hosted vs self-hosted WhatsApp API solutions.",
    heroSubtitle: "Evolution API is open-source and self-hosted. QuackAPI is fully managed. Here is what that means for you.",
    rows: [
      { feature: "Hosting", quackapi: "Fully managed cloud", competitor: "Self-hosted (you manage servers)", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "Setup time", quackapi: "Under 2 minutes", competitor: "Hours (server, Docker, config)", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Maintenance required", quackapi: "None", competitor: "Yes (updates, uptime, backups)", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Cost", quackapi: "Free / $29-99/mo", competitor: "Free software + server costs", quackapiStatus: "yes", competitorStatus: "partial" },
      { feature: "Uptime SLA", quackapi: "Yes (Enterprise plan)", competitor: "Depends on your infra", quackapiStatus: "yes", competitorStatus: "no" },
      { feature: "Multi-device support", quackapi: "Yes", competitor: "Yes", quackapiStatus: "yes", competitorStatus: "yes" },
      { feature: "Webhook support", quackapi: "Yes", competitor: "Yes", quackapiStatus: "yes", competitorStatus: "yes" },
      { feature: "Support", quackapi: "Email + priority support", competitor: "Community/GitHub only", quackapiStatus: "yes", competitorStatus: "partial" },
    ],
    pricingQuackapi: "Free / $29/mo / $99/mo",
    pricingCompetitor: "Free (+ VPS cost ~$5-20/mo)",
    pricingCompetitorDetail: "Evolution API is free open-source software, but you pay for your own server, handle SSL, manage uptime, and apply updates yourself.",
    whyChoose: [
      "No server management — infrastructure handled for you 24/7",
      "Up and running in 2 minutes, not hours of Docker configuration",
      "Guaranteed uptime SLA on Enterprise — no self-hosting headaches",
      "Email support and priority channels instead of GitHub issues only",
      "Predictable flat monthly cost vs unpredictable self-hosting ops burden",
    ],
  },
};

function StatusIcon({ status }: { status: "yes" | "no" | "partial" }) {
  if (status === "yes") return <Check className="w-5 h-5 text-green-500" />;
  if (status === "no") return <X className="w-5 h-5 text-red-500" />;
  return <span className="text-yellow-500 font-medium text-sm">Partial</span>;
}


function CompareFooter() {
  return (
    <footer className="bg-foreground text-background py-12" data-testid="compare-footer">
      <div className="max-w-7xl mx-auto px-6 text-center">
        <p className="text-background/60 mb-4">
          Ready to switch? <a href="/auth" className="text-primary hover:underline">Get started with QuackAPI</a> today.
        </p>
        <div className="flex items-center justify-center gap-6 text-sm text-background/40">
          <a href="/terms" className="hover:text-background/80 transition-colors" data-testid="link-terms">Terms</a>
          <a href="/privacy" className="hover:text-background/80 transition-colors" data-testid="link-privacy">Privacy</a>
          <a href="/contact" className="hover:text-background/80 transition-colors" data-testid="link-contact">Contact</a>
        </div>
        <p className="text-background/30 text-sm mt-4">&copy; {new Date().getFullYear()} QuackAPI. All rights reserved.</p>
      </div>
    </footer>
  );
}

function ComparisonView({ data }: { data: ComparisonData }) {
  const [, setLocation] = useLocation();

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Compare", item: `${SITE_URL}/compare` },
      { "@type": "ListItem", position: 3, name: `QuackAPI vs ${data.name}` },
    ],
  };

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      { "@type": "Question", name: `Is QuackAPI better than ${data.name}?`, acceptedAnswer: { "@type": "Answer", text: `QuackAPI offers a developer-first WhatsApp API with features like multi-device support, webhook callbacks, and a REST API starting at $0/month. Compare features side-by-side to see which fits your use case.` } },
      { "@type": "Question", name: `How does QuackAPI pricing compare to ${data.name}?`, acceptedAnswer: { "@type": "Answer", text: `QuackAPI starts with a free Starter plan and offers Professional ($29/mo) and Enterprise ($99/mo) plans. ${data.name} pricing: ${data.pricingCompetitorDetail}` } },
      { "@type": "Question", name: `Can I switch from ${data.name} to QuackAPI?`, acceptedAnswer: { "@type": "Answer", text: `Yes, migrating from ${data.name} to QuackAPI is straightforward. Sign up for a free account, connect your WhatsApp device via QR code, and update your API calls to use QuackAPI endpoints. No approval process required.` } },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title={data.seoTitle}
        description={data.seoDescription}
        canonical={`/compare/${data.slug}`}
        ogImage="/og-image.png"
        jsonLd={[breadcrumbJsonLd, faqJsonLd]}
      />
      <Navbar />
      <CompareTopBanner competitorName={data.name} />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8 flex-wrap" aria-label="Breadcrumb" data-testid="breadcrumb">
          <a href="/" className="hover:text-foreground transition-colors" data-testid="breadcrumb-home">Home</a>
          <ChevronRight className="w-3 h-3" />
          <a href="/compare" className="hover:text-foreground transition-colors" data-testid="breadcrumb-compare">Compare</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium" data-testid="breadcrumb-current">QuackAPI vs {data.name}</span>
        </nav>

        <section className="text-center mb-16" data-testid="section-hero">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
            <Zap className="w-4 h-4" />
            WhatsApp API Comparison 2026
          </div>
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-hero-title">
            QuackAPI vs {data.name}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-hero-subtitle">
            {data.heroSubtitle}
          </p>
        </section>

        <section className="mb-16" data-testid="section-comparison-table">
          <h2 className="font-display text-2xl font-bold mb-6">Feature Comparison</h2>
          <div className="border border-border/50 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm" data-testid="comparison-table">
                <thead>
                  <tr className="bg-muted/50">
                    <th className="text-left py-4 px-6 font-semibold text-muted-foreground">Feature</th>
                    <th className="text-center py-4 px-6 font-semibold text-primary">QuackAPI</th>
                    <th className="text-center py-4 px-6 font-semibold text-muted-foreground">{data.name}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows.map((row, i) => (
                    <tr key={i} className="border-t border-border/30" data-testid={`row-comparison-${i}`}>
                      <td className="py-4 px-6 font-medium">{row.feature}</td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <StatusIcon status={row.quackapiStatus} />
                          <span className="text-muted-foreground">{row.quackapi}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <StatusIcon status={row.competitorStatus} />
                          <span className="text-muted-foreground">{row.competitor}</span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="mb-16" data-testid="section-pricing-comparison">
          <h2 className="font-display text-2xl font-bold mb-6">Pricing Comparison</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="border-primary/30 bg-primary/5" data-testid="card-pricing-quackapi">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">W</div>
                  <h3 className="font-display text-lg font-semibold">QuackAPI</h3>
                </div>
                <p className="text-2xl font-bold text-primary mb-2" data-testid="text-pricing-quackapi">{data.pricingQuackapi}</p>
                <p className="text-sm text-muted-foreground">Flat monthly pricing with a generous free tier. No per-message charges. Scale predictably.</p>
              </CardContent>
            </Card>
            <Card data-testid="card-pricing-competitor">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold">{data.name[0]}</div>
                  <h3 className="font-display text-lg font-semibold">{data.name}</h3>
                </div>
                <p className="text-2xl font-bold mb-2" data-testid="text-pricing-competitor">{data.pricingCompetitor}</p>
                <p className="text-sm text-muted-foreground">{data.pricingCompetitorDetail}</p>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="mb-16" data-testid="section-why-choose">
          <h2 className="font-display text-2xl font-bold mb-6">Why Choose QuackAPI</h2>
          <div className="bg-card border border-border/50 rounded-xl p-8">
            <div className="space-y-4">
              {data.whyChoose.map((reason, i) => (
                <div key={i} className="flex items-start gap-3" data-testid={`text-reason-${i}`}>
                  <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                  <span className="text-foreground/80 leading-relaxed">{reason}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="mb-16" data-testid="section-cta">
          <div className="text-center bg-gradient-to-br from-primary/10 via-background to-primary/5 border border-border/50 rounded-xl p-12">
            <h2 className="font-display text-3xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-xl mx-auto">
              Join developers who chose QuackAPI for reliable, affordable WhatsApp messaging.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" onClick={() => setLocation("/auth")} className="shadow-lg shadow-primary/25" data-testid="button-cta-signup">
                Start Free Trial
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" onClick={() => setLocation("/docs")} data-testid="button-cta-docs">
                View API Docs
              </Button>
            </div>
          </div>
        </section>

        <section className="mb-16" data-testid="section-related-resources">
          <div className="bg-card border border-border/50 rounded-xl p-6">
            <h3 className="font-display text-lg font-semibold mb-4">Related Resources</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <a href="/docs" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-related-docs">
                <ArrowRight className="w-4 h-4" />
                API Documentation
              </a>
              <a href="/blog" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-related-blog">
                <ArrowRight className="w-4 h-4" />
                Developer Blog
              </a>
              <a href="/use-cases" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-related-use-cases">
                <ArrowRight className="w-4 h-4" />
                See Use Cases
              </a>
              <a href="/blog/whatsapp-api-vs-sms" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors" data-testid="link-related-sms">
                <ArrowRight className="w-4 h-4" />
                WhatsApp API vs SMS
              </a>
            </div>
          </div>
        </section>
      </div>

      <CompareFooter />
    </div>
  );
}

function CompareIndex() {
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Compare WhatsApp API Platforms"
        description="Compare QuackAPI with other WhatsApp API platforms like UltraMsg and Twilio. See features, pricing, and performance side-by-side."
        canonical="/compare"
      />
      <Navbar />

      <div className="max-w-5xl mx-auto px-6 py-8">
        <nav className="flex items-center gap-2 text-sm text-muted-foreground mb-8" aria-label="Breadcrumb" data-testid="breadcrumb">
          <a href="/" className="hover:text-foreground transition-colors" data-testid="breadcrumb-home">Home</a>
          <ChevronRight className="w-3 h-3" />
          <span className="text-foreground font-medium">Compare</span>
        </nav>

        <section className="text-center mb-16" data-testid="section-hero">
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4" data-testid="text-hero-title">
            Compare QuackAPI
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            See how QuackAPI stacks up against other WhatsApp API platforms.
          </p>
        </section>

        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {Object.values(comparisons).map((comp) => (
            <Card
              key={comp.slug}
              className="hover:shadow-lg hover:border-primary/20 transition-all duration-300 cursor-pointer"
              onClick={() => setLocation(`/compare/${comp.slug}`)}
              data-testid={`card-compare-${comp.slug}`}
            >
              <CardContent className="p-8">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">W</div>
                  <span className="text-muted-foreground font-medium">vs</span>
                  <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center text-muted-foreground font-bold text-xl">{comp.name[0]}</div>
                </div>
                <h2 className="font-display text-xl font-semibold mb-2">QuackAPI vs {comp.name}</h2>
                <p className="text-muted-foreground text-sm mb-4">{comp.heroSubtitle}</p>
                <div className="flex items-center gap-2 text-primary text-sm font-medium">
                  View comparison <ArrowRight className="w-4 h-4" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <CompareFooter />
    </div>
  );
}

export default function ComparePage() {
  const [matchSlug, paramsSlug] = useRoute("/compare/:slug");

  if (matchSlug && paramsSlug?.slug) {
    const data = comparisons[paramsSlug.slug];
    if (data) {
      return <ComparisonView data={data} />;
    }
  }

  return <CompareIndex />;
}
