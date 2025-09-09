"use client";

import * as React from "react";
import {
  CalendarIcon,
  BarChart3Icon,
  ClockIcon,
  BookOpenIcon,
  LayoutDashboardIcon,
  SettingsIcon,
  BellIcon,
  MailIcon,
  UserIcon,
  PlusIcon,
} from "lucide-react";

import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

const data = {
  user: {
    name: "Admin User",
    email: "admin@modfram.com",
    avatar: "/avatars/admin.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "/admin",
      icon: LayoutDashboardIcon,
      isActive: true,
    },
    {
      title: "Insights",
      url: "/admin/insights",
      icon: BarChart3Icon,
      items: [
        {
          title: "Bookings Over Time",
          url: "/admin/insights/bookings-over-time",
        },
        {
          title: "Revenue by Session",
          url: "/admin/insights/revenue-by-session",
        },
        {
          title: "Popular Categories",
          url: "/admin/insights/popular-categories",
        },
        {
          title: "Upcoming Bookings",
          url: "/admin/insights/upcoming-bookings",
        },
        {
          title: "Client Acquisition",
          url: "/admin/insights/client-acquisition",
        },
        {
          title: "Recent Payments",
          url: "/admin/insights/recent-payments",
        },
      ],
    },
    {
      title: "Event Types",
      url: "/admin/event-types",
      icon: BookOpenIcon,
    },
    {
      title: "Bookings",
      url: "/admin/bookings",
      icon: CalendarIcon,
    },
    {
      title: "Availability",
      url: "/admin/availability",
      icon: ClockIcon,
    },
    {
      title: "Calendar",
      url: "/admin/calendar",
      icon: CalendarIcon,
    },
  ],
  navSettings: [
    {
      title: "Account",
      url: "/admin/settings/account",
      icon: UserIcon,
    },
    {
      title: "Notifications",
      url: "/admin/settings/notifications",
      icon: BellIcon,
    },
    {
      title: "Email Settings",
      url: "/admin/settings/email",
      icon: MailIcon,
    },
  ],
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <a href="/admin">
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <CalendarIcon className="size-4" />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">ModFram</span>
                  <span className="truncate text-xs">Booking Admin</span>
                </div>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent className="gap-0">
        <NavMain items={data.navMain} />
        <div className="mt-auto">
          <div className="px-3 py-2">
            <div className="text-xs font-medium text-sidebar-foreground/70 uppercase tracking-wider mb-2">
              Settings
            </div>
          </div>
          <NavMain items={data.navSettings} />
        </div>
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
