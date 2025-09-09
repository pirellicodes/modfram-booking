"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { EmailSettings } from "@/components/EmailSettings";

export default function EmailSettingsPage() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          <div className="min-h-screen flex flex-col">
            <div className="py-6">
              <EmailSettings />
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
