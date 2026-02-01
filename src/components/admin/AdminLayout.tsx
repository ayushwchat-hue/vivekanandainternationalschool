import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  Image,
  Settings,
  Menu,
  ChevronDown,
  GraduationCap,
  LogOut,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import ChangePasswordDialog from './ChangePasswordDialog';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@/components/ui/sidebar';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { useIsMobile } from '@/hooks/use-mobile';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const mainNavItems = [
  { title: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
  { title: 'Inquiries', icon: FileText, href: '/admin/inquiries' },
];

const contentNavItems = [
  { title: 'Site Content', icon: Settings, href: '/admin/content' },
  { title: 'Gallery', icon: Image, href: '/admin/gallery' },
];

const MobileSidebar = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const location = useLocation();
  const [contentOpen, setContentOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0">
        <SheetHeader className="h-16 flex flex-row items-center px-4 border-b border-border">
          <Link to="/admin" className="flex items-center gap-3" onClick={onClose}>
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
              <GraduationCap className="w-5 h-5 text-primary-foreground" />
            </div>
            <div className="overflow-hidden">
              <SheetTitle className="font-display font-bold text-foreground truncate text-left">
                HRMS Portal
              </SheetTitle>
              <p className="text-xs text-muted-foreground">Admin</p>
            </div>
          </Link>
        </SheetHeader>

        <div className="flex flex-col h-[calc(100%-4rem)] py-4">
          <div className="flex-1 overflow-y-auto px-3">
            <div className="space-y-1 mb-4">
              <p className="text-xs font-medium text-muted-foreground px-3 py-2">Main</p>
              {mainNavItems.map((item) => (
                <Link
                  key={item.title}
                  to={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.title}</span>
                </Link>
              ))}
            </div>

            <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
              <CollapsibleTrigger className="w-full">
                <div className="flex items-center justify-between px-3 py-2 text-xs font-medium text-muted-foreground cursor-pointer hover:text-foreground">
                  Content Management
                  <ChevronDown className={cn("w-4 h-4 transition-transform", contentOpen && "rotate-180")} />
                </div>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="space-y-1">
                  {contentNavItems.map((item) => (
                    <Link
                      key={item.title}
                      to={item.href}
                      onClick={onClose}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                        isActive(item.href)
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>

          <div className="mt-auto px-3 pt-4 border-t border-border">
            <Link
              to="/"
              onClick={onClose}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <GraduationCap className="w-5 h-5" />
              <span>Back to Website</span>
            </Link>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

const AdminSidebar = () => {
  const location = useLocation();
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';
  const [contentOpen, setContentOpen] = useState(true);

  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border hidden md:flex">
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border">
        <Link to="/admin" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-sidebar-primary flex items-center justify-center flex-shrink-0">
            <GraduationCap className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          {!isCollapsed && (
            <div className="overflow-hidden">
              <h1 className="font-display font-bold text-sidebar-foreground truncate">
                HRMS Portal
              </h1>
              <p className="text-xs text-sidebar-foreground/60">Admin</p>
            </div>
          )}
        </Link>
      </div>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainNavItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive(item.href)}
                    tooltip={item.title}
                  >
                    <Link to={item.href}>
                      <item.icon className="w-5 h-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <Collapsible open={contentOpen} onOpenChange={setContentOpen}>
            <CollapsibleTrigger className="w-full">
              <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent rounded px-2 py-1">
                Content Management
                <ChevronDown className={cn("w-4 h-4 transition-transform", contentOpen && "rotate-180")} />
              </SidebarGroupLabel>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <SidebarGroupContent>
                <SidebarMenu>
                  {contentNavItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive(item.href)}
                        tooltip={item.title}
                      >
                        <Link to={item.href}>
                          <item.icon className="w-5 h-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </CollapsibleContent>
          </Collapsible>
        </SidebarGroup>

        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Back to Website">
                  <Link to="/">
                    <GraduationCap className="w-5 h-5" />
                    <span>Back to Website</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};

const AdminLayout = ({ children }: AdminLayoutProps) => {
  const { logout } = useAdminAuth();
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-muted/30">
        <AdminSidebar />
        <MobileSidebar open={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
        
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 md:h-16 border-b border-border bg-background flex items-center justify-between px-3 md:px-4 sticky top-0 z-40">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden shrink-0"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              
              {/* Desktop sidebar trigger */}
              <SidebarTrigger className="hidden md:flex">
                <Menu className="w-5 h-5" />
              </SidebarTrigger>
              
              <h2 className="font-display font-semibold text-foreground text-sm md:text-base truncate">
                VIS - HRMS
              </h2>
            </div>
            <div className="flex items-center gap-1.5 md:gap-2 shrink-0">
              <ChangePasswordDialog />
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleLogout}
                className="h-8 md:h-9 px-2 md:px-3"
              >
                <LogOut className="w-4 h-4 md:mr-2" />
                <span className="hidden md:inline">Logout</span>
              </Button>
            </div>
          </header>
          <main className="flex-1 p-3 md:p-6 overflow-auto">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminLayout;