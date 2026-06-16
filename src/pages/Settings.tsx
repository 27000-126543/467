import { useState } from 'react';
import {
  Settings as SettingsIcon,
  AlertTriangle,
  Users,
  Shield,
  Info,
  Save,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  Edit,
  Trash2,
  Search,
  UserPlus,
  Database,
  Server,
  Calendar,
  CheckCircle,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { mockAlertConfig, mockUsers } from '@/mock/data';
import { getRoleText } from '@/utils/format';
import type { AlertConfig, UserRole } from '@/types';

type TabKey = 'alert' | 'permission' | 'system';

const tabs: { key: TabKey; label: string; icon: typeof AlertTriangle }[] = [
  { key: 'alert', label: '预警参数配置', icon: AlertTriangle },
  { key: 'permission', label: '权限管理', icon: Shield },
  { key: 'system', label: '系统信息', icon: Info },
];

const roleDescriptions = [
  {
    role: 'national' as UserRole,
    title: '国家级管理员',
    color: 'primary',
    description: '负责全国托育机构运营数据的总览与管理，拥有最高权限',
    permissions: [
      '查看全国所有省份、城市、机构的数据',
      '配置系统预警参数与规则',
      '管理各级管理员账号与权限',
      '审批重大调整事项',
      '生成与导出全国性报告',
    ],
  },
  {
    role: 'provincial' as UserRole,
    title: '省级管理员',
    color: 'warning',
    description: '负责本省范围内托育机构的监督与管理工作',
    permissions: [
      '查看本省所有城市、机构的数据',
      '处理本省范围内的预警事项',
      '管理本省市级管理员账号',
      '审批本省班额调整等事项',
      '生成本省运营报告',
    ],
  },
  {
    role: 'municipal' as UserRole,
    title: '市级管理员',
    color: 'health',
    description: '负责本市范围内托育机构的日常监管工作',
    permissions: [
      '查看本市所有机构的实时数据',
      '处理本市范围内的预警事项',
      '审批机构招生计划调整',
      '监督机构整改落实情况',
      '生成本市运营分析报告',
    ],
  },
  {
    role: 'principal' as UserRole,
    title: '机构园长',
    color: 'neutral',
    description: '负责本机构的日常运营管理与数据上报',
    permissions: [
      '查看本机构的各项运营数据',
      '处理本机构的预警提醒',
      '上报招生计划与调整申请',
      '管理本机构教师与班级信息',
      '查看本机构运营报告',
    ],
  },
];

const tableUsers = [
  ...mockUsers,
  {
    id: 'u005',
    username: 'admin_jiangsu',
    name: '江苏省卫健管理员',
    role: 'provincial' as UserRole,
    region: { province: '江苏省' },
    permissions: ['dashboard:view', 'alerts:view', 'approvals:view', 'reports:view'],
  },
  {
    id: 'u006',
    username: 'admin_zhejiang',
    name: '浙江省卫健管理员',
    role: 'provincial' as UserRole,
    region: { province: '浙江省' },
    permissions: ['dashboard:view', 'alerts:view', 'approvals:view', 'reports:view'],
  },
  {
    id: 'u007',
    username: 'admin_guangzhou',
    name: '广州市卫健管理员',
    role: 'municipal' as UserRole,
    region: { province: '广东省', city: '广州市' },
    permissions: ['dashboard:view', 'alerts:view', 'alerts:process', 'approvals:view', 'approvals:approve', 'reports:view'],
  },
  {
    id: 'u008',
    username: 'principal02',
    name: '星星幼儿园李园长',
    role: 'principal' as UserRole,
    region: { province: '广东省', city: '广州市', institutionId: 'inst002' },
    permissions: ['dashboard:view', 'alerts:view', 'alerts:process', 'approvals:view', 'reports:view', 'enrollment:manage'],
  },
  {
    id: 'u009',
    username: 'principal03',
    name: '智慧树幼儿园王园长',
    role: 'principal' as UserRole,
    region: { province: '江苏省', city: '南京市', institutionId: 'inst003' },
    permissions: ['dashboard:view', 'alerts:view', 'alerts:process', 'approvals:view', 'reports:view', 'enrollment:manage'],
  },
  {
    id: 'u010',
    username: 'admin_nanjing',
    name: '南京市卫健管理员',
    role: 'municipal' as UserRole,
    region: { province: '江苏省', city: '南京市' },
    permissions: ['dashboard:view', 'alerts:view', 'alerts:process', 'approvals:view', 'approvals:approve', 'reports:view'],
  },
];

const userStatuses: Record<string, 'active' | 'disabled'> = {
  u001: 'active',
  u002: 'active',
  u003: 'active',
  u004: 'active',
  u005: 'active',
  u006: 'active',
  u007: 'active',
  u008: 'active',
  u009: 'disabled',
  u010: 'active',
};

export default function Settings() {
  const [activeTab, setActiveTab] = useState<TabKey>('alert');

  const [alertConfig, setAlertConfig] = useState<AlertConfig>(mockAlertConfig);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');

  const [showAddModal, setShowAddModal] = useState(false);

  const handleAlertConfigChange = (key: keyof AlertConfig, value: number) => {
    setAlertConfig((prev) => ({ ...prev, [key]: value }));
    setSaveSuccess(false);
  };

  const handleSaveAlertConfig = async () => {
    setSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
  };

  const handleResetAlertConfig = () => {
    setAlertConfig(mockAlertConfig);
    setSaveSuccess(false);
  };

  const filteredUsers = tableUsers.filter((user) => {
    const matchKeyword =
      user.name.includes(searchKeyword) ||
      user.username.includes(searchKeyword);
    const matchRole = roleFilter === 'all' || user.role === roleFilter;
    return matchKeyword && matchRole;
  });

  const getRoleBadgeStyle = (role: string) => {
    const map: Record<string, string> = {
      national: 'bg-primary-50 text-primary-600 border-primary-200',
      provincial: 'bg-warning-50 text-warning-600 border-warning-200',
      municipal: 'bg-health-50 text-health-600 border-health-200',
      principal: 'bg-neutral-100 text-neutral-600 border-neutral-200',
    };
    return map[role] || 'bg-neutral-100 text-neutral-600';
  };

  const getStatusBadgeStyle = (status: string) => {
    return status === 'active'
      ? 'bg-health-50 text-health-600 border-health-200'
      : 'bg-neutral-100 text-neutral-400 border-neutral-200';
  };

  const getRegionText = (user: typeof tableUsers[0]) => {
    const parts: string[] = [];
    if (user.region.province) parts.push(user.region.province);
    if (user.region.city) parts.push(user.region.city);
    return parts.length > 0 ? parts.join(' / ') : '全国';
  };

  const systemInfo = {
    version: 'v2.1.0',
    buildTime: '2024-06-15 10:30:00',
    lastUpdate: '2024-06-15 08:00:00',
    dataSyncStatus: 'success' as 'success' | 'syncing' | 'error',
    lastSyncTime: '2024-06-16 09:15:30',
    totalInstitutions: 12580,
    totalUsers: 35680,
    serverStatus: 'normal' as 'normal' | 'warning' | 'error',
    databaseStatus: 'normal' as 'normal' | 'warning' | 'error',
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary-800 flex items-center gap-2">
            <SettingsIcon className="w-7 h-7 text-primary-600" />
            系统设置
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            配置系统参数、管理用户权限、查看系统信息
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <div className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
          <div className="border-b border-neutral-100 px-6">
            <div className="flex gap-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key)}
                    className={cn(
                      'flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all border-b-2 -mb-px',
                      activeTab === tab.key
                        ? 'text-primary-600 border-primary-500 bg-primary-50/50'
                        : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:bg-neutral-50'
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'alert' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-warning-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800">预警参数配置</h3>
                    <p className="text-xs text-neutral-500">设置预警触发的阈值条件与升级规则</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="bg-neutral-50/50 rounded-xl p-5 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-danger-50 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-danger-500" />
                      </div>
                      <label className="text-sm font-medium text-neutral-700">
                        健康异常率阈值
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={alertConfig.healthAbnormalThreshold}
                        onChange={(e) =>
                          handleAlertConfigChange(
                            'healthAbnormalThreshold',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        max="100"
                        step="0.1"
                        className="flex-1 px-3 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all bg-white"
                      />
                      <span className="text-sm text-neutral-500 font-medium">%</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      当健康异常率超过此值时触发预警
                    </p>
                  </div>

                  <div className="bg-neutral-50/50 rounded-xl p-5 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-danger-50 flex items-center justify-center">
                        <Clock className="w-4 h-4 text-danger-500" />
                      </div>
                      <label className="text-sm font-medium text-neutral-700">
                        健康异常连续天数
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={alertConfig.healthAbnormalConsecutiveDays}
                        onChange={(e) =>
                          handleAlertConfigChange(
                            'healthAbnormalConsecutiveDays',
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="1"
                        max="30"
                        step="1"
                        className="flex-1 px-3 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all bg-white"
                      />
                      <span className="text-sm text-neutral-500 font-medium">天</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      连续多少天异常后触发预警
                    </p>
                  </div>

                  <div className="bg-neutral-50/50 rounded-xl p-5 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-warning-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-warning-500" />
                      </div>
                      <label className="text-sm font-medium text-neutral-700">
                        师生比标准
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-neutral-500 font-medium">1 :</span>
                      <input
                        type="number"
                        value={(1 / alertConfig.teacherRatioStandard).toFixed(1)}
                        onChange={(e) => {
                          const val = parseFloat(e.target.value) || 1;
                          handleAlertConfigChange('teacherRatioStandard', 1 / val);
                        }}
                        min="1"
                        max="20"
                        step="0.1"
                        className="flex-1 px-3 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all bg-white"
                      />
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      师生比低于此标准时触发预警
                    </p>
                  </div>

                  <div className="bg-neutral-50/50 rounded-xl p-5 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary-500" />
                      </div>
                      <label className="text-sm font-medium text-neutral-700">
                        入托率不足预警阈值
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={alertConfig.enrollmentShortfallThreshold}
                        onChange={(e) =>
                          handleAlertConfigChange(
                            'enrollmentShortfallThreshold',
                            parseFloat(e.target.value) || 0
                          )
                        }
                        min="0"
                        max="100"
                        step="1"
                        className="flex-1 px-3 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all bg-white"
                      />
                      <span className="text-sm text-neutral-500 font-medium">%</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      入托率低于计划此百分比时预警
                    </p>
                  </div>

                  <div className="bg-neutral-50/50 rounded-xl p-5 border border-neutral-100">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-danger-50 flex items-center justify-center">
                        <AlertTriangle className="w-4 h-4 text-danger-500" />
                      </div>
                      <label className="text-sm font-medium text-neutral-700">
                        预警升级天数
                      </label>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        value={alertConfig.escalationDays}
                        onChange={(e) =>
                          handleAlertConfigChange(
                            'escalationDays',
                            parseInt(e.target.value) || 0
                          )
                        }
                        min="1"
                        max="30"
                        step="1"
                        className="flex-1 px-3 py-2.5 border border-neutral-200 rounded-lg text-sm font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all bg-white"
                      />
                      <span className="text-sm text-neutral-500 font-medium">天</span>
                    </div>
                    <p className="text-xs text-neutral-400 mt-2">
                      预警未处理多少天后自动升级
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4">
                  <button
                    onClick={handleSaveAlertConfig}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : saveSuccess ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saving ? '保存中...' : saveSuccess ? '保存成功' : '保存配置'}
                  </button>
                  <button
                    onClick={handleResetAlertConfig}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 border border-neutral-200 text-neutral-600 text-sm font-medium rounded-xl hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <RefreshCw className="w-4 h-4" />
                    恢复默认
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'permission' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800">用户列表</h3>
                      <p className="text-xs text-neutral-500">管理系统用户账号与权限</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 text-white text-sm font-medium rounded-xl hover:bg-primary-600 transition-colors"
                  >
                    <UserPlus className="w-4 h-4" />
                    添加用户
                  </button>
                </div>

                <div className="flex flex-wrap gap-4">
                  <div className="flex-1 min-w-[200px]">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        placeholder="搜索用户名或姓名..."
                        className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                    </div>
                  </div>
                  <div className="min-w-[160px]">
                    <select
                      value={roleFilter}
                      onChange={(e) => setRoleFilter(e.target.value)}
                      className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all appearance-none cursor-pointer"
                    >
                      <option value="all">全部角色</option>
                      <option value="national">国家级管理员</option>
                      <option value="provincial">省级管理员</option>
                      <option value="municipal">市级管理员</option>
                      <option value="principal">机构园长</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white border border-neutral-100 rounded-xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-neutral-50 border-b border-neutral-100">
                        <tr>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            用户名
                          </th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            姓名
                          </th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            角色
                          </th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            所属区域
                          </th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            状态
                          </th>
                          <th className="px-5 py-3.5 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                            操作
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {filteredUsers.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-neutral-50 transition-colors"
                          >
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-neutral-800">
                                {user.username}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center">
                                  <span className="text-xs font-semibold text-primary-600">
                                    {user.name.charAt(0)}
                                  </span>
                                </div>
                                <span className="text-sm text-neutral-700">
                                  {user.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span
                                className={cn(
                                  'px-2.5 py-1 text-xs font-medium rounded-full border',
                                  getRoleBadgeStyle(user.role)
                                )}
                              >
                                {getRoleText(user.role)}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span className="text-sm text-neutral-600">
                                {getRegionText(user)}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <span
                                className={cn(
                                  'px-2.5 py-1 text-xs font-medium rounded-full border',
                                  getStatusBadgeStyle(userStatuses[user.id] || 'active')
                                )}
                              >
                                {userStatuses[user.id] === 'active' ? '正常' : '已禁用'}
                              </span>
                            </td>
                            <td className="px-5 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-1">
                                <button className="p-1.5 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button className="p-1.5 text-danger-500 hover:bg-danger-50 rounded-lg transition-colors">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="pt-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-health-50 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-health-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800">角色说明</h3>
                      <p className="text-xs text-neutral-500">系统角色权限定义与职责范围</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roleDescriptions.map((role) => (
                      <div
                        key={role.role}
                        className="bg-white border border-neutral-100 rounded-xl p-5 hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-xl flex items-center justify-center',
                              role.color === 'primary' && 'bg-primary-50',
                              role.color === 'warning' && 'bg-warning-50',
                              role.color === 'health' && 'bg-health-50',
                              role.color === 'neutral' && 'bg-neutral-100'
                            )}
                          >
                            <Shield
                              className={cn(
                                'w-5 h-5',
                                role.color === 'primary' && 'text-primary-600',
                                role.color === 'warning' && 'text-warning-600',
                                role.color === 'health' && 'text-health-600',
                                role.color === 'neutral' && 'text-neutral-600'
                              )}
                            />
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold text-neutral-800">
                              {role.title}
                            </h4>
                            <p className="text-xs text-neutral-500">{role.description}</p>
                          </div>
                        </div>
                        <ul className="space-y-2">
                          {role.permissions.map((perm, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-neutral-600">
                              <CheckCircle className="w-3.5 h-3.5 text-health-500 flex-shrink-0 mt-0.5" />
                              <span>{perm}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'system' && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                    <Info className="w-5 h-5 text-primary-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-800">系统信息</h3>
                    <p className="text-xs text-neutral-500">查看系统运行状态与版本信息</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  <div className="bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl p-5 text-white">
                    <div className="flex items-center justify-between mb-4">
                      <Server className="w-10 h-10 text-white/80" />
                      <span className="px-2.5 py-1 bg-white/20 rounded-full text-xs font-medium">
                        当前版本
                      </span>
                    </div>
                    <p className="text-3xl font-bold mb-1">{systemInfo.version}</p>
                    <p className="text-sm text-white/70">构建时间：{systemInfo.buildTime}</p>
                  </div>

                  <div className="bg-white border border-neutral-100 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-health-50 flex items-center justify-center">
                        <Database className="w-5 h-5 text-health-600" />
                      </div>
                      <span
                        className={cn(
                          'px-2.5 py-1 rounded-full text-xs font-medium',
                          systemInfo.dataSyncStatus === 'success'
                            ? 'bg-health-50 text-health-600'
                            : systemInfo.dataSyncStatus === 'syncing'
                            ? 'bg-warning-50 text-warning-600'
                            : 'bg-danger-50 text-danger-600'
                        )}
                      >
                        {systemInfo.dataSyncStatus === 'success'
                          ? '同步正常'
                          : systemInfo.dataSyncStatus === 'syncing'
                          ? '同步中'
                          : '同步异常'}
                      </span>
                    </div>
                    <p className="text-lg font-semibold text-neutral-800 mb-1">数据同步</p>
                    <p className="text-sm text-neutral-500">
                      最后同步：{systemInfo.lastSyncTime}
                    </p>
                  </div>

                  <div className="bg-white border border-neutral-100 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-warning-600" />
                      </div>
                    </div>
                    <p className="text-lg font-semibold text-neutral-800 mb-1">最后更新</p>
                    <p className="text-sm text-neutral-500">{systemInfo.lastUpdate}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="bg-white border border-neutral-100 rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                      <Server className="w-4 h-4 text-primary-500" />
                      系统资源状态
                    </h4>
                    <div className="space-y-4">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-neutral-600">服务器状态</span>
                          <span className="text-sm font-medium text-health-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            运行正常
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-health-500 rounded-full"
                            style={{ width: '85%' }}
                          />
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">CPU 使用率 35% · 内存 62%</p>
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-sm text-neutral-600">数据库状态</span>
                          <span className="text-sm font-medium text-health-600 flex items-center gap-1">
                            <CheckCircle2 className="w-4 h-4" />
                            连接正常
                          </span>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-health-500 rounded-full"
                            style={{ width: '72%' }}
                          />
                        </div>
                        <p className="text-xs text-neutral-400 mt-1">连接池使用率 48% · 响应 12ms</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white border border-neutral-100 rounded-xl p-5">
                    <h4 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                      <Users className="w-4 h-4 text-primary-500" />
                      数据统计
                    </h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <span className="text-sm text-neutral-600">接入机构总数</span>
                        <span className="text-lg font-bold text-primary-600">
                          {systemInfo.totalInstitutions.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <span className="text-sm text-neutral-600">注册用户总数</span>
                        <span className="text-lg font-bold text-health-600">
                          {systemInfo.totalUsers.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                        <span className="text-sm text-neutral-600">今日预警数</span>
                        <span className="text-lg font-bold text-warning-600">28</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-neutral-100 rounded-xl p-5">
                  <h4 className="text-sm font-semibold text-neutral-800 mb-4 flex items-center gap-2">
                    <Info className="w-4 h-4 text-primary-500" />
                    关于系统
                  </h4>
                  <div className="text-sm text-neutral-600 space-y-2">
                    <p>
                      托育机构运营监测平台是一款专为各级卫健部门设计的托育服务质量监管系统，
                      通过实时数据采集、智能预警分析和可视化展示，帮助监管部门全面掌握辖区内
                      托育机构的运营状况，提升监管效率和决策科学性。
                    </p>
                    <p className="text-neutral-500 text-xs pt-2">
                      © 2024 托育监测平台 · 技术支持：智慧卫健科技
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 shadow-2xl"
          >
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <UserPlus className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-800">添加用户</h3>
                  <p className="text-sm text-neutral-500">创建新的系统用户账号</p>
                </div>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 rounded-lg transition-colors"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  用户名 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="请输入用户名"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  姓名 <span className="text-danger-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="请输入真实姓名"
                  className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  角色 <span className="text-danger-500">*</span>
                </label>
                <select className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all appearance-none cursor-pointer bg-white">
                  <option value="">请选择角色</option>
                  <option value="national">国家级管理员</option>
                  <option value="provincial">省级管理员</option>
                  <option value="municipal">市级管理员</option>
                  <option value="principal">机构园长</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  所属区域
                </label>
                <select className="w-full px-4 py-2.5 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all appearance-none cursor-pointer bg-white">
                  <option value="">请选择省份</option>
                  <option value="guangdong">广东省</option>
                  <option value="jiangsu">江苏省</option>
                  <option value="zhejiang">浙江省</option>
                </select>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={() => setShowAddModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors"
              >
                确认添加
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
