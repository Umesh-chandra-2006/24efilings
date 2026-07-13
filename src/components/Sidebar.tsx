import React from 'react';
import {
  Users, Briefcase, LogOut, Settings, BarChart3,
  LayoutDashboard, DollarSign, Clock, FileUp, ShieldCheck, ChevronLeft, Target, Bell, FileCheck, Layers, Package, PlusCircle, Tag,
  Globe, ChevronDown, ChevronUp, FileText, MessageSquare, Building
} from 'lucide-react';
import { User, Lead } from '../types';
import { cn } from '../lib/utils';
import { Button } from './ui/Button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/Avatar';

// Efiling Logo Component (SVG)
// Efiling Logo Component (Image)
const EfilingLogo = ({ className, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => (
  <img
    src="/full-logo.png"
    alt="24 Filing"
    className={cn("object-contain", className)}
    {...props}
  />
);

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
  userRole: User['role'];
  currentUser: User;
  activePage: string;
  setActivePage: (page: string) => void;
  onLogout: () => void;
  users: User[];
  leads: Lead[];
  unreadCount: number;
}

interface NavLinkItem {
  page: string;
  icon: React.ElementType;
}

const NavLink: React.FC<{
  page: string;
  icon: React.ElementType;
  active?: boolean;
  onClick: (page: string) => void;
  count?: number | null;
}> = ({ page, icon: Icon, active, onClick, count }) => {
  return (
    <button
      onClick={() => onClick(page)}
      className={cn(
        "flex items-center gap-3 px-3 py-2.5 w-full text-left transition-all duration-200 rounded-md text-sm font-medium",
        active
          ? "bg-primary text-primary-foreground shadow-sm"
          : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-primary-foreground" : "text-slate-400")} />
      <span className="flex-1 truncate">{page}</span>
      {count != null && (
        <span className={cn(
          "text-xs font-semibold rounded-full px-2 py-0.5",
          active ? "bg-primary-foreground/20 text-primary-foreground" : "bg-slate-800 text-slate-400"
        )}>
          {count}
        </span>
      )}
    </button>
  );
};

const getInitials = (name: string) => {
  const names = name.split(' ');
  if (names.length > 1) {
    return `${names[0][0]}${names[names.length - 1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

const superAdminNav: NavLinkItem[] = [
  { page: 'Dashboard', icon: LayoutDashboard },
  { page: 'Branch Management', icon: Building },
  { page: 'User Management', icon: Users },
  { page: 'All Leads', icon: Briefcase },
  { page: 'Create New Lead', icon: PlusCircle },
  { page: 'My Leads', icon: Target },
  { page: 'Lead Workflow', icon: Target },
  { page: 'Customers', icon: Users },
  { page: '24eFiling Web Dropdown', icon: Globe },
  { page: 'Offers & Coupons', icon: Tag },
  { page: 'Payments', icon: DollarSign },

  { page: 'Reports & Analytics', icon: BarChart3 },
  { page: 'Activity Feed', icon: Clock },
  { page: 'Notifications', icon: Bell },
  { page: 'System Settings', icon: Settings },
];

const adminNav: NavLinkItem[] = [
  { page: 'Dashboard', icon: LayoutDashboard },
  { page: 'User Management', icon: Users },
  { page: 'All Leads', icon: Briefcase },
  { page: 'Create New Lead', icon: PlusCircle },
  { page: 'My Leads', icon: Target },
  { page: 'Lead Workflow', icon: Target },
  { page: 'Customers', icon: Users },
  { page: '24eFiling Web Dropdown', icon: Globe },
  { page: 'Team Management', icon: ShieldCheck },
  { page: 'Document Verification', icon: FileCheck },

  { page: 'Reports', icon: BarChart3 },
  { page: 'Notifications', icon: Bell },
];

const salesExecNav: NavLinkItem[] = [
  { page: 'Dashboard', icon: LayoutDashboard },
  { page: 'All Leads', icon: Briefcase },
  { page: 'Create New Lead', icon: PlusCircle },
  { page: 'My Leads', icon: Target },
  { page: 'Lead Workflow', icon: Target },
  { page: 'Follow-ups', icon: Clock },
  { page: 'Client Documents', icon: FileUp },
  { page: 'Performance Report', icon: BarChart3 },
  { page: 'Notifications', icon: Bell },
];

const WebMenuDropdown: React.FC<{
  activePage: string;
  onClick: (page: string) => void;
}> = ({ activePage, onClick }) => {
  const [isOpen, setIsOpen] = React.useState(() => {
    return ['24efiling Web', 'Web Leads', 'Blogs', 'Testimonials', 'Services'].includes(activePage);
  });

  React.useEffect(() => {
    if (['24efiling Web', 'Web Leads', 'Blogs', 'Testimonials', 'Services'].includes(activePage)) {
      setIsOpen(true);
    }
  }, [activePage]);

  const subItems = [
    { page: '24efiling Web', label: '24efiling Web', icon: Globe },
    { page: 'Web Leads', label: 'Web Leads', icon: MessageSquare },
    { page: 'Blogs', label: 'Blogs', icon: FileText },
    { page: 'Testimonials', label: 'Testimonials', icon: MessageSquare },
    { page: 'Services', label: 'Services', icon: Layers }
  ];

  return (
    <div className="flex flex-col gap-1 w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 w-full text-left transition-all duration-200 rounded-md text-sm font-medium",
          ['24efiling Web', 'Web Leads', 'Blogs', 'Testimonials', 'Services'].includes(activePage)
            ? "text-white bg-white/10"
            : "text-slate-400 hover:text-slate-100 hover:bg-white/5"
        )}
      >
        <Globe className="h-4 w-4 text-slate-400" />
        <span className="flex-1 truncate">24eFiling Web</span>
        {isOpen ? (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {isOpen && (
        <div className="flex flex-col gap-1 pl-4 mt-1 border-l border-slate-800 ml-5 transition-all duration-150">
          {subItems.map((item) => {
            const Icon = item.icon;
            const active = activePage === item.page;
            return (
              <button
                key={item.page}
                onClick={() => onClick(item.page)}
                className={cn(
                  "flex items-center gap-2.5 px-3 py-2 w-full text-left transition-all duration-150 rounded-md text-xs font-medium",
                  active
                    ? "text-white bg-primary font-bold shadow-sm"
                    : "text-slate-400 hover:text-slate-200 hover:bg-white/5"
                )}
              >
                <Icon className={cn("h-3.5 w-3.5", active ? "text-white" : "text-slate-500")} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen, setIsSidebarOpen, userRole, currentUser, activePage, setActivePage, onLogout, users, leads, unreadCount }) => {
  let navLinks: NavLinkItem[] = [];
  switch (userRole) {
    case 'Super Admin':
      navLinks = superAdminNav;
      break;
    case 'Admin':
    case 'Branch Manager':
      navLinks = adminNav;
      break;
    case 'Sales Executive':
      navLinks = salesExecNav;
      break;
    default:
      navLinks = [];
  }

  const handleNavClick = (page: string) => {
    setActivePage(page);
    if (window.innerWidth < 768) { // md breakpoint
      setIsSidebarOpen(false);
    }
  }

  const getPageCount = (page: string): number | null => {
    if (page === 'User Management') return users.length;
    if (page === 'All Leads') return leads.length;
    if (page === 'My Leads') {
      // Count leads created by current user
      const myLeadsCount = leads.filter(l => l.created_by === currentUser?.id).length;
      return myLeadsCount > 0 ? myLeadsCount : null;
    }
    if (page === 'Notifications') return unreadCount > 0 ? unreadCount : null;
    if (page === 'Follow-ups') {
      const now = new Date();
      now.setHours(23, 59, 59, 999);

      // Filter leads relevant to the user first
      const relevantLeads = leads.filter(l => {
        if (['Super Admin', 'Admin'].includes(userRole)) return true;
        return l.assigned_to?.id === currentUser?.id || l.created_by === currentUser?.id;
      });

      let count = 0;
      relevantLeads.forEach(lead => {
        // General Follow-up
        if (lead.next_follow_up) {
           const d = new Date(lead.next_follow_up);
           // Count if due/overdue and not closed
           if (d <= now && lead.status !== 'Success' && lead.status !== 'Lost') count++;
        }
        // Tasks
        lead.tasks?.forEach(task => {
           if (!task.is_completed && task.due_date) {
              const d = new Date(task.due_date);
              if (d <= now) count++;
           }
        });
      });
      return count > 0 ? count : null;
    }
    return null;
  }

  return (
    <>
      <aside className={cn(
        "fixed inset-y-0 left-0 z-40 w-64 flex flex-col bg-slate-950 text-white transition-transform duration-300 ease-in-out border-r border-slate-800",
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      )}>
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-800 shrink-0">
          <a href="#" onClick={(e) => { e.preventDefault(); handleNavClick('Dashboard'); }} className="flex items-center gap-2 text-white px-2">
            <EfilingLogo className="h-12 w-auto" />
          </a>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="md:hidden text-slate-400 hover:text-white hover:bg-slate-800">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          <div className="space-y-1">
            {navLinks.map((link) => {
              if (link.page === '24eFiling Web Dropdown') {
                return (
                  <WebMenuDropdown
                    key="web-menu-dropdown"
                    activePage={activePage}
                    onClick={handleNavClick}
                  />
                );
              }
              return (
                <NavLink
                  key={link.page}
                  page={link.page}
                  icon={link.icon}
                  active={activePage === link.page}
                  onClick={handleNavClick}
                  count={getPageCount(link.page)}
                />
              );
            })}
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9 border border-slate-700">
              <AvatarImage src={currentUser?.avatar_url} alt={currentUser?.name} />
              <AvatarFallback className="bg-primary/20 text-primary text-xs font-bold">
                {getInitials(currentUser?.name || 'U')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 overflow-hidden">
              <p className="text-white font-medium text-sm truncate">{currentUser.name}</p>
              <p className="text-xs text-slate-500 truncate">{currentUser.role}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onLogout} title="Logout" className="text-slate-400 hover:text-white hover:bg-slate-800">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>

      </aside>
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};