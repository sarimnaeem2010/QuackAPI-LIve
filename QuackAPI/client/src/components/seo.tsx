import { Helmet } from "react-helmet-async";
import { SITE_URL } from "@/lib/config";

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogType?: string;
  ogImage?: string;
  noindex?: boolean;
  jsonLd?: object | object[];
}

const SITE_NAME = "QuackAPI";
const DEFAULT_DESCRIPTION = "QuackAPI — The WhatsApp API that just works. Connect multiple devices, send messages via REST API, and receive real-time webhooks. Built for developers who need fast, reliable messaging.";

export default function SEO({
  title,
  description = DEFAULT_DESCRIPTION,
  canonical,
  ogType = "website",
  ogImage,
  noindex = false,
  jsonLd,
}: SEOProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} - The WhatsApp API That Just Works`;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : undefined;

  const jsonLdArray = jsonLd
    ? Array.isArray(jsonLd)
      ? jsonLd
      : [jsonLd]
    : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />

      {noindex && <meta name="robots" content="noindex, nofollow" />}
      {!noindex && <meta name="robots" content="index, follow" />}

      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      <link rel="alternate" hrefLang="en" href={canonicalUrl || SITE_URL} />
      <link rel="alternate" hrefLang="x-default" href={canonicalUrl || SITE_URL} />

      <meta property="og:locale" content="en_US" />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl && <meta property="og:url" content={canonicalUrl} />}
      {ogImage && <meta property="og:image" content={`${SITE_URL}${ogImage}`} />}
      <meta property="og:site_name" content={SITE_NAME} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@QuackAPI" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      {ogImage && <meta name="twitter:image" content={`${SITE_URL}${ogImage}`} />}

      {jsonLdArray.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
