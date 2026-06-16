import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Search,
  RefreshCw,
  User,
  LogOut,
  ChevronDown,
  Shield,
} from 'lucide-react';
import { useAuthStore } from '@/store/auth';
import { useAlertsStore } from '@/store/alerts';
import { formatDateTime, getRoleText } from '@/utils/format';

export default function Header() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const { user, logout } = useAuthStore();
  const { alerts } = useAlertsStore();
  const navigate = useNavigate();

  const pendingAlerts = alerts.filter((a) => a.status === 'pending' || a.status === 'escalated');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-neutral-200 sticky top-0 z-30">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="搜索机构、预警..."
              className="w-72 pl-10 pr-4 py-2 bg-neutral-100 border-0 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300 transition-all"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.location.reload()}
            className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-primary-600 transition-colors"
            title="刷新数据"
          >
            <RefreshCw className="w-5 h-5" />
          </button>

          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg text-neutral-500 hover:bg-neutral-100 hover:text-primary-600 transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              {pendingAlerts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-danger-500 text-white text-xs rounded-full flex items-center justify-center animate-pulse-soft">
                  {pendingAlerts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-card-lg border border-neutral-100 overflow-hidden animate-slide-down">
                <div className="px-4 py-3 border-b border-neutral-100 bg-neutral-50">
                  <h3 className="font-semibold text-neutral-800">预警通知</h3>
                </div>
                <div className="max-h-80 overflow-y-auto">
                  {pendingAlerts.length === 0 ? (
                    <div className="p-6 text-center text-neutral-400">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">暂无待处理预警</p>
                    </div>
                  ) : (
                    pendingAlerts.slice(0, 5).map((alert) => (
                      <div
                        key={alert.id}
                        className="px-4 py-3 border-b border-neutral-50 hover:bg-neutral-50 cursor-pointer transition-colors"
                        onClick={() => {
                          navigate(`/alerts/${alert.id}`);
                          setShowNotifications(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-2 h-2 mt-2 rounded-full bg-danger-500 animate-pulse-soft" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-neutral-800 truncate">
                              {alert.institutionName}
                            </p>
                            <p className="text-xs text-neutral-500 mt-0.5">{alert.description}</p>
                            <p className="text-xs text-neutral-400 mt-1">
                              {formatDateTime(alert.triggeredAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                <div className="px-4 py-2 border-t border-neutral-100 bg-neutral-50">
                  <button
                    onClick={() => {
                      navigate('/alerts');
                      setShowNotifications(false);
                    }}
                    className="w-full text-sm text-primary-600 hover:text-primary-700 font-medium"
                  >
                    查看全部预警
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="h-8 w-px bg-neutral-200 mx-2" />

          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 pl-2 pr-3 py-1.5 rounded-lg hover:bg-neutral-100 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-medium">
                {user?.name?.charAt(0)}
              </div>
              <div className="text-left">
                <p className="text-sm font-medium text-neutral-800">{user?.name}</p>
                <p className="text-xs text-neutral-500">{getRoleText(user?.role || '')}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-neutral-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-card-lg border border-neutral-100 overflow-hidden animate-slide-down">
                <div className="px-4 py-3 bg-gradient-to-r from-primary-50 to-health-50 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-lg font-bold">
                      {user?.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-neutral-800">{user?.name}</p>
                      <p className="text-sm text-neutral-500">{user?.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-primary-600">
                    <Shield className="w-3 h-3" />
                    <span>{getRoleText(user?.role || '')}</span>
                  </div>
                </div>

                <div className="py-2">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors">
                    <User className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-700">个人信息</span>
                  </button>
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-neutral-50 transition-colors">
                    <Shield className="w-4 h-4 text-neutral-400" />
                    <span className="text-sm text-neutral-700">权限设置</span>
                  </button>
                </div>

                <div className="border-t border-neutral-100 py-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-danger-50 transition-colors group"
                  >
                    <LogOut className="w-4 h-4 text-neutral-400 group-hover:text-danger-500" />
                    <span className="text-sm text-neutral-700 group-hover:text-danger-600">
                      退出登录
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
