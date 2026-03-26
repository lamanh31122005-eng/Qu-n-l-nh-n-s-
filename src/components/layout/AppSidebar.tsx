import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types/hrm';
import { ROLE_LABELS } from '@/types/hrm';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard, Users, Building2, Clock, CalendarPlus, DollarSign,
  BarChart3, Receipt, FileText, UserPlus, LogOut, ChevronLeft, ChevronRight,
  ClipboardList, CalendarOff
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

interface NavItem {
  label: string;
  icon: React.ElementType;
  path: string;
  roles: UserRole[];
}

const navItems: NavItem[] = [
  { label: 'Dashboard', icon: LayoutDashboard, path: '/dashboard', roles: ['ADMIN', 'HR', 'MANAGER_TECH', 'FINANCE', 'EMPLOYEE'] },
  { label: 'Nhân viên', icon: Users, path: '/employees', roles: ['ADMIN', 'HR', 'MANAGER_TECH', 'FINANCE'] },
  { label: 'Phòng ban', icon: Building2, path: '/departments', roles: ['ADMIN', 'HR'] },
  { label: 'Tuyển dụng', icon: UserPlus, path: '/recruitment', roles: ['ADMIN', 'HR'] },
  { label: 'Hợp đồng', icon: FileText, path: '/contracts', roles: ['ADMIN', 'HR'] },
  { label: 'Chấm công', icon: Clock, path: '/attendance', roles: ['ADMIN', 'HR', 'MANAGER_TECH', 'EMPLOYEE'] },
  { label: 'Nghỉ phép', icon: CalendarOff, path: '/leaves', roles: ['ADMIN', 'HR', 'MANAGER_TECH', 'EMPLOYEE'] },
  { label: 'Làm thêm giờ', icon: CalendarPlus, path: '/overtime', roles: ['ADMIN', 'HR', 'MANAGER_TECH', 'FINANCE', 'EMPLOYEE'] },
  { label: 'Bảng lương', icon: DollarSign, path: '/payroll', roles: ['ADMIN', 'FINANCE', 'EMPLOYEE'] },
  { label: 'KPI', icon: BarChart3, path: '/kpi', roles: ['ADMIN', 'HR', 'MANAGER_TECH', 'EMPLOYEE'] },
  { label: 'Tài chính', icon: Receipt, path: '/finance', roles: ['ADMIN', 'FINANCE'] },
  { label: 'Báo cáo', icon: ClipboardList, path: '/reports', roles: ['ADMIN', 'HR', 'FINANCE'] },
];

const AppSidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  if (!user) return null;

  const filteredNav = navItems.filter(item => item.roles.includes(user.role));

  return (
    <aside className={cn(
      "sidebar-gradient flex flex-col h-screen transition-all duration-300 sticky top-0",
      collapsed ? "w-[72px]" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-sidebar-border">
        <div className="w-9 h-9 rounded-lg bg-sidebar-primary flex items-center justify-center text-sidebar-primary-foreground font-bold text-sm shrink-0">
          HR
        </div>
        {!collapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sidebar-primary-foreground font-bold text-sm truncate">HRM System</h1>
            <p className="text-sidebar-foreground/60 text-xs truncate">{ROLE_LABELS[user.role]}</p>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3 overflow-y-auto">
        {filteredNav.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-all duration-200",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground border-r-2 border-sidebar-primary"
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon size={18} className="shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-3">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/20 flex items-center justify-center text-sidebar-primary text-xs font-semibold">
              {user.fullName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-medium text-sidebar-accent-foreground truncate">{user.fullName}</p>
              <p className="text-[10px] text-sidebar-foreground/50 truncate">{user.email}</p>
            </div>
          </div>
        )}
        <div className="flex gap-1">
          <button
            onClick={logout}
            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md text-xs text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <LogOut size={14} />
            {!collapsed && 'Đăng xuất'}
          </button>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default AppSidebar;
