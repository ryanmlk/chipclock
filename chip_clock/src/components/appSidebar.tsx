import { AlarmClock, Calendar, ChartAreaIcon, User, Calculator } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

// Menu items.
const items = [
  {
    title: "Dashboard",
    url: "/manage",
    icon: ChartAreaIcon,
  },
  {
    title: "Availabilities",
    url: "/manage/availability",
    icon: AlarmClock,
  },
  {
    title: "Schedule",
    url: "/manage/schedule",
    icon: Calendar,
  },
  {
    title: "Employees",
    url: "/manage/employees",
    icon: User,
  },
  {
    title: "Labour Management",
    url: "/manage/labour",
    icon: Calculator,
  },
]

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <a href={item.url}>
                      <item.icon />
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}