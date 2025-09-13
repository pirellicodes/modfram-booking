"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function AdminPagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-background">
      <SidebarProvider className="h-full w-full">
        <AppSidebar />
        <SidebarInset className="flex flex-col h-full min-w-0 flex-1">
          <SiteHeader />
          <div className="flex-1 overflow-y-auto">
            <main className="flex flex-1 flex-col gap-4 p-2 pt-4 sm:p-4 sm:pt-6 lg:p-6 lg:pt-8">
              {children}
            </main>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
