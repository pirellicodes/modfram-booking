"use client";

import { PlusIcon, SearchIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";

export function SiteHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname === "/admin") return "Dashboard";
    if (pathname.startsWith("/admin/insights")) {
      if (pathname.includes("bookings-over-time")) return "Bookings Over Time";
      if (pathname.includes("revenue-by-session")) return "Revenue by Session";
      if (pathname.includes("popular-categories")) return "Popular Categories";
      if (pathname.includes("upcoming-bookings")) return "Upcoming Bookings";
      if (pathname.includes("client-acquisition")) return "Client Acquisition";
      if (pathname.includes("recent-payments")) return "Recent Payments";
      return "Insights";
    }
    if (pathname.startsWith("/admin/event-types")) return "Event Types";
    if (pathname.startsWith("/admin/bookings")) return "Bookings";
    if (pathname.startsWith("/admin/availability")) return "Availability";
    if (pathname.startsWith("/admin/calendar")) return "Calendar";
    if (pathname.startsWith("/admin/settings/email")) return "Email Settings";
    if (pathname.startsWith("/admin/settings")) return "Settings";
    return "Dashboard";
  };
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-16 flex h-16 shrink-0 items-center gap-2 border-b bg-background transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 data-[orientation=vertical]:h-4"
        />

        {/* Page Title - Dynamic based on current route */}
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-foreground">
            {getPageTitle()}
          </h1>
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Search Bar */}
        <div className="relative hidden md:flex items-center">
          <SearchIcon className="absolute left-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search events, bookings..."
            className="w-64 pl-9 pr-4 h-9 bg-background border-input"
          />
        </div>

        {/* Create Event Button */}
        <Button size="sm" className="gap-2">
          <PlusIcon className="h-4 w-4" />
          <span className="hidden sm:inline">Create Event</span>
        </Button>

        {/* Mobile Search Button */}
        <Button variant="ghost" size="sm" className="md:hidden">
          <SearchIcon className="h-4 w-4" />
          <span className="sr-only">Search</span>
        </Button>
      </div>
    </header>
  );
}
