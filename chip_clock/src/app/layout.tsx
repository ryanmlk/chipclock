"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/themeProvider";
import { Toaster } from "sonner";
import { ClerkProvider, SignedIn, UserButton } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { AppSidebar } from "@/components/appSidebar";
import { ThemeToggle } from "@/components/themeToggle";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";


const inter = Inter({
  subsets: ["latin"],
  display: "swap",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning className={inter.className}>
        <body className="bg-background text-foreground antialiased min-h-screen">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="border-b border-border px-6 py-3 flex items-center justify-between sticky top-0 bg-card z-50">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="-ml-1" />
                  </div>

                  <div className="flex items-center gap-4 flex-1 justify-end">
                    <div className="relative group max-w-64 w-full hidden md:block">
                      <Input
                        className="bg-muted border-none rounded-full py-2 pl-10 pr-4 text-sm focus:ring-2 focus:ring-primary/20"
                        placeholder="Search shifts..."
                        type="text"
                      />
                      <Search className="absolute left-3 top-2.5 text-muted-foreground w-4 h-4" />
                    </div>
                    <ThemeToggle />
                    <div className="flex items-center gap-3 pl-4 border-l border-border/40">
                      <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                      </SignedIn>
                    </div>
                  </div>
                </header>
                <SessionProvider>
                  <main className="flex-1 p-6">{children}</main>
                </SessionProvider>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
          <Analytics />
        </body>
      </html>
    </ClerkProvider>
  );
}