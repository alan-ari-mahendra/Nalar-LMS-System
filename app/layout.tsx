import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_URL = process.env.APP_URL ?? "http://localhost:3000"

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: "Learnify — Precision in Learning",
    template: "%s | Learnify",
  },
  description:
    "Access high-quality courses from industry experts. Master the tools and technologies used by world-class engineering teams.",
  keywords: [
    "online courses",
    "learning platform",
    "LMS",
    "Indonesian education",
    "tech courses",
  ],
  authors: [{ name: "Learnify" }],
  openGraph: {
    type: "website",
    title: "Learnify — Precision in Learning",
    description:
      "High-quality online courses from industry experts. Build the skills used by world-class engineering teams.",
    siteName: "Learnify",
    locale: "id_ID",
  },
  twitter: {
    card: "summary_large_image",
    title: "Learnify — Precision in Learning",
    description:
      "High-quality online courses from industry experts.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        {/* Material Symbols Outlined — icon font */}
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-on-surface">
        {children}
      </body>
    </html>
  );
}
