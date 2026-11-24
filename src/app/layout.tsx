import type { Metadata } from "next";
import Script from "next/script";
import {
  Outfit,
  Plus_Jakarta_Sans,
  JetBrains_Mono,
  Instrument_Serif,
  Space_Grotesk,
  Syne,
  Bebas_Neue,
  Playfair_Display,
  Anton,
  DM_Serif_Display,
  Oswald,
  Bricolage_Grotesque,
  Cormorant_Garamond,
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
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

const anton = Anton({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-anton",
});

const dmSerifDisplay = DM_Serif_Display({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-dm-serif",
});

const oswald = Oswald({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-oswald",
});

const bricolageGrotesque = Bricolage_Grotesque({
  weight: ["400", "600", "800"],
  subsets: ["latin"],
  variable: "--font-bricolage",
});

const cormorantGaramond = Cormorant_Garamond({
  weight: ["500", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-cormorant",
});

export const metadata: Metadata = {
  title: "ADT Motion: Kinetic Typography & Multi-Layer Motion Studio",
  description:
    "Compose multi-layer typography and SVG animations, drag elements on canvas, add photo or video backgrounds, and export WebM, MP4, GIF, or HTML/CSS.",
  icons: {
    icon: "/adt-logo.png",
    shortcut: "/adt-logo.png",
    apple: "/adt-logo.png",
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
      className={`dark ${outfit.variable} ${plusJakartaSans.variable} ${jetbrainsMono.variable} ${instrumentSerif.variable} ${spaceGrotesk.variable} ${syne.variable} ${bebasNeue.variable} ${playfairDisplay.variable} ${anton.variable} ${dmSerifDisplay.variable} ${oswald.variable} ${bricolageGrotesque.variable} ${cormorantGaramond.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[var(--bg-page)] text-[var(--text-main)] font-sans selection:bg-[#FF6D29] selection:text-[#161316]">
        {children}
        <Script id="microsoft-clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "zibhm4fm9w");`}
        </Script>
      </body>
    </html>
  );
}
