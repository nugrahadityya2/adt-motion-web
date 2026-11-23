import type { Metadata } from "next";
import {
  Outfit,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Instrument_Serif,
  Space_Grotesk,
  Syne,
  Bebas_Neue,
  Playfair_Display,
} from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  weight: ["600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-display",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  weight: ["400", "500", "600", "700"],
  subsets: ["latin"],
  variable: "--font-sans",
});

const jetbrainsMono = JetBrains_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
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
  title: "ADT Motion — SVG & Typography to Motion, No Timeline Required",
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
      className={`dark ${outfit.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable} ${syne.variable} ${bebasNeue.variable} ${playfairDisplay.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-main)] font-sans selection:bg-[#FF6D29] selection:text-[#161316]">
        {children}
      </body>
    </html>
  );
}
