import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Baby,
  Eye,
  EyeOff,
  Lock,
  User,
  Shield,
  Building2,
  MapPin,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/auth';
import { cn } from '@/lib/utils';
import { mockUsers } from '@/mock/data';
import { getRoleText } from '@/utils/format';

export default function Login() {
  const [username, setUsername] = useState('admin_national');
  const [password, setPassword] = useState('123456');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedRole, setSelectedRole] = useState('national');

  const { login } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: string })?.from || '/dashboard';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await login(username, password);
      if (result.success) {
        navigate(from, { replace: true });
      } else {
        setError(result.message || '登录失败');
      }
    } catch (err) {
      setError('登录时发生错误');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (role: string) => {
    setSelectedRole(role);
    const user = mockUsers.find((u) => u.role === role);
    if (user) {
      setUsername(user.username);
      setPassword('123456');
      
      setLoading(true);
      const result = await login(user.username, '123456');
      if (result.success) {
        navigate(from, { replace: true });
      }
      setLoading(false);
    }
  };

  const roleCards = [
    {
      role: 'national',
      label: '国家级管理员',
      icon: Shield,
      description: '查看全国数据',
      color: 'from-primary-500 to-primary-600',
      username: 'admin_national',
    },
    {
      role: 'provincial',
      label: '省级管理员',
      icon: Building2,
      description: '查看本省数据',
      color: 'from-health-500 to-health-600',
      username: 'admin_province',
    },
    {
      role: 'municipal',
      label: '市级管理员',
      icon: MapPin,
      description: '查看本市数据',
      color: 'from-warning-500 to-warning-600',
      username: 'admin_city',
    },
    {
      role: 'principal',
      label: '机构园长',
      icon: Baby,
      description: '查看本机构数据',
      color: 'from-purple-500 to-purple-600',
      username: 'principal01',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-health-50 flex items-center justify-center p-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-96 h-96 bg-primary-200/30 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-health-200/30 rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-warning-200/20 rounded-full blur-3xl" />

      <div className="relative z-10 w-full max-w-5xl">
        <div className="grid grid-cols-2 gap-8 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-health-500 flex items-center justify-center shadow-lg shadow-primary-200">
                <Baby className="w-9 h-9 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-neutral-800">托育监测平台</h1>
                <p className="text-neutral-500 mt-1">Childcare Health Monitoring</p>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-2xl font-bold text-neutral-800">
                全国托育服务
                <br />
                运营与健康监测分析
              </h2>
              <p className="text-neutral-500 leading-relaxed">
                实时接入各托育机构的儿童出勤、晨检体温、饮食摄入、睡眠时长及活动量等多源数据流，
                实现智能预警、科学决策、精细化管理。
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white">
                <p className="text-3xl font-bold text-primary-600">100+</p>
                <p className="text-sm text-neutral-500 mt-1">托育机构</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white">
                <p className="text-3xl font-bold text-health-600">95%</p>
                <p className="text-sm text-neutral-500 mt-1">健康合格率</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white">
                <p className="text-3xl font-bold text-warning-600">24h</p>
                <p className="text-sm text-neutral-500 mt-1">实时监控</p>
              </div>
              <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white">
                <p className="text-3xl font-bold text-danger-600">5分钟</p>
                <p className="text-sm text-neutral-500 mt-1">预警响应</p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-card-lg border border-white p-8"
          >
            <div className="text-center mb-6">
              <h3 className="text-xl font-bold text-neutral-800">欢迎登录</h3>
              <p className="text-sm text-neutral-500 mt-1">请选择角色快速登录</p>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {roleCards.map((role) => {
                const Icon = role.icon;
                return (
                  <button
                    key={role.role}
                    onClick={() => quickLogin(role.role)}
                    disabled={loading}
                    className={cn(
                      'p-4 rounded-xl border-2 transition-all duration-200 text-left group',
                      selectedRole === role.role
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-neutral-100 hover:border-primary-200 hover:bg-neutral-50'
                    )}
                  >
                    <div
                      className={cn(
                        'w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center mb-2 transition-transform group-hover:scale-110',
                        role.color
                      )}
                    >
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <p className="font-medium text-neutral-800 text-sm">{role.label}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{role.description}</p>
                  </button>
                );
              })}
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-neutral-200" />
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-white/80 text-sm text-neutral-400">或使用账号密码登录</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  用户名
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full pl-10 pr-4 py-3 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1.5">
                  密码
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="请输入密码"
                    className="w-full pl-10 pr-12 py-3 border border-neutral-200 rounded-xl bg-neutral-50 focus:bg-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="px-4 py-2 bg-danger-50 border border-danger-100 rounded-xl text-sm text-danger-600">
                  {error}
                </div>
              )}

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 text-primary-500 rounded border-neutral-300 focus:ring-primary-500"
                  />
                  <span className="text-sm text-neutral-600">记住密码</span>
                </label>
                <button type="button" className="text-sm text-primary-600 hover:text-primary-700">
                  忘记密码?
                </button>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white font-medium rounded-xl hover:from-primary-600 hover:to-primary-700 focus:ring-4 focus:ring-primary-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg shadow-primary-200/50"
              >
                {loading ? '登录中...' : '登 录'}
              </button>
            </form>

            <p className="text-center text-xs text-neutral-400 mt-6">
              默认密码: 123456 | 点击上方角色卡片可快速登录
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
