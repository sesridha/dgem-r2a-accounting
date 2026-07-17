import { Outlet } from "react-router-dom";
import SidebarNav from "./Sidebar";
import { SidebarProvider } from "../ui/sidebar";

/**
 * Main Layout Component
 * Wraps all pages with sidebar and top navigation
 */
export default function MainLayout() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar Navigation */}
      <SidebarProvider>
        <SidebarNav />
        {/* Main Content Area */}
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Page Content */}
          <main className="flex-1 overflow-auto">
            <div className="h-full">
              <Outlet />
            </div>
          </main>
        </div>
      </SidebarProvider>
    </div>
  );
}
