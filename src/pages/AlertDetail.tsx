import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  ChevronRight,
  Home,
  AlertTriangle,
  Building2,
  Clock,
  User,
  Calendar,
  ArrowUpCircle,
  MessageSquare,
  CheckCircle2,
  Loader2,
  AlertOctagon,
  Activity,
  MapPin,
  Phone,
  UserCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAlertsStore } from '@/store/alerts';
import {
  formatDateTime,
  getAlertLevelText,
  getAlertStatusText,
  getAlertTypeText,
  formatPercent,
  formatRatio,
  formatDate,
  getInstitutionLevelText,
  getInstitutionStatusText,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import { generateHistoricalRealtimeData, mockInstitutions } from '@/mock/data';
import type { AlertStatus } from '@/types';

export default function AlertDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { selectedAlert, loading, fetchAlertById, processAlert, escalateAlert } = useAlertsStore();

  const [processStatus, setProcessStatus] = useState<AlertStatus>('processing');
  const [processNote, setProcessNote] = useState('');
  const [showEscalateModal, setShowEscalateModal] = useState(false);
  const [escalateReason, setEscalateReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (id) {
      fetchAlertById(id);
    }
  }, [id, fetchAlertById]);

  const institution = useMemo(() => {
    if (!selectedAlert) return null;
    return mockInstitutions.find((i) => i.id === selectedAlert.institutionId) || null;
  }, [selectedAlert]);

  const historicalData = useMemo(() => {
    if (!selectedAlert) return [];
    return generateHistoricalRealtimeData(selectedAlert.institutionId, 30);
  }, [selectedAlert]);

  const processRecords = useMemo(() => {
    if (!selectedAlert) return [];
    const records = [
      {
        id: 1,
        status: 'triggered',
        title: '预警触发',
        description: selectedAlert.description,
        time: selectedAlert.triggeredAt,
        operator: '系统自动检测',
      },
    ];

    if (selectedAlert.handlerName && selectedAlert.status !== 'pending') {
      records.push({
        id: 2,
        status: 'processing',
        title: '开始处理',
        description: `${selectedAlert.handlerName} 已接手处理此预警`,
        time: selectedAlert.triggeredAt,
        operator: selectedAlert.handlerName,
      });
    }

    if (selectedAlert.status === 'resolved' && selectedAlert.resolvedAt) {
      records.push({
        id: 3,
        status: 'resolved',
        title: '预警已解决',
        description: selectedAlert.resolution || '已采取相应措施并整改到位',
        time: selectedAlert.resolvedAt,
        operator: selectedAlert.handlerName || '系统',
      });
    }

    if (selectedAlert.status === 'escalated') {
      records.push({
        id: 2,
        status: 'escalated',
        title: '预警已升级',
        description: '由于情况严重，已升级至上级部门处理',
        time: selectedAlert.triggeredAt,
        operator: selectedAlert.handlerName || '系统',
      });
    }

    return records;
  }, [selectedAlert]);

  const trendOption = useMemo(() => {
    if (!selectedAlert || historicalData.length === 0) return {};

    const dates = historicalData.map((d) => formatDate(d.timestamp));
    let values: number[] = [];
    const threshold = selectedAlert.threshold;
    let metricName = '';
    let unit = '';

    if (selectedAlert.type === 'health_abnormal') {
      values = historicalData.map((d) => d.health.abnormalRate);
      metricName = '健康异常率';
      unit = '%';
    } else if (selectedAlert.type === 'teacher_ratio') {
      values = historicalData.map((d) => parseFloat((d.attendance.total > 0 ? d.attendance.total / (d.attendance.total * 0.12) : 0.12).toFixed(3)));
      metricName = '师生比';
      unit = '';
    } else if (selectedAlert.type === 'enrollment_shortfall') {
      values = historicalData.map((d) => parseFloat((d.attendance.rate * 0.85).toFixed(1)));
      metricName = '入托率';
      unit = '%';
    }

    return {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '4%',
        top: '15%',
        bottom: '10%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        backgroundColor: 'rgba(26, 54, 93, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: { name: string; value: number }[]) => {
          const item = params[0];
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>${metricName}：</span>
              <span style="font-weight: 600; color: #fc8181">
                ${item.value.toFixed(2)}${unit}
              </span>
            </div>
          `;
        },
      },
      legend: {
        data: [metricName, '预警阈值'],
        top: 0,
        right: 0,
        textStyle: {
          color: '#718096',
          fontSize: 12,
        },
        itemWidth: 12,
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: {
          lineStyle: {
            color: '#e2e8f0',
          },
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#a0aec0',
          fontSize: 11,
          interval: Math.floor(dates.length / 6),
        },
      },
      yAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#a0aec0',
          fontSize: 12,
          formatter: `{value}${unit}`,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(203, 213, 220, 0.3)',
            type: 'dashed',
          },
        },
      },
      series: [
        {
          name: metricName,
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: values,
          lineStyle: {
            width: 2,
            color: '#e53e3e',
          },
          itemStyle: {
            color: '#e53e3e',
            borderColor: '#fff',
            borderWidth: 2,
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(229, 62, 62, 0.2)' },
                { offset: 1, color: 'rgba(229, 62, 62, 0.02)' },
              ],
            },
          },
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: {
              color: '#e53e3e',
              type: 'dashed',
              width: 2,
            },
            data: [
              {
                yAxis: threshold,
                label: {
                  formatter: '阈值',
                  position: 'end',
                  color: '#e53e3e',
                  fontSize: 12,
                },
              },
            ],
          },
        },
      ],
    };
  }, [selectedAlert, historicalData]);

  const handleProcess = async () => {
    if (!selectedAlert || !processNote) return;
    setProcessing(true);
    const success = await processAlert(selectedAlert.id, processStatus, processNote);
    setProcessing(false);
    if (success) {
      fetchAlertById(selectedAlert.id);
      setProcessNote('');
    }
  };

  const handleEscalate = async () => {
    if (!selectedAlert) return;
    setProcessing(true);
    const success = await escalateAlert(selectedAlert.id);
    setProcessing(false);
    if (success) {
      setShowEscalateModal(false);
      setEscalateReason('');
      fetchAlertById(selectedAlert.id);
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

  const getTimelineIcon = (status: string) => {
    switch (status) {
      case 'triggered':
        return <AlertTriangle className="w-5 h-5" />;
      case 'processing':
        return <Loader2 className="w-5 h-5" />;
      case 'resolved':
        return <CheckCircle2 className="w-5 h-5" />;
      case 'escalated':
        return <ArrowUpCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getTimelineColor = (status: string) => {
    switch (status) {
      case 'triggered':
        return 'bg-danger-500';
      case 'processing':
        return 'bg-warning-500';
      case 'resolved':
        return 'bg-health-500';
      case 'escalated':
        return 'bg-danger-500';
      default:
        return 'bg-neutral-400';
    }
  };

  const formatValue = (type: string, value: number) => {
    if (type === 'health_abnormal') return formatPercent(value);
    if (type === 'teacher_ratio') return formatRatio(value);
    if (type === 'enrollment_shortfall') return `${value}%`;
    return String(value);
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

  if (loading && !selectedAlert) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-10 h-10 text-primary-500 animate-spin" />
      </div>
    );
  }

  if (!selectedAlert) {
    return (
      <div className="text-center py-12">
        <AlertOctagon className="w-16 h-16 text-neutral-300 mx-auto" />
        <p className="text-neutral-500 mt-4">预警不存在或已被删除</p>
        <button
          onClick={() => navigate('/alerts')}
          className="mt-4 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors"
        >
          返回预警列表
        </button>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      <motion.div variants={itemVariants}>
        <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 hover:text-primary-600 transition-colors"
          >
            <Home className="w-4 h-4" />
            首页
          </button>
          <ChevronRight className="w-4 h-4" />
          <button
            onClick={() => navigate('/alerts')}
            className="flex items-center gap-1 hover:text-primary-600 transition-colors"
          >
            <AlertTriangle className="w-4 h-4" />
            预警中心
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary-600 font-medium">预警详情</span>
        </nav>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-full border',
                  getLevelBadgeStyle(selectedAlert.level)
                )}
              >
                {getAlertLevelText(selectedAlert.level)}
              </span>
              <span
                className={cn(
                  'px-3 py-1.5 text-sm font-medium rounded-full',
                  getStatusBadgeStyle(selectedAlert.status)
                )}
              >
                {getAlertStatusText(selectedAlert.status)}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-800 mb-2">
              {selectedAlert.institutionName}
            </h1>
            <p className="text-neutral-600 mb-4">{selectedAlert.description}</p>
            <div className="flex flex-wrap gap-6 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                <span>触发时间：{formatDateTime(selectedAlert.triggeredAt)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                <span>连续天数：{selectedAlert.consecutiveDays} 天</span>
              </div>
              {selectedAlert.handlerName && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  <span>处理人：{selectedAlert.handlerName}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 lg:gap-6">
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <p className="text-xs text-neutral-500 mb-1">预警类型</p>
              <p className="text-sm font-semibold text-neutral-700">
                {getAlertTypeText(selectedAlert.type)}
              </p>
            </div>
            <div className="text-center p-4 bg-neutral-50 rounded-xl">
              <p className="text-xs text-neutral-500 mb-1">预警阈值</p>
              <p className="text-sm font-semibold text-neutral-700">
                {formatValue(selectedAlert.type, selectedAlert.threshold)}
              </p>
            </div>
            <div className="text-center p-4 bg-danger-50 rounded-xl">
              <p className="text-xs text-danger-500 mb-1">实际值</p>
              <p className="text-sm font-bold text-danger-600">
                {formatValue(selectedAlert.type, selectedAlert.actualValue)}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div variants={itemVariants} className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <Activity className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">历史趋势</h3>
                <p className="text-xs text-neutral-500">近30天该指标变化趋势</p>
              </div>
            </div>
            <div className="h-72">
              <ReactECharts
                option={trendOption}
                style={{ height: '100%', width: '100%' }}
                opts={{ renderer: 'canvas' }}
              />
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">处理记录</h3>
                <p className="text-xs text-neutral-500">预警处理的完整时间线</p>
              </div>
            </div>

            <div className="relative">
              <div className="absolute left-[18px] top-2 bottom-2 w-0.5 bg-neutral-200" />
              <div className="space-y-6">
                {processRecords.map((record) => (
                  <div key={record.id} className="relative flex gap-4">
                    <div
                      className={cn(
                        'relative z-10 w-9 h-9 rounded-full flex items-center justify-center text-white flex-shrink-0',
                        getTimelineColor(record.status)
                      )}
                    >
                      {getTimelineIcon(record.status)}
                    </div>
                    <div className="flex-1 pt-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold text-neutral-800">
                          {record.title}
                        </h4>
                        <span className="text-xs text-neutral-500">
                          {formatDateTime(record.time)}
                        </span>
                      </div>
                      <p className="text-sm text-neutral-600 mb-1">{record.description}</p>
                      <p className="text-xs text-neutral-400">操作人：{record.operator}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div variants={itemVariants} className="space-y-6">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-health-50 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-health-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">关联机构</h3>
                <p className="text-xs text-neutral-500">预警所属机构信息</p>
              </div>
            </div>

            {institution ? (
              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-semibold text-neutral-800 mb-1">
                    {institution.name}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-primary-50 text-primary-600 text-xs font-medium rounded-full">
                      {getInstitutionLevelText(institution.level)}
                    </span>
                    <span
                      className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        institution.status === 'normal'
                          ? 'bg-health-50 text-health-600'
                          : institution.status === 'warning'
                          ? 'bg-warning-50 text-warning-600'
                          : 'bg-danger-50 text-danger-600'
                      )}
                    >
                      {getInstitutionStatusText(institution.status)}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-neutral-100">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-4 h-4 text-neutral-400 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-neutral-600">
                      {institution.address.province}
                      {institution.address.city}
                      {institution.address.district}
                      {institution.address.detail}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-600">
                      {institution.contactPhone}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-neutral-400 flex-shrink-0" />
                    <span className="text-sm text-neutral-600">
                      {institution.contactPerson}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100">
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-lg font-bold text-primary-600">
                      {institution.studentCount}
                    </p>
                    <p className="text-xs text-neutral-500">在园学生</p>
                  </div>
                  <div className="text-center p-3 bg-neutral-50 rounded-lg">
                    <p className="text-lg font-bold text-health-600">
                      {institution.teacherCount}
                    </p>
                    <p className="text-xs text-neutral-500">教职工数</p>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-neutral-500 text-center py-8">暂无机构信息</p>
            )}
          </div>

          {(selectedAlert.status === 'pending' || selectedAlert.status === 'processing') && (
            <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <UserCheck className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800">处理操作</h3>
                  <p className="text-xs text-neutral-500">处理预警或升级审批</p>
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
                    placeholder="请填写处理意见..."
                    rows={3}
                    className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleProcess}
                    disabled={processing || !processNote}
                    className={cn(
                      'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors flex items-center justify-center gap-2',
                      processing || !processNote
                        ? 'bg-primary-300 cursor-not-allowed'
                        : 'bg-primary-500 hover:bg-primary-600'
                    )}
                  >
                    {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                    提交处理
                  </button>
                  <button
                    onClick={() => setShowEscalateModal(true)}
                    className="flex-1 px-4 py-2.5 text-sm font-medium text-danger-600 bg-danger-50 rounded-xl hover:bg-danger-100 transition-colors flex items-center justify-center gap-2"
                  >
                    <ArrowUpCircle className="w-4 h-4" />
                    升级审批
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {showEscalateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl p-6 w-full max-w-md mx-4 shadow-2xl"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-danger-50 flex items-center justify-center">
                <ArrowUpCircle className="w-6 h-6 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-neutral-800">升级审批</h3>
                <p className="text-sm text-neutral-500">将预警升级至上级部门处理</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-neutral-700 mb-1.5 block">
                  升级原因
                </label>
                <textarea
                  value={escalateReason}
                  onChange={(e) => setEscalateReason(e.target.value)}
                  placeholder="请填写升级原因..."
                  rows={4}
                  className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all resize-none"
                />
              </div>

              <div className="p-4 bg-warning-50 rounded-xl">
                <p className="text-sm text-warning-700">
                  <strong>温馨提示：</strong>升级后预警将提交至上级卫健部门处理，请确保情况属实且必要。
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEscalateModal(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleEscalate}
                disabled={processing || !escalateReason}
                className={cn(
                  'flex-1 px-4 py-2.5 text-sm font-medium text-white rounded-xl transition-colors flex items-center justify-center gap-2',
                  processing || !escalateReason
                    ? 'bg-danger-300 cursor-not-allowed'
                    : 'bg-danger-500 hover:bg-danger-600'
                )}
              >
                {processing && <Loader2 className="w-4 h-4 animate-spin" />}
                确认升级
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}
