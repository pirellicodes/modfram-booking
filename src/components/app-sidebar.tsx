"use client";

import {
  BarChart3,
  Calendar,
  CalendarDays,
  Camera,
  Clock,
  LayoutDashboard,
  Settings,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";

import { NavGroup } from "./nav-group";
import { NavUser } from "./nav-user";
import { TeamSwitcher } from "./team-switcher";
import { type SidebarData } from "./types";

const sidebarData: SidebarData = {
  user: {
    name: "Admin User",
    email: "admin@modfram.com",
    avatar: "/avatars/admin.jpg",
  },
  teams: [
    {
      name: "Modfram",
      logo: Camera,
      plan: "Photography Booking",
    },
  ],
  navGroups: [
    {
      title: "Overview",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "Analytics",
          url: "/admin/analytics",
          icon: BarChart3,
        },
      ],
    },
    {
      title: "Bookings",
      items: [
        {
          title: "Bookings",
          url: "/admin/bookings",
          icon: CalendarDays,
        },
        {
          title: "Calendar",
          url: "/admin/calendar",
          icon: Calendar,
        },
        {
          title: "Availability",
          url: "/admin/availability",
          icon: Clock,
        },
      ],
    },
    {
      title: "Management",
      items: [
        {
          title: "Session Types",
          url: "/admin/event-types",
          icon: Camera,
        },
      ],
    },
    {
      title: "Settings",
      items: [
        {
          title: "Integrations",
          url: "/admin/settings/integrations",
          icon: Settings,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="floating" {...props}>
      <SidebarHeader>
        <TeamSwitcher teams={sidebarData.teams} />
      </SidebarHeader>
      <SidebarContent>
        {sidebarData.navGroups.map((props) => (
          <NavGroup key={props.title} {...props} />
        ))}
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={sidebarData.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
