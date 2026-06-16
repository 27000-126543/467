import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileCheck,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  ChevronDown,
  Calendar,
  Eye,
  ThumbsUp,
  AlertTriangle,
  Building2,
  ArrowRight,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Pagination, Spin, Empty } from 'antd';
import StatCard from '@/components/common/StatCard';
import { useApprovalsStore } from '@/store/approvals';
import {
  formatDateTime,
  getApprovalStatusText,
  getApprovalTypeText,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import type { ApprovalType, ApprovalStatus } from '@/types';

const typeOptions = [
  { label: '全部类型', value: 'all' },
  { label: '班额调整', value: 'class_adjustment' },
  { label: '限停招收', value: 'enrollment_suspension' },
];

const statusOptions = [
  { label: '全部状态', value: 'all' },
  { label: '待园长确认', value: 'pending_principal' },
  { label: '待区卫健复核', value: 'pending_district' },
  { label: '待市卫健委批准', value: 'pending_city' },
  { label: '已通过', value: 'approved' },
  { label: '已驳回', value: 'rejected' },
];

export default function Approvals() {
  const navigate = useNavigate();
  const {
    loading,
    page,
    pageSize,
    activeTab,
    typeFilter,
    statusFilter,
    searchKeyword,
    initApprovals,
    setActiveTab,
    setFilters,
    setPagination,
    getFilteredApprovals,
    getStats,
  } = useApprovalsStore();

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const filteredApprovals = useMemo(() => getFilteredApprovals(), [getFilteredApprovals]);
  const stats = useMemo(() => getStats(), [getStats]);

  const pagedApprovals = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredApprovals.slice(start, start + pageSize);
  }, [filteredApprovals, page, pageSize]);

  const total = filteredApprovals.length;

  useEffect(() => {
    initApprovals();
  }, [initApprovals]);

  const handleTabChange = (tab: 'pending' | 'approved' | 'all') => {
    setActiveTab(tab);
  };

  const handleTypeChange = (value: ApprovalType | 'all') => {
    setFilters({ type: value });
  };

  const handleStatusChange = (value: ApprovalStatus | 'all') => {
    setFilters({ status: value });
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const keyword = e.target.value;
    setFilters({ keyword });
  };

  const handleDateChange = () => {
    if (startDate && endDate) {
      setFilters({ dateRange: [startDate, endDate] });
    } else if (!startDate && !endDate) {
      setFilters({ dateRange: null });
    }
  };

  const handlePageChange = (page: number, pageSize: number) => {
    setPagination(page, pageSize);
  };

  const handleViewDetail = (id: string) => {
    navigate(`/approvals/${id}`);
  };

  const handleApprove = (id: string) => {
    navigate(`/approvals/${id}?action=approve`);
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending_principal':
      case 'pending_district':
      case 'pending_city':
        return 'bg-warning-50 text-warning-600 border-warning-200';
      case 'approved':
        return 'bg-health-50 text-health-600 border-health-200';
      case 'rejected':
        return 'bg-danger-50 text-danger-600 border-danger-200';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'class_adjustment':
        return 'bg-primary-50 text-primary-600 border-primary-200';
      case 'enrollment_suspension':
        return 'bg-danger-50 text-danger-600 border-danger-200';
      default:
        return 'bg-neutral-50 text-neutral-600 border-neutral-200';
    }
  };

  const getCurrentStageText = (approval: { currentStage: number; status: string }) => {
    if (approval.status === 'approved') return '已完成审批';
    if (approval.status === 'rejected') return '审批已驳回';
    const stageTexts = ['园长确认', '区卫健复核', '市卫健委批准'];
    return stageTexts[approval.currentStage - 1] || '未知阶段';
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
            <FileCheck className="w-7 h-7 text-primary-600" />
            审批中心
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            管理和处理各类审批事项，确保托育机构规范运营
          </p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="待办审批"
          value={stats.pending}
          icon={<Clock className="w-6 h-6" />}
          variant="warning"
          trendData={[5, 7, 6, 8, 5, 9, 7]}
        />
        <StatCard
          title="进行中"
          value={stats.processing}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="primary"
          trendData={[3, 4, 5, 4, 6, 5, 4]}
        />
        <StatCard
          title="已通过"
          value={stats.approved}
          icon={<CheckCircle2 className="w-6 h-6" />}
          variant="health"
          trendData={[10, 12, 15, 14, 18, 20, 22]}
        />
        <StatCard
          title="已驳回"
          value={stats.rejected}
          icon={<XCircle className="w-6 h-6" />}
          variant="danger"
          trendData={[2, 3, 1, 2, 3, 1, 2]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card border border-neutral-100">
        <div className="flex border-b border-neutral-100">
          <button
            onClick={() => handleTabChange('pending')}
            className={cn(
              'px-6 py-4 text-sm font-medium transition-all relative',
              activeTab === 'pending'
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            待我审批
            {stats.pending > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-warning-100 text-warning-600 text-xs font-medium rounded-full">
                {stats.pending}
              </span>
            )}
            {activeTab === 'pending' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('approved')}
            className={cn(
              'px-6 py-4 text-sm font-medium transition-all relative',
              activeTab === 'approved'
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            我已审批
            {activeTab === 'approved' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
            )}
          </button>
          <button
            onClick={() => handleTabChange('all')}
            className={cn(
              'px-6 py-4 text-sm font-medium transition-all relative',
              activeTab === 'all'
                ? 'text-primary-600'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            全部审批
            {activeTab === 'all' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 rounded-full" />
            )}
          </button>
        </div>

        <div className="p-5 border-b border-neutral-100">
          <div className="flex flex-wrap items-center gap-4">
            <div className="relative flex-1 min-w-[200px] max-w-[320px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                placeholder="搜索机构名称或审批编号"
                value={searchKeyword}
                onChange={handleSearch}
                className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
            </div>

            <div className="relative">
              <select
                value={typeFilter}
                onChange={(e) => handleTypeChange(e.target.value as ApprovalType | 'all')}
                className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>

            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => handleStatusChange(e.target.value as ApprovalStatus | 'all')}
                className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
              >
                {statusOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-400" />
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                onBlur={handleDateChange}
                className="px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
              <span className="text-neutral-400">至</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                onBlur={handleDateChange}
                className="px-3 py-2.5 bg-white border border-neutral-200 rounded-xl text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
              />
            </div>
          </div>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Spin size="large" />
            </div>
          ) : pagedApprovals.length === 0 ? (
            <div className="py-20">
              <Empty description="暂无审批数据" />
            </div>
          ) : (
            <div className="space-y-4">
              {pagedApprovals.map((approval, index) => (
                <motion.div
                  key={approval.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-5 rounded-xl border border-neutral-200 hover:border-primary-200 hover:bg-primary-50/30 transition-all group"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-3">
                        <span
                          className={cn(
                            'px-3 py-1 text-xs font-medium rounded-full border',
                            getTypeBadgeStyle(approval.type)
                          )}
                        >
                          {getApprovalTypeText(approval.type)}
                        </span>
                        <span
                          className={cn(
                            'px-3 py-1 text-xs font-medium rounded-full border',
                            getStatusBadgeStyle(approval.status)
                          )}
                        >
                          {getApprovalStatusText(approval.status)}
                        </span>
                        <span className="text-xs text-neutral-400">
                          {approval.id}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-2">
                        <Building2 className="w-4 h-4 text-neutral-400" />
                        <h3 className="text-base font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">
                          {approval.institutionName}
                        </h3>
                      </div>

                      <p className="text-sm text-neutral-500 line-clamp-1 mb-3">
                        {approval.proposedAction}
                      </p>

                      <div className="flex items-center gap-6 text-xs text-neutral-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          <span>创建时间：{formatDateTime(approval.createdAt)}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5" />
                          <span>当前阶段：{getCurrentStageText(approval)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleViewDetail(approval.id)}
                          className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                          查看详情
                        </button>
                        {(approval.status === 'pending_principal' ||
                          approval.status === 'pending_district' ||
                          approval.status === 'pending_city') && (
                          <button
                            onClick={() => handleApprove(approval.id)}
                            className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg hover:from-primary-600 hover:to-primary-700 transition-all shadow-sm hover:shadow-md"
                          >
                            <ThumbsUp className="w-4 h-4" />
                            审批
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-neutral-100">
                    <div className="flex items-center gap-4">
                      {approval.stages.map((stage, idx) => (
                        <div key={idx} className="flex items-center">
                          <div
                            className={cn(
                              'w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium',
                              stage.status === 'approved'
                                ? 'bg-health-500 text-white'
                                : stage.status === 'rejected'
                                ? 'bg-danger-500 text-white'
                                : 'bg-neutral-200 text-neutral-500'
                            )}
                          >
                            {stage.status === 'approved' ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : stage.status === 'rejected' ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              idx + 1
                            )}
                          </div>
                          <span
                            className={cn(
                              'ml-2 text-xs',
                              stage.status === 'approved'
                                ? 'text-health-600'
                                : stage.status === 'rejected'
                                ? 'text-danger-600'
                                : 'text-neutral-500'
                            )}
                          >
                            {stage.role}
                          </span>
                          {idx < approval.stages.length - 1 && (
                            <div
                              className={cn(
                                'w-8 h-0.5 mx-2',
                                stage.status === 'approved'
                                  ? 'bg-health-300'
                                  : 'bg-neutral-200'
                              )}
                            />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}

          {total > 0 && (
            <div className="mt-6 flex justify-end">
              <Pagination
                current={page}
                pageSize={pageSize}
                total={total}
                onChange={handlePageChange}
                showSizeChanger
                showTotal={(total) => `共 ${total} 条记录`}
              />
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
