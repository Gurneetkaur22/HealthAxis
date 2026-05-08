import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  Users,
  Stethoscope,
  Clock,
  FileText,
  LogOut,
  Activity,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserRole } from '@/contexts/AuthContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard, roles: ['doctor', 'patient', 'admin', 'receptionist'] },
  { label: 'Appointments', href: '/appointments', icon: Calendar, roles: ['doctor', 'patient', 'admin', 'receptionist'] },
  { label: 'Patients', href: '/patients', icon: Users, roles: ['doctor', 'admin', 'receptionist'] },
  { label: 'Doctors', href: '/doctors', icon: Stethoscope, roles: ['patient', 'admin', 'receptionist'] },
  { label: 'My Schedule', href: '/schedule', icon: Clock, roles: ['doctor'] },
  { label: 'Schedules', href: '/schedule', icon: Clock, roles: ['admin'] },
  { label: 'Book Appointment', href: '/book', icon: FileText, roles: ['patient', 'receptionist'] },
];

export default function AppSidebar() {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside
      className={cn(
        'gradient-sidebar flex flex-col h-screen sticky top-0 transition-all duration-300 border-r border-sidebar-border',
        collapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-sidebar-border">
        <img src="/favicon.png" alt="HealthAxis" className="w-9 h-9 rounded-lg flex-shrink-0" />
        {!collapsed && (
          <span className="font-heading text-lg font-bold text-sidebar-foreground tracking-tight">
            HealthAxis
          </span>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredNav.map(item => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.label + item.href}
              to={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                active
                  ? 'bg-sidebar-accent text-sidebar-primary'
                  : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/50'
              )}
            >
              <item.icon className={cn('w-5 h-5 flex-shrink-0', active && 'text-sidebar-primary')} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center flex-shrink-0">
            <span className="text-xs font-bold text-primary-foreground">
              {user.fullName ? user.fullName.split(' ').map(n => n[0]).join('') : '?'}
            </span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">{user.fullName}</p>
              <p className="text-[11px] text-sidebar-foreground/50 capitalize">{user.role}</p>
            </div>
          )}
        </div>
        <button
          onClick={signOut}
          className="flex items-center gap-3 px-3 py-2 mt-1 rounded-lg text-sm text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent/50 transition-colors w-full"
        >
          <LogOut className="w-4 h-4" />
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(prev => !prev)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border flex items-center justify-center shadow-sm hover:bg-muted transition-colors"
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}
