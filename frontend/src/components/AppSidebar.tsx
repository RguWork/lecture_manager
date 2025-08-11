import { NavLink, useLocation } from "react-router-dom";
import { Calendar, Home, Upload, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
const navigationItems = [{
  title: "Dashboard",
  url: "/",
  icon: Home
}, {
  title: "Weekly Schedule",
  url: "/schedule",
  icon: Calendar
}, {
  title: "Import Timetable",
  url: "/import",
  icon: Upload
}];
export function AppSidebar() {
  const {
    state,
    toggleSidebar
  } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;
  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavClass = ({
    isActive
  }: {
    isActive: boolean;
  }) => isActive ? "bg-primary text-primary-foreground font-medium" : "hover:bg-muted/50 text-muted-foreground hover:text-foreground";
  return <Sidebar className={isCollapsed ? "w-14" : "w-64"} collapsible="icon">
      <SidebarContent className="bg-card border-r border-border">
        <div className="p-4 border-b border-border">
          {isCollapsed ? <div className="flex justify-center">
              <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <PanelLeftOpen className="h-4 w-4" />
              </Button>
            </div> : <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-primary">
                LectureManager
              </h2>
              <Button variant="ghost" size="sm" onClick={toggleSidebar} className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground">
                <PanelLeftClose className="h-4 w-4" />
              </Button>
            </div>}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel className="text-muted-foreground">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(item => <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={({
                  isActive
                }) => getNavClass({
                  isActive
                })}>
                      <item.icon className="mr-3 h-6 w-6" />
                      {!isCollapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <div className="mt-auto p-4 border-t border-border">
          <SidebarMenuButton className="w-full text-danger hover:bg-danger/10">
            <LogOut className="mr-3 h-6 w-6" />
            {!isCollapsed && <span>Logout</span>}
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>;
}