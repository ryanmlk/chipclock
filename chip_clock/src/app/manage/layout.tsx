import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/appSidebar"

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <main className="px-4 max-h-80vh w-full overflow-y-hidden">
        {children}
      </main>
    </SidebarProvider>
  )
}