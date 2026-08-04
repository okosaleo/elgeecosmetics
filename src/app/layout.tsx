import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Footer from "./components/footer";
import { Figtree } from "next/font/google";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { extractRouterConfig } from "uploadthing/server";
import { cn } from "@/lib/utils";
import { ourFileRouter } from "./api/uploadthing/core";
import { Toaster } from "@/components/ui/toast";
import { CartProvider } from "@/components/cart/cart-provider";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { getOrCreateCart, toCartSummary } from "@/lib/cart";
import { DEFAULT_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo";
import { JsonLd } from "@/components/seo/json-ld";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const neueMontreal = localFont({
  src: "./fonts/ClashDisplay-Variable.woff2",
    
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Makeup Lights, Tripods & Cosmetics in Nigeria`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "ring light Nigeria",
    "makeup light",
    "tripod for phone",
    "vanity mirror light",
    "cosmetics Nigeria",
    "ElgeeCosmetics",
  ],
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Makeup Lights, Tripods & Cosmetics`,
    description: DEFAULT_DESCRIPTION,
    url: SITE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Makeup Lights, Tripods & Cosmetics`,
    description: DEFAULT_DESCRIPTION,
  },
  robots: { index: true, follow: true },
  alternates: { canonical: "/" },
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    const cart = await getOrCreateCart();
  const cartSummary = toCartSummary(cart);


  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", neueMontreal.className, "font-sans", figtree.variable)}
    >
      <body className="min-h-full flex flex-col">
        <NextSSRPlugin
          /**
           * The `extractRouterConfig` will extract **only** the route configs
           * from the router to prevent additional information from being
           * leaked to the client. The data passed to the client is the same
           * as if you were to fetch `/api/uploadthing` directly.
           */
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
                <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: SITE_NAME,
            url: SITE_URL,
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            potentialAction: {
              "@type": "SearchAction",
              target: `${SITE_URL}/shop?q={search_term_string}`,
              "query-input": "required name=search_term_string",
            },
          }}
        />

         <CartProvider initialCart={cartSummary}>
        {children}
         <CartDrawer />
                <Toaster />
        <Footer />
        </CartProvider>
      </body>
      
    </html>
  );
}
