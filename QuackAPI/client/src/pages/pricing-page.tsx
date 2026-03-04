import { useState } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Check, Zap, Crown, Shield, Smartphone, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import SEO from "@/components/seo";
import Navbar from "@/components/navbar";
import { SITE_URL } from "@/lib/config";

type ApiPlan = {
  id: number;
  key: string;
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  devicesLimit: number;
  messagesLimit: number;
  features: string[];
  isPopular: boolean;
  sortOrder: number;
};

const PLAN_META: Record<string, { icon: typeof Zap; color: string; bgColor: string; borderColor: string }> = {
  starter: { icon: Zap, color: "text-muted-foreground", bgColor: "bg-muted/50", borderColor: "border-border/50" },
  professional: { icon: Crown, color: "text-primary", bgColor: "bg-primary/10", borderColor: "border-primary/30" },
  enterprise: { icon: Shield, color: "text-purple-600", bgColor: "bg-purple-500/10", borderColor: "border-purple-500/30" },
};

export default function PricingPage() {
  const [, setLocation] = useLocation();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");

  const { data: plans, isLoading } = useQuery<ApiPlan[]>({ queryKey: ["/api/plans"] });

  const sortedPlans = plans ? [...plans].sort((a, b) => a.sortOrder - b.sortOrder) : [];

  const jsonLdSchemas = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Pricing", item: `${SITE_URL}/pricing` },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "QuackAPI",
      applicationCategory: "DeveloperApplication",
      operatingSystem: "Web",
      offers: sortedPlans.map((plan) => ({
        "@type": "Offer",
        name: plan.name,
        description: plan.description,
        price: (billingCycle === "yearly" ? plan.yearlyPrice : plan.monthlyPrice) / 100,
        priceCurrency: "USD",
        url: `${SITE_URL}/pricing`,
      })),
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="WhatsApp API Pricing — Plans & Pricing"
        description="Compare QuackAPI WhatsApp API pricing plans. Free starter plan, professional, and enterprise options with unlimited messages, webhook support, and more."
        canonical="/pricing"
        ogImage="/og-image.png"
        jsonLd={jsonLdSchemas}
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl font-display font-bold text-foreground mb-4" data-testid="text-pricing-title">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto" data-testid="text-pricing-subtitle">
            Choose the plan that fits your needs. Start free, upgrade anytime.
          </p>

          <div className="flex items-center justify-center gap-3 mt-8" data-testid="toggle-billing-cycle">
            <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
              className={`relative w-14 h-7 rounded-full transition-colors ${billingCycle === "yearly" ? "bg-primary" : "bg-muted"}`}
              data-testid="button-toggle-billing"
              aria-label="Toggle billing cycle"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform ${billingCycle === "yearly" ? "translate-x-7" : "translate-x-0"}`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
              Yearly
            </span>
            {billingCycle === "yearly" && (
              <Badge className="bg-green-500/20 text-green-600 border-green-500/30" data-testid="badge-save">
                Save ~17%
              </Badge>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" data-testid="loader-plans" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch" data-testid="grid-plans">
            {sortedPlans.map((plan) => {
              const meta = PLAN_META[plan.key] || PLAN_META.starter;
              const Icon = meta.icon;
              const price = billingCycle === "yearly" ? plan.yearlyPrice / 100 : plan.monthlyPrice / 100;
              const isPopular = plan.isPopular;

              return (
                <Card
                  key={plan.id}
                  className={`relative flex flex-col ${isPopular ? `border-2 ${meta.borderColor}` : ""}`}
                  data-testid={`card-plan-${plan.key}`}
                >
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground shadow-lg shadow-primary/25" data-testid="badge-popular">
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className="pb-4">
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className={`w-10 h-10 rounded-xl ${meta.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-5 h-5 ${meta.color}`} />
                      </div>
                      <CardTitle className="text-xl" data-testid={`text-plan-name-${plan.key}`}>{plan.name}</CardTitle>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2" data-testid={`text-plan-desc-${plan.key}`}>
                      {plan.description}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-1">
                    <div className="mb-6">
                      <div className="flex items-baseline gap-1" data-testid={`text-plan-price-${plan.key}`}>
                        <span className="text-4xl font-bold text-foreground">
                          {price === 0 ? "Free" : `$${price}`}
                        </span>
                        {price > 0 && (
                          <span className="text-muted-foreground text-sm">
                            /{billingCycle === "yearly" ? "year" : "month"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-3 mb-6 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span data-testid={`text-plan-devices-${plan.key}`}>
                          {plan.devicesLimit === -1 ? "Unlimited devices" : `${plan.devicesLimit} device${plan.devicesLimit !== 1 ? "s" : ""}`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <MessageSquare className="w-4 h-4 text-muted-foreground shrink-0" />
                        <span data-testid={`text-plan-messages-${plan.key}`}>
                          {plan.messagesLimit === -1 ? "Unlimited messages" : `${plan.messagesLimit} messages/day`}
                        </span>
                      </div>
                      {plan.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm">
                          <Check className={`w-4 h-4 shrink-0 ${meta.color}`} />
                          <span data-testid={`text-plan-feature-${plan.key}-${i}`}>{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button
                      className={`w-full ${isPopular ? "shadow-lg shadow-primary/25" : ""}`}
                      variant={isPopular ? "default" : "outline"}
                      onClick={() => setLocation("/auth")}
                      data-testid={`button-get-started-${plan.key}`}
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground" data-testid="text-pricing-note">
            All plans include REST API access. No credit card required for the free plan.
          </p>
        </div>
      </main>
    </div>
  );
}
