"use client";

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
import {
  LayoutDashboard,
  BarChart3,
  Calendar,
  CalendarDays,
  Clock,
  Camera,
} from "lucide-react";
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
      title: "General",
      items: [
        {
          title: "Dashboard",
          url: "/admin",
          icon: LayoutDashboard,
        },
        {
          title: "Insights",
          url: "/admin/insights",
          icon: BarChart3,
        },
        {
          title: "Event Types",
          url: "/admin/event-types",
          icon: Camera,
        },
        {
          title: "Bookings",
          url: "/admin/bookings",
          icon: CalendarDays,
        },
        {
          title: "Availability",
          url: "/admin/availability",
          icon: Clock,
        },
        {
          title: "Calendar",
          url: "/admin/calendar",
          icon: Calendar,
        },
      ],
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
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
