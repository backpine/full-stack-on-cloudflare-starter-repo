import { AppSidebar } from "@/components/common/app-sidebar";
import { SiteHeader } from "@/components/common/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Outlet, createFileRoute } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/app/_authed")({
  component: RouteComponent,
});
function RouteComponent() {
  return (
    <div className="h-screen overflow-hidden flex">
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar variant="inset" />
        <SidebarInset className="flex flex-col w-full">
          <SiteHeader />
          <div className="flex-1 overflow-auto @container/main">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <Outlet />
              <Toaster />
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  );
}
 // this is the layout for authenticated app routes with sidebar and header