import type { Metadata } from 'next';
import { Outfit, Inter } from 'next/font/google';
import './globals.css';

import { SocketProvider } from '@/providers/SocketProvider';
import { CallProvider } from '@/providers/call-provider';
import { ThemeProvider } from "@/components/theme-provider"
import { AccentColorProvider } from "@/components/accent-color-provider"

const outfit = Outfit({
  variable: '--font-outfit',
  subsets: ['latin'],
});

const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Vibely | Premium Chat',
  description: 'Experience the next generation of chat.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <body
        className={`${outfit.variable} ${inter.variable} antialiased bg-background text-foreground`}
        suppressHydrationWarning
      >
        {/* ✅ ORDER MATTERS */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AccentColorProvider>
            <SocketProvider>
              <CallProvider>{children}</CallProvider>
            </SocketProvider>
          </AccentColorProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
