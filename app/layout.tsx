import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Ando | Get the most of your CGM data",
  description:
    "Get the most of your CGM data with Ando. Automatically connect your sensor to your training and unlock deeper insights.",
  keywords: ["diabetes", "CGM", "Strava", "glucose", "cycling", "running", "fitness"],
  authors: [{ name: "Ando" }],
  openGraph: {
    title: "Ando | Get the most of your CGM data",
    description:
      "Get the most of your CGM data with Ando. Automatically connect your sensor to your training and unlock deeper insights.",
    url: "https://ando.care",
    siteName: "Ando",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ando | Get the most of your CGM data",
    description:
      "Get the most of your CGM data with Ando. Automatically connect your sensor to your training and unlock deeper insights.",
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
