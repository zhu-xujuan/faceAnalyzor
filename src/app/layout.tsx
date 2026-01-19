import type { Metadata } from "next";
import { Permanent_Marker } from "next/font/google";
import "./globals.css";

const permanentMarker = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-permanent-marker"
});

export const metadata: Metadata = {
  title: "FaceAnalyzor",
  description: "Camera UI + future AI face-attitude analysis"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={permanentMarker.variable}>
      <body>{children}</body>
    </html>
  );
}

