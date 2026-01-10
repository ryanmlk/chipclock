"use client";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/themeProvider";
import { Toaster } from "sonner";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { NavigationBar } from "@/components/navBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// export const metadata: Metadata = {
//   title: "Chipotle Schedule Viewer",
//   description: "View your Chipotle schedule easily",
// };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="flex justify-between items-center mb-4 pt-6 pb-2 px-4 bg-sidebar border border-sidebar-border sticky top-0 z-10">
                    <h1 className="text-xl font-bold">Chip Clock</h1>
                    <NavigationBar />
                  </div>
            <SessionProvider>{children}</SessionProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
