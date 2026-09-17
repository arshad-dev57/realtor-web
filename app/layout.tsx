import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EstateX — Pakistan's Premier Luxury Real Estate Platform",
  description:
    "Discover extraordinary properties across Karachi, Lahore, and Islamabad. Connect with elite realtors, schedule tours, and find your dream home on Pakistan's most refined property platform.",
  keywords: "luxury real estate, Pakistan property, Karachi homes, Lahore DHA, Islamabad F-sector, premium properties, buy house Pakistan",
  openGraph: {
    title: "EstateX — Extraordinary Properties. Exceptional Connections.",
    description: "Pakistan's premier luxury real estate platform for discerning buyers and elite realtors.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500&family=Jost:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
