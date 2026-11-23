import type { Metadata } from "next";
import {
  Instrument_Serif,
  IBM_Plex_Mono,
  Space_Grotesk,
  Syne,
  Bebas_Neue,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
});

const ibmPlexMono = IBM_Plex_Mono({
  weight: ["400", "500", "600"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const spaceGrotesk = Space_Grotesk({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-grotesk",
});

const syne = Syne({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-syne",
});

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
});

const playfairDisplay = Playfair_Display({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

export const metadata: Metadata = {
  title: "TypeMotion — SVG & Typography to Motion, No Timeline Required",
  description:
    "Turn static typography or SVG marks into kinetic motion graphics in seconds. Adjust speed, stagger, intensity, and export to WebM or GIF.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${ibmPlexMono.variable} ${spaceGrotesk.variable} ${syne.variable} ${bebasNeue.variable} ${playfairDisplay.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F5F3EE] text-[#141413] font-mono selection:bg-[#2563EB] selection:text-white">
        {children}
      </body>
    </html>
  );
}
