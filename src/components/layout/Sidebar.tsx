import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  FileCheck,
  GraduationCap,
  FileBarChart,
  Settings,
  ChevronLeft,
  ChevronRight,
  Baby,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';

const menuItems = [
  { path: '/dashboard', label: '全国总览', icon: LayoutDashboard },
  { path: '/alerts', label: '预警中心', icon: AlertTriangle, badge: true },
  { path: '/approvals', label: '审批中心', icon: FileCheck },
  { path: '/enrollment', label: '招生管理', icon: GraduationCap },
  { path: '/reports', label: '报告中心', icon: FileBarChart },
  { path: '/settings', label: '系统设置', icon: Settings },
];

export default function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuthStore();
  const navigate = useNavigate();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-full bg-gradient-to-b from-primary-600 to-primary-800 text-white transition-all duration-300 z-40 flex flex-col',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex items-center h-16 px-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur flex items-center justify-center">
            <Baby className="w-6 h-6 text-health-300" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-lg font-bold">托育监测平台</h1>
              <p className="text-xs text-white/60">Childcare Monitor</p>
            </div>
          )}
        </div>
      </div>

      <nav className="flex-1 py-4 px-2 overflow-y-auto scrollbar-thin">
        <ul className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <li key={item.path}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group',
                      isActive
                        ? 'bg-white/15 text-white shadow-lg'
                        : 'text-white/70 hover:bg-white/10 hover:text-white'
                    )
                  }
                >
                  <Icon className="w-5 h-5 flex-shrink-0" />
                  {!collapsed && (
                    <span className="text-sm font-medium animate-fade-in">{item.label}</span>
                  )}
                  {!collapsed && item.badge && (
                    <span className="ml-auto w-2 h-2 bg-danger-400 rounded-full animate-pulse-soft" />
                  )}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-white/10 p-3">
        {!collapsed && user && (
          <div className="flex items-center gap-3 px-2 py-2 mb-2">
            <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
              <span className="text-sm font-medium">{user.name.charAt(0)}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user.name}</p>
              <p className="text-xs text-white/50 truncate">
                {user.role === 'national' && '国家级管理员'}
                {user.role === 'provincial' && '省级管理员'}
                {user.role === 'municipal' && '市级管理员'}
                {user.role === 'principal' && '机构园长'}
              </p>
            </div>
          </div>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-white/50 hover:bg-white/10 hover:text-white transition-colors"
        >
          {collapsed ? (
            <ChevronRight className="w-5 h-5" />
          ) : (
            <ChevronLeft className="w-5 h-5" />
          )}
        </button>
      </div>
    </aside>
  );
}
