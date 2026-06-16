import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertTriangle,
  Search,
  Filter,
  Clock,
  Eye,
  Settings2,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  Loader2,
  AlertOctagon,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/common/StatCard';
import { useAlertsStore } from '@/store/alerts';
import {
  formatDateTime,
  getAlertLevelText,
  getAlertStatusText,
  getAlertTypeText,
  formatPercent,
  formatRatio,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import type { AlertStatus, AlertLevel, AlertType } from '@/types';

const statusOptions: { value: AlertStatus | 'all'; label: string }[] = [
  { value: 'all', label: '全部状态' },
  { value: 'pending', label: '待处理' },
  { value: 'processing', label: '处理中' },
  { value: 'resolved', label: '已解决' },
  { value: 'escalated', label: '已升级' },
];

const levelOptions: { value: AlertLevel | 'all'; label: string }[] = [
  { value: 'all', label: '全部级别' },
  { value: 1, label: '一级预警' },
  { value: 2, label: '二级预警' },
  { value: 3, label: '三级预警' },
];

const typeOptions: { value: AlertType | 'all'; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'health_abnormal', label: '健康异常' },
  { value: 'teacher_ratio', label: '师生比' },
  { value: 'enrollment_shortfall', label: '招生缺口' },
];

export default function Alerts() {
  const navigate = useNavigate();
  const {
    alerts,
    total,
    page,
    pageSize,
    loading,
    statusFilter,
    levelFilter,
    typeFilter,
    searchKeyword,
    fetchAlerts,
    setFilters,
    setPagination,
    getStats,
    processAlert,
  } = useAlertsStore();

  const stats = getStats();
  const [showProcessModal, setShowProcessModal] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<string | null>(null);
  const [processNote, setProcessNote] = useState('');
  const [processStatus, setProcessStatus] = useState<AlertStatus>('processing');

  useEffect(() => {
    fetchAlerts();
  }, [fetchAlerts]);

  const handleStatusChange = (status: AlertStatus | 'all') => {
    setFilters({ status });
    setPagination(1, pageSize);
    fetchAlerts({ status, page: 1 });
  };

  const handleLevelChange = (level: AlertLevel | 'all') => {
    setFilters({ level });
    setPagination(1, pageSize);
    fetchAlerts({ level, page: 1 });
  };

  const handleTypeChange = (type: AlertType | 'all') => {
    setFilters({ type });
    setPagination(1, pageSize);
    fetchAlerts({ type, page: 1 });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setFilters({ keyword });
  };

  const handleSearchSubmit = () => {
    setPagination(1, pageSize);
    fetchAlerts({ keyword: searchKeyword, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setPagination(newPage, pageSize);
    fetchAlerts({ page: newPage });
  };

  const handleViewDetail = (id: string) => {
    navigate(`/alerts/${id}`);
  };

  const handleProcessClick = (id: string) => {
    setSelectedAlert(id);
    setShowProcessModal(true);
    setProcessNote('');
    setProcessStatus('processing');
  };

  const handleProcessSubmit = async () => {
    if (!selectedAlert) return;
    const success = await processAlert(selectedAlert, processStatus, processNote);
    if (success) {
      setShowProcessModal(false);
      setSelectedAlert(null);
      fetchAlerts();
    }
  };

  const getLevelBadgeStyle = (level: number) => {
    if (level === 1) return 'bg-danger-50 text-danger-600 border-danger-200';
    if (level === 2) return 'bg-warning-50 text-warning-600 border-warning-200';
    return 'bg-primary-50 text-primary-600 border-primary-200';
  };

  const getStatusBadgeStyle = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-danger-100 text-danger-700',
      processing: 'bg-warning-100 text-warning-700',
      resolved: 'bg-health-100 text-health-700',
      escalated: 'bg-danger-100 text-danger-700',
    };
    return map[status] || 'bg-neutral-100 text-neutral-600';
  };

  const formatValue = (type: string, value: number) => {
    if (type === 'health_abnormal') return formatPercent(value);
    if (type === 'teacher_ratio') return formatRatio(value);
    if (type === 'enrollment_shortfall') return `${value}%`;
    return String(value);
  };

  const totalPages = Math.ceil(total / pageSize);

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
            <AlertTriangle className="w-7 h-7 text-danger-500" />
            预警中心
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            实时监控预警信息，及时处理异常情况
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="预警总数"
          value={stats.total}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="primary"
          suffix="条"
        />
        <StatCard
          title="待处理"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
          variant="danger"
          suffix="条"
        />
        <StatCard
          title="处理中"
          value={stats.processing}
          icon={<Loader2 className="w-6 h-6" />}
          variant="warning"
          suffix="条"
        />
        <StatCard
          title="已解决"
          value={stats.resolved}
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="health"
          suffix="条"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-primary-500" />
          <span className="font-semibold text-neutral-800">筛选条件</span>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[160px]">
            <label className="text-sm text-neutral-500 mb-1.5 block">预警状态</label>
            <select
              value={statusFilter}
              onChange={(e) => handleStatusChange(e.target.value as AlertStatus | 'all')}
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
            >
              {statusOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="text-sm text-neutral-500 mb-1.5 block">预警级别</label>
            <select
              value={levelFilter}
              onChange={(e) => handleLevelChange(e.target.value === 'all' ? 'all' : (Number(e.target.value) as AlertLevel))}
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
            >
              {levelOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[160px]">
            <label className="text-sm text-neutral-500 mb-1.5 block">预警类型</label>
            <select
              value={typeFilter}
              onChange={(e) => handleTypeChange(e.target.value as AlertType | 'all')}
              className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1 min-w-[200px]">
            <label className="text-sm text-neutral-500 mb-1.5 block">搜索</label>
            <div className="relative">
              <input
                type="text"
                value={searchKeyword}
                onChange={handleSearch}
                onKeyDown={(e) => e.key === 'Enter' && handleSearchSubmit()}
                placeholder="搜索机构名称或预警描述..."
                className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-50 border-b border-neutral-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  预警级别
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  机构名称
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  预警类型
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  触发时间
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  连续天数
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  阈值
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  实际值
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  当前状态
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                  操作
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <Loader2 className="w-8 h-8 text-primary-500 animate-spin mx-auto" />
                    <p className="text-sm text-neutral-500 mt-2">加载中...</p>
                  </td>
                </tr>
              ) : alerts.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-6 py-12 text-center">
                    <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto" />
                    <p className="text-sm text-neutral-500 mt-2">暂无预警数据</p>
                  </td>
                </tr>
              ) : (
                alerts.map((alert, index) => (
                  <motion.tr
                    key={alert.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="hover:bg-neutral-50 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'px-2.5 py-1 text-xs font-medium rounded-full border',
                          getLevelBadgeStyle(alert.level)
                        )}
                      >
                        {getAlertLevelText(alert.level)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-neutral-800">
                        {alert.institutionName}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-600">
                        {getAlertTypeText(alert.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-sm text-neutral-500">
                          {formatDateTime(alert.triggeredAt)}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-600">
                        连续 <span className="font-semibold text-danger-600">{alert.consecutiveDays}</span> 天
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-neutral-500">
                        {formatValue(alert.type, alert.threshold)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-semibold text-danger-600">
                        {formatValue(alert.type, alert.actualValue)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={cn(
                          'px-2.5 py-1 text-xs font-medium rounded-full',
                          getStatusBadgeStyle(alert.status)
                        )}
                      >
                        {getAlertStatusText(alert.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(alert.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          查看详情
                        </button>
                        {(alert.status === 'pending' || alert.status === 'processing') && (
                          <button
                            onClick={() => handleProcessClick(alert.id)}
                            className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-white bg-primary-500 rounded-lg hover:bg-primary-600 transition-colors"
                          >
                            <Settings2 className="w-3.5 h-3.5" />
                            处理
                          </button>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!loading && alerts.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100">
            <div className="text-sm text-neutral-500">
              共 <span className="font-semibold text-neutral-700">{total}</span> 条记录
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className={cn(
                  'p-2 rounded-lg border transition-all',
                  page <= 1
                    ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-primary-300'
                )}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (page <= 3) {
                  pageNum = i + 1;
                } else if (page >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = page - 2 + i;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={cn(
                      'w-9 h-9 rounded-lg text-sm font-medium transition-all',
                      page === pageNum
                        ? 'bg-primary-500 text-white shadow-md'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    )}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className={cn(
                  'p-2 rounded-lg border transition-all',
                  page >= totalPages
                    ? 'border-neutral-200 text-neutral-300 cursor-not-allowed'
                    : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50 hover:border-primary-300'
                )}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {showProcessModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center">
                <AlertOctagon className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-800">处理预警</h3>
                <p className="text-sm text-neutral-500">请填写处理信息</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  处理状态
                </label>
                <select
                  value={processStatus}
                  onChange={(e) => setProcessStatus(e.target.value as AlertStatus)}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                >
                  <option value="processing">处理中</option>
                  <option value="resolved">已解决</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  处理意见
                </label>
                <textarea
                  value={processNote}
                  onChange={(e) => setProcessNote(e.target.value)}
                  placeholder="请输入处理意见..."
                  rows={4}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowProcessModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleProcessSubmit}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-primary-500 rounded-xl hover:bg-primary-600 transition-colors"
              >
                确认处理
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
