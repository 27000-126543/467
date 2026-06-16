import { useState, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  FileText,
  Search,
  Filter,
  Calendar,
  Eye,
  Download,
  ArrowLeft,
  Users,
  HeartPulse,
  UtensilsCrossed,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  AlertCircle,
  ChevronDown,
  Lightbulb,
  Zap,
  Star,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import StatCard from '@/components/common/StatCard';
import { mockReports } from '@/mock/data';
import {
  formatPercent,
  formatDate,
  formatDateTime,
  formatRatio,
  getReportPeriodText,
  getPriorityText,
  getCategoryText,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import type { OperationReport, ReportPeriod, RecommendationPriority } from '@/types';

const periodOptions: { value: ReportPeriod | 'all'; label: string }[] = [
  { value: 'all', label: '全部类型' },
  { value: 'week', label: '周报' },
  { value: 'month', label: '月报' },
];

export default function Reports() {
  const [viewMode, setViewMode] = useState<'list' | 'detail'>('list');
  const [selectedReport, setSelectedReport] = useState<OperationReport | null>(null);
  const [periodFilter, setPeriodFilter] = useState<ReportPeriod | 'all'>('all');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const filteredReports = useMemo(() => {
    return mockReports.filter((report) => {
      if (periodFilter !== 'all' && report.period !== periodFilter) {
        return false;
      }

      if (searchKeyword) {
        const keyword = searchKeyword.toLowerCase();
        const reportName = `${report.regionName}运营分析报告`.toLowerCase();
        if (!reportName.includes(keyword)) {
          return false;
        }
      }

      if (dateRange.start) {
        if (new Date(report.periodStart) < new Date(dateRange.start)) {
          return false;
        }
      }
      if (dateRange.end) {
        if (new Date(report.periodEnd) > new Date(dateRange.end)) {
          return false;
        }
      }

      return true;
    });
  }, [periodFilter, searchKeyword, dateRange]);

  const handleViewDetail = (report: OperationReport) => {
    setSelectedReport(report);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedReport(null);
  };

  const handleDownload = (report: OperationReport) => {
    alert(`正在下载报告：${report.regionName}运营分析报告`);
  };

  const getWeekNumber = (startDate: string) => {
    const date = new Date(startDate);
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
  };

  const getReportTitle = (report: OperationReport) => {
    if (report.period === 'week') {
      const weekNum = getWeekNumber(report.periodStart);
      return `第${weekNum}周运营诊断报告`;
    }
    const date = new Date(report.periodStart);
    return `${date.getFullYear()}年${date.getMonth() + 1}月运营诊断报告`;
  };

  const pieOption = useMemo(() => {
    if (!selectedReport) return {};

    const colors = ['#1a365d', '#3b76f5', '#7aa8ff', '#b9d2ff'];

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(26, 54, 93, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: {
          color: '#fff',
        },
        formatter: (params: { name: string; value: number; percent: number }) => {
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">${params.name}</div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>数量：</span>
              <span style="font-weight: 600;">${params.value}例</span>
            </div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>占比：</span>
              <span style="font-weight: 600;">${params.percent}%</span>
            </div>
          `;
        },
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: {
          color: '#4a5568',
          fontSize: 12,
        },
        itemWidth: 12,
        itemHeight: 12,
        itemGap: 12,
      },
      series: [
        {
          name: '健康异常原因',
          type: 'pie',
          radius: ['45%', '70%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 6,
            borderColor: '#fff',
            borderWidth: 2,
          },
          label: {
            show: false,
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 14,
              fontWeight: 'bold',
            },
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: 'rgba(26, 54, 93, 0.3)',
            },
          },
          labelLine: {
            show: false,
          },
          data: selectedReport.analysis.healthAbnormalReasons.map((item, index) => ({
            value: item.count,
            name: item.reason,
            itemStyle: {
              color: colors[index % colors.length],
            },
          })),
        },
      ],
    };
  }, [selectedReport]);

  const barOption = useMemo(() => {
    if (!selectedReport) return {};

    const data = selectedReport.analysis.teacherRatioRanking;

    return {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '8%',
        top: '5%',
        bottom: '5%',
        containLabel: true,
      },
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow',
        },
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
              <span>师生比：</span>
              <span style="font-weight: 600; color: #68d391">
                1:${(1 / item.value).toFixed(1)}
              </span>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'value',
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#a0aec0',
          fontSize: 11,
          formatter: (value: number) => `1:${(1 / value).toFixed(1)}`,
        },
        splitLine: {
          lineStyle: {
            color: 'rgba(203, 213, 220, 0.3)',
            type: 'dashed',
          },
        },
      },
      yAxis: {
        type: 'category',
        data: data.map((d) => d.institutionName),
        inverse: true,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#4a5568',
          fontSize: 11,
          fontWeight: 500,
        },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => ({
            value: d.ratio,
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  { offset: 0, color: '#1a365d' },
                  { offset: 1, color: '#3b76f5' },
                ],
              },
              borderRadius: [0, 4, 4, 0],
            },
          })),
          barWidth: '55%',
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowColor: 'rgba(26, 54, 93, 0.3)',
            },
          },
          animationDuration: 1000,
          animationEasing: 'cubicOut',
        },
      ],
    };
  }, [selectedReport]);

  const lineOption = useMemo(() => {
    if (!selectedReport) return {};

    const data = selectedReport.analysis.attendanceTrend;

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
              <span>入托率：</span>
              <span style="font-weight: 600; color: #68d391">
                ${item.value.toFixed(2)}%
              </span>
            </div>
          `;
        },
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => {
          const date = new Date(d.date);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        }),
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
        },
      },
      yAxis: {
        type: 'value',
        min: 80,
        max: 100,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#a0aec0',
          fontSize: 11,
          formatter: '{value}%',
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
          name: '入托率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 7,
          data: data.map((d) => d.rate),
          lineStyle: {
            width: 2.5,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 1,
              y2: 0,
              colorStops: [
                { offset: 0, color: '#1a365d' },
                { offset: 1, color: '#3b76f5' },
              ],
            },
          },
          itemStyle: {
            color: '#1a365d',
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
                { offset: 0, color: 'rgba(26, 54, 93, 0.2)' },
                { offset: 1, color: 'rgba(26, 54, 93, 0.02)' },
              ],
            },
          },
          animationDuration: 1500,
          animationEasing: 'cubicOut',
        },
      ],
    };
  }, [selectedReport]);

  const recommendationsByPriority = useMemo(() => {
    if (!selectedReport) return { high: [], medium: [], low: [] };

    const result: Record<RecommendationPriority, typeof selectedReport.recommendations> = {
      high: [],
      medium: [],
      low: [],
    };

    selectedReport.recommendations.forEach((rec) => {
      result[rec.priority].push(rec);
    });

    return result;
  }, [selectedReport]);

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <Zap className="w-4 h-4" />;
      case 'medium':
        return <AlertCircle className="w-4 h-4" />;
      case 'low':
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
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
      <AnimatePresence mode="wait">
        {viewMode === 'list' ? (
          <motion.div
            key="list"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.div variants={itemVariants} className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-primary-800 flex items-center gap-2">
                  <FileText className="w-7 h-7 text-primary-600" />
                  运营报告中心
                </h1>
                <p className="text-sm text-neutral-500 mt-1">
                  多维度运营分析报告，助力科学决策与管理优化
                </p>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="w-5 h-5 text-primary-500" />
                <span className="font-semibold text-neutral-800">筛选条件</span>
              </div>
              <div className="flex flex-wrap gap-4">
                <div className="w-48">
                  <label className="text-sm text-neutral-500 mb-1.5 block">报告类型</label>
                  <div className="relative">
                    <select
                      value={periodFilter}
                      onChange={(e) => setPeriodFilter(e.target.value as ReportPeriod | 'all')}
                      className="w-full appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
                    >
                      {periodOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div className="w-44">
                  <label className="text-sm text-neutral-500 mb-1.5 block">开始日期</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.start}
                      onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div className="w-44">
                  <label className="text-sm text-neutral-500 mb-1.5 block">结束日期</label>
                  <div className="relative">
                    <input
                      type="date"
                      value={dateRange.end}
                      onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                    />
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                  </div>
                </div>

                <div className="flex-1 min-w-[200px]">
                  <label className="text-sm text-neutral-500 mb-1.5 block">搜索报告</label>
                  <div className="relative">
                    <input
                      type="text"
                      value={searchKeyword}
                      onChange={(e) => setSearchKeyword(e.target.value)}
                      placeholder="输入报告名称关键词..."
                      className="w-full bg-white border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div variants={itemVariants}>
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-neutral-500">
                  共 <span className="font-semibold text-neutral-700">{filteredReports.length}</span> 份报告
                </p>
              </div>

              {filteredReports.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-card p-12 border border-neutral-100 text-center">
                  <AlertCircle className="w-16 h-16 text-neutral-300 mx-auto mb-4" />
                  <p className="text-neutral-500">暂无符合条件的报告</p>
                  <p className="text-sm text-neutral-400 mt-1">请尝试调整筛选条件</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredReports.map((report, index) => (
                    <motion.div
                      key={report.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.06 }}
                      className="bg-white rounded-2xl shadow-card border border-neutral-100 p-5 hover:shadow-card-hover hover:border-primary-200 transition-all cursor-pointer group"
                      onClick={() => handleViewDetail(report)}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span
                            className={cn(
                              'px-2.5 py-1 text-xs font-medium rounded-full',
                              report.period === 'week'
                                ? 'bg-primary-100 text-primary-700'
                                : 'bg-warning-100 text-warning-700'
                            )}
                          >
                            {getReportPeriodText(report.period)}
                          </span>
                        </div>
                        <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                          <FileText className="w-5 h-5 text-primary-600" />
                        </div>
                      </div>

                      <h3 className="text-base font-semibold text-neutral-800 mb-2 group-hover:text-primary-700 transition-colors line-clamp-1">
                        {getReportTitle(report)}
                      </h3>

                      <p className="text-xs text-neutral-500 mb-4">
                        {report.regionName} · {report.periodStart} ~ {report.periodEnd}
                      </p>

                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-neutral-50 rounded-lg p-2.5">
                          <p className="text-xs text-neutral-500 mb-0.5">入托率</p>
                          <p className="text-sm font-bold text-primary-600">
                            {formatPercent(report.metrics.attendanceRate.value)}
                          </p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-2.5">
                          <p className="text-xs text-neutral-500 mb-0.5">健康异常率</p>
                          <p className="text-sm font-bold text-danger-600">
                            {formatPercent(report.metrics.healthAbnormalRate.value)}
                          </p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-2.5">
                          <p className="text-xs text-neutral-500 mb-0.5">师生比</p>
                          <p className="text-sm font-bold text-warning-600">
                            {formatRatio(report.metrics.teacherStudentRatio.value)}
                          </p>
                        </div>
                        <div className="bg-neutral-50 rounded-lg p-2.5">
                          <p className="text-xs text-neutral-500 mb-0.5">营养达标率</p>
                          <p className="text-sm font-bold text-health-600">
                            {formatPercent(report.metrics.nutritionComplianceRate.value)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <div className="flex items-center gap-1.5">
                          <Lightbulb className="w-3.5 h-3.5 text-warning-500" />
                          <span className="text-xs text-neutral-500">
                            {report.recommendations.length} 条建议
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-neutral-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{formatDate(report.generatedAt)}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetail(report);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-primary-600 bg-primary-50 rounded-lg hover:bg-primary-100 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          查看详情
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownload(report);
                          }}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-neutral-600 bg-neutral-100 rounded-lg hover:bg-neutral-200 transition-colors"
                        >
                          <Download className="w-3.5 h-3.5" />
                          下载
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="detail"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
          >
            <motion.div variants={itemVariants}>
              <button
                onClick={handleBackToList}
                className="flex items-center gap-2 text-neutral-600 hover:text-primary-600 transition-colors mb-4 group"
              >
                <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                <span className="font-medium">返回报告列表</span>
              </button>
            </motion.div>

            {selectedReport && (
              <>
                <motion.div variants={itemVariants} className="bg-gradient-to-r from-primary-600 to-primary-500 rounded-2xl p-6 text-white shadow-lg">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 bg-white/20 text-white text-sm font-medium rounded-full backdrop-blur">
                          {getReportPeriodText(selectedReport.period)}
                        </span>
                        <span className="text-white/80 text-sm">
                          {selectedReport.regionName}
                        </span>
                      </div>
                      <h1 className="text-2xl font-bold mb-2">
                        {getReportTitle(selectedReport)}
                      </h1>
                      <p className="text-white/70 text-sm">
                        统计周期：{selectedReport.periodStart} ~ {selectedReport.periodEnd}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-white/70 text-xs">生成时间</p>
                        <p className="text-white font-medium">{formatDateTime(selectedReport.generatedAt)}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(selectedReport)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 backdrop-blur rounded-xl transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span className="text-sm font-medium">下载报告</span>
                      </button>
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                  <StatCard
                    title="入托率"
                    value={formatPercent(selectedReport.metrics.attendanceRate.value)}
                    icon={<Users className="w-6 h-6" />}
                    variant="primary"
                    change={selectedReport.metrics.attendanceRate.mom}
                    changeLabel="环比"
                    trendData={selectedReport.analysis.attendanceTrend.map((d) => d.rate)}
                  />
                  <StatCard
                    title="健康异常率"
                    value={formatPercent(selectedReport.metrics.healthAbnormalRate.value)}
                    icon={<HeartPulse className="w-6 h-6" />}
                    variant="danger"
                    change={-selectedReport.metrics.healthAbnormalRate.mom}
                    changeLabel="环比"
                  />
                  <StatCard
                    title="师生比"
                    value={formatRatio(selectedReport.metrics.teacherStudentRatio.value)}
                    icon={<UserCheck className="w-6 h-6" />}
                    variant="warning"
                    change={selectedReport.metrics.teacherStudentRatio.mom * 100}
                    changeLabel="环比"
                    suffix=""
                  />
                  <StatCard
                    title="营养达标率"
                    value={formatPercent(selectedReport.metrics.nutritionComplianceRate.value)}
                    icon={<UtensilsCrossed className="w-6 h-6" />}
                    variant="health"
                    change={selectedReport.metrics.nutritionComplianceRate.mom}
                    changeLabel="环比"
                  />
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-4 gap-5">
                  {[
                    {
                      label: '入托率同比',
                      value: selectedReport.metrics.attendanceRate.yoy,
                      isPositive: selectedReport.metrics.attendanceRate.yoy >= 0,
                      unit: '%',
                      bg: 'bg-primary-50',
                      text: 'text-primary-600',
                    },
                    {
                      label: '健康异常率同比',
                      value: -selectedReport.metrics.healthAbnormalRate.yoy,
                      isPositive: selectedReport.metrics.healthAbnormalRate.yoy <= 0,
                      unit: '%',
                      bg: 'bg-danger-50',
                      text: 'text-danger-600',
                    },
                    {
                      label: '师生比同比',
                      value: selectedReport.metrics.teacherStudentRatio.yoy * 100,
                      isPositive: selectedReport.metrics.teacherStudentRatio.yoy >= 0,
                      unit: '%',
                      bg: 'bg-warning-50',
                      text: 'text-warning-600',
                    },
                    {
                      label: '营养达标率同比',
                      value: selectedReport.metrics.nutritionComplianceRate.yoy,
                      isPositive: selectedReport.metrics.nutritionComplianceRate.yoy >= 0,
                      unit: '%',
                      bg: 'bg-health-50',
                      text: 'text-health-600',
                    },
                  ].map((item, index) => (
                    <div
                      key={index}
                      className={cn(
                        'rounded-2xl p-5 border border-neutral-100 bg-white shadow-card',
                      )}
                    >
                      <p className="text-sm text-neutral-500 mb-2">{item.label}</p>
                      <div className="flex items-baseline gap-1.5">
                        <span className={cn('text-2xl font-bold', item.text)}>
                          {item.isPositive ? '+' : ''}{item.value.toFixed(1)}{item.unit}
                        </span>
                        <div className={cn(
                          'flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs font-medium',
                          item.isPositive ? 'bg-health-50 text-health-600' : 'bg-danger-50 text-danger-600'
                        )}>
                          {item.isPositive ? (
                            <TrendingUp className="w-3 h-3" />
                          ) : (
                            <TrendingDown className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                      <p className="text-xs text-neutral-400 mt-1.5">较去年同期</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                  <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-danger-50 flex items-center justify-center">
                        <HeartPulse className="w-5 h-5 text-danger-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-800">健康异常原因分布</h3>
                        <p className="text-xs text-neutral-500">本周期各类健康异常占比</p>
                      </div>
                    </div>
                    <div className="h-72">
                      <ReactECharts
                        option={pieOption}
                        style={{ height: '100%', width: '100%' }}
                        opts={{ renderer: 'canvas' }}
                      />
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                        <Star className="w-5 h-5 text-warning-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-neutral-800">师生比排名 TOP10</h3>
                        <p className="text-xs text-neutral-500">师生比最优的机构</p>
                      </div>
                    </div>
                    <div className="h-72">
                      <ReactECharts
                        option={barOption}
                        style={{ height: '100%', width: '100%' }}
                        opts={{ renderer: 'canvas' }}
                      />
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800">入托率趋势</h3>
                      <p className="text-xs text-neutral-500">本周期每日入托率变化</p>
                    </div>
                  </div>
                  <div className="h-72">
                    <ReactECharts
                      option={lineOption}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'canvas' }}
                    />
                  </div>
                </motion.div>

                <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                      <Lightbulb className="w-5 h-5 text-warning-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-neutral-800">优化建议</h3>
                      <p className="text-xs text-neutral-500">
                        共 {selectedReport.recommendations.length} 条优化建议
                      </p>
                    </div>
                  </div>

                  <div className="space-y-8">
                    {(['high', 'medium', 'low'] as RecommendationPriority[]).map((priority) => {
                      const recs = recommendationsByPriority[priority];
                      if (recs.length === 0) return null;

                      const priorityColors: Record<string, { bg: string; text: string; border: string; dot: string }> = {
                        high: {
                          bg: 'bg-danger-50',
                          text: 'text-danger-600',
                          border: 'border-danger-200',
                          dot: 'bg-danger-500',
                        },
                        medium: {
                          bg: 'bg-warning-50',
                          text: 'text-warning-600',
                          border: 'border-warning-200',
                          dot: 'bg-warning-500',
                        },
                        low: {
                          bg: 'bg-primary-50',
                          text: 'text-primary-600',
                          border: 'border-primary-200',
                          dot: 'bg-primary-500',
                        },
                      };

                      const colors = priorityColors[priority];

                      return (
                        <div key={priority}>
                          <div className="flex items-center gap-2 mb-3">
                            <div className={cn('w-2 h-2 rounded-full', colors.dot)} />
                            <h4 className={cn('text-sm font-semibold', colors.text)}>
                              {getPriorityText(priority)}
                            </h4>
                            <span className="text-xs text-neutral-400">
                              ({recs.length}条)
                            </span>
                          </div>

                          <div className="space-y-3">
                            {recs.map((rec) => (
                              <div
                                key={rec.id}
                                className={cn(
                                  'p-4 rounded-xl border transition-all hover:shadow-md',
                                  colors.bg,
                                  colors.border
                                )}
                              >
                                <div className="flex items-start gap-3">
                                  <div className={cn(
                                    'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                                    `bg-white ${colors.text}`
                                  )}>
                                    {getPriorityIcon(priority)}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1.5">
                                      <span className="px-2 py-0.5 bg-white/80 text-xs font-medium rounded-full text-neutral-600">
                                        {getCategoryText(rec.category)}
                                      </span>
                                    </div>
                                    <p className="text-sm text-neutral-800 font-medium">
                                      {rec.content}
                                    </p>
                                    <p className="text-xs text-neutral-500 mt-2">
                                      <span className="font-medium">预期效果：</span>
                                      {rec.expectedImpact}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </motion.div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
