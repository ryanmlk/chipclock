"use client";
import { Inter } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@/components/themeProvider";
import { Toaster } from "sonner";
import { ClerkProvider, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { AppSidebar } from "@/components/appSidebar";
import {
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Search, Bell, UtensilsCrossed } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <SidebarProvider>
              <AppSidebar />
              <SidebarInset>
                <header className="border-b border-border/40 px-6 py-3 flex items-center justify-between sticky top-0 bg-background/80 backdrop-blur-md z-50">
                  <div className="flex items-center gap-4">
                    <SidebarTrigger className="-ml-1" />
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                        <UtensilsCrossed className="text-white w-5 h-5" />
                      </div>
                      <span className="font-bold text-xl tracking-tight">
                        CHIP<span className="font-light">CLOCK</span>
                      </span>
                    </div>
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
                    <Button
                      variant="ghost"
                      size="icon"
                      className="rounded-full relative"
                    >
                      <Bell className="w-5 h-5" />
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-background"></span>
                    </Button>
                    <div className="flex items-center gap-3 pl-4 border-l border-border/40">
                      <SignedIn>
                        <UserButton afterSignOutUrl="/" />
                      </SignedIn>
                    </div>
                  </div>
                </header>
                <main className="flex-1">
                  <SessionProvider>{children}</SessionProvider>
                </main>
              </SidebarInset>
            </SidebarProvider>
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}