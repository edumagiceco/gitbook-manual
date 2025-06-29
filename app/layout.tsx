import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ConditionalLayout } from "@/components/ConditionalLayout";
import { docsConfig } from "@/lib/config";
import { ThemeProvider } from "next-themes";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: "GitBook Manual Site",
    template: "%s | GitBook Manual Site",
  },
  description: "A GitBook-style manual documentation site built with Next.js",
  keywords: ["documentation", "manual", "gitbook", "nextjs"],
  authors: [
    {
      name: "GitBook Manual Team",
    },
  ],
  creator: "GitBook Manual Team",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: "GitBook Manual Site",
    description: "A GitBook-style manual documentation site built with Next.js",
    siteName: "GitBook Manual Site",
  },
  twitter: {
    card: "summary_large_image",
    title: "GitBook Manual Site",
    description: "A GitBook-style manual documentation site built with Next.js",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-sans antialiased dark:bg-gray-950">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <ConditionalLayout sidebarItems={docsConfig.sidebarNav}>
            {children}
          </ConditionalLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
