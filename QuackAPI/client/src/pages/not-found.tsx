import { Link } from "wouter";
import SEO from "@/components/seo";
import { Home, BookOpen, Mail, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist." noindex={true} />
      <div className="text-center max-w-lg">
        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
          <span className="text-4xl">🦆</span>
        </div>
        <h1 className="text-8xl font-bold text-primary mb-2">404</h1>
        <h2 className="text-2xl font-semibold text-foreground mb-3">Page Not Found</h2>
        <p className="text-muted-foreground mb-8">
          Looks like this page flew the coop. The URL might be wrong or the page may have moved.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-8">
          <Link href="/">
            <a className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-primary/90 transition-colors">
              <Home className="w-4 h-4" />
              Back to Home
            </a>
          </Link>
          <Link href="/docs">
            <a className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-muted transition-colors">
              <BookOpen className="w-4 h-4" />
              Documentation
            </a>
          </Link>
          <Link href="/contact">
            <a className="inline-flex items-center gap-2 border border-border text-foreground px-5 py-2.5 rounded-lg font-medium hover:bg-muted transition-colors">
              <Mail className="w-4 h-4" />
              Contact Us
            </a>
          </Link>
        </div>
        <p className="text-sm text-muted-foreground">
          <Link href="/">
            <a className="inline-flex items-center gap-1 text-primary hover:underline">
              <ArrowLeft className="w-3 h-3" />
              Return to quackapi.com
            </a>
          </Link>
        </p>
      </div>
    </div>
  );
}
