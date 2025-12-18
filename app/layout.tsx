import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ando | Your glucose, on every ride",
  description: "Automatically add CGM data to your Strava activities. See your performance through a new lens.",
  keywords: ["diabetes", "CGM", "Strava", "glucose", "cycling", "running", "fitness"],
  authors: [{ name: "Ando" }],
  openGraph: {
    title: "Ando | Your glucose, on every ride",
    description: "Automatically add CGM data to your Strava activities.",
    url: "https://ando.care",
    siteName: "Ando",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ando | Your glucose, on every ride",
    description: "Automatically add CGM data to your Strava activities.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${spaceGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
}
