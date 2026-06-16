import { useState, useEffect, useMemo, useRef } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  GraduationCap,
  Users,
  TrendingUp,
  AlertTriangle,
  Search,
  ChevronDown,
  Upload,
  FileSpreadsheet,
  X,
  CheckCircle,
  Info,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3,
  MapPin,
  Building2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/common/StatCard';
import { useEnrollmentStore, generateForecast } from '@/store/enrollment';
import { mockInstitutions } from '@/mock/data';
import { useAuthStore } from '@/store/auth';
import { formatNumber, formatPercent, getSemesterText, getInstitutionTypeText } from '@/utils/format';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import type { EnrollmentPlan } from '@/types';
import { Modal, message, Spin } from 'antd';

const yearOptions = [2024, 2025, 2026];
const semesterOptions = [
  { label: '全部学期', value: 'all' },
  { label: '春季学期', value: 'spring' },
  { label: '秋季学期', value: 'autumn' },
];

export default function Enrollment() {
  const { user } = useAuthStore();
  const {
    allPlans,
    loading,
    searchKeyword,
    yearFilter,
    semesterFilter,
    page,
    pageSize,
    previewData,
    initPlans,
    fetchPlans,
    setSearchKeyword,
    setYearFilter,
    setSemesterFilter,
    setPage,
    uploadPlan,
    previewPlan,
    updatePreviewItem,
    setDuplicateStrategy,
    confirmImport,
    clearPreview,
    getFilteredPlans,
    getTotalDegreeGap,
    getAvgEnrollmentRate,
    getTotalPlannedCapacity,
    getTotalActualEnrollment,
    getAggregatedForecast,
    getSummary,
  } = useEnrollmentStore();

  const [viewMode, setViewMode] = useState<'list' | 'summary'>('list');

  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
  const [showPreview, setShowPreview] = useState(false);
  const [importing, setImporting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    initPlans();
  }, [initPlans]);

  const totalPlannedCapacity = useMemo(() => {
    return getTotalPlannedCapacity();
  }, [allPlans, searchKeyword, yearFilter, semesterFilter, getTotalPlannedCapacity]);

  const totalActualEnrollment = useMemo(() => {
    return getTotalActualEnrollment();
  }, [allPlans, searchKeyword, yearFilter, semesterFilter, getTotalActualEnrollment]);

  const avgEnrollmentRate = useMemo(() => {
    return getAvgEnrollmentRate();
  }, [allPlans, searchKeyword, yearFilter, semesterFilter, getAvgEnrollmentRate]);

  const totalDegreeGap = useMemo(() => {
    return getTotalDegreeGap();
  }, [allPlans, searchKeyword, yearFilter, semesterFilter, getTotalDegreeGap]);

  const forecastData = useMemo(() => {
    return getAggregatedForecast();
  }, [allPlans, searchKeyword, yearFilter, semesterFilter, getAggregatedForecast]);

  const filteredPlans = useMemo(() => {
    const filtered = getFilteredPlans();
    const start = (page - 1) * pageSize;
    const end = start + pageSize;
    return filtered.slice(start, end);
  }, [allPlans, searchKeyword, yearFilter, semesterFilter, page, pageSize, getFilteredPlans]);

  const totalPages = useMemo(() => {
    const filtered = getFilteredPlans();
    return Math.ceil(filtered.length / pageSize);
  }, [allPlans, searchKeyword, yearFilter, semesterFilter, pageSize, getFilteredPlans]);

  const totalFilteredCount = useMemo(() => {
    return getFilteredPlans().length;
  }, [allPlans, searchKeyword, yearFilter, semesterFilter, getFilteredPlans]);

  const summaryData = useMemo(() => {
    return getSummary();
  }, [allPlans, searchKeyword, yearFilter, semesterFilter, getSummary]);

  const chartOption = useMemo(() => {
    const dates = forecastData.map((d) => d.date.slice(5));
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
        axisPointer: {
          type: 'cross',
          crossStyle: {
            color: '#999',
          },
        },
      },
      legend: {
        data: ['预测需求', '预测供给', '学位缺口'],
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
          interval: 14,
        },
      },
      yAxis: [
        {
          type: 'value',
          name: '学位数',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 11,
            formatter: (value: number) => {
              if (value >= 10000) return (value / 10000).toFixed(1) + '万';
              return value.toString();
            },
          },
          splitLine: {
            lineStyle: {
              color: 'rgba(203, 213, 220, 0.3)',
              type: 'dashed',
            },
          },
        },
        {
          type: 'value',
          name: '缺口数',
          axisLine: {
            show: false,
          },
          axisTick: {
            show: false,
          },
          axisLabel: {
            color: '#a0aec0',
            fontSize: 11,
            formatter: (value: number) => {
              if (value >= 10000) return (value / 10000).toFixed(1) + '万';
              return value.toString();
            },
          },
          splitLine: {
            show: false,
          },
        },
      ],
      series: [
        {
          name: '预测需求',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: forecastData.map((d) => d.projectedDemand),
          lineStyle: {
            width: 2,
            color: '#1a365d',
          },
          itemStyle: {
            color: '#1a365d',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(26, 54, 93, 0.15)' },
                { offset: 1, color: 'rgba(26, 54, 93, 0.02)' },
              ],
            },
          },
        },
        {
          name: '预测供给',
          type: 'line',
          smooth: true,
          symbol: 'none',
          data: forecastData.map((d) => d.projectedSupply),
          lineStyle: {
            width: 2,
            color: '#38a169',
          },
          itemStyle: {
            color: '#38a169',
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(56, 161, 105, 0.12)' },
                { offset: 1, color: 'rgba(56, 161, 105, 0.02)' },
              ],
            },
          },
        },
        {
          name: '学位缺口',
          type: 'line',
          smooth: true,
          symbol: 'none',
          yAxisIndex: 1,
          data: forecastData.map((d) => d.projectedGap),
          lineStyle: {
            width: 2,
            color: '#e53e3e',
            type: 'dashed',
          },
          itemStyle: {
            color: '#e53e3e',
          },
        },
      ],
    };
  }, [forecastData]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileUpload(files[0]);
    }
  };

  const handleFileUpload = async (file: File) => {
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadStatus('error');
      setUploadMessage('请上传Excel文件（.xlsx/.xls格式）');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);
      return;
    }

    setUploadStatus('uploading');
    setUploadMessage('正在解析文件...');

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, any>>;

      previewPlan(jsonData);
      setShowPreview(true);
      setUploadStatus('idle');
      setUploadMessage('');
    } catch {
      setUploadStatus('error');
      setUploadMessage('文件解析失败，请检查文件格式');
      setTimeout(() => {
        setUploadStatus('idle');
        setUploadMessage('');
      }, 3000);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!previewData) return;
    
    setImporting(true);
    try {
      const result = await confirmImport();
      if (result.success) {
        message.success(result.message || '导入成功');
        setShowPreview(false);
      } else {
        message.error(result.message || '导入失败');
      }
    } catch (error) {
      message.error('导入失败，请重试');
    } finally {
      setImporting(false);
    }
  };

  const handleCancelPreview = () => {
    setShowPreview(false);
    clearPreview();
  };

  const getStatusStyle = (enrollmentRate: number) => {
    if (enrollmentRate >= 85) {
      return { text: '正常', class: 'bg-health-50 text-health-600 border-health-200' };
    } else if (enrollmentRate >= 70) {
      return { text: '预警', class: 'bg-warning-50 text-warning-600 border-warning-200' };
    } else {
      return { text: '预警', class: 'bg-danger-50 text-danger-600 border-danger-200' };
    }
  };

  const getProgressColor = (rate: number) => {
    if (rate >= 85) return 'bg-health-500';
    if (rate >= 70) return 'bg-warning-500';
    return 'bg-danger-500';
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
            <GraduationCap className="w-7 h-7 text-primary-600" />
            招生计划管理
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            管理幼儿园托育招生计划，实时监控学位供需情况
          </p>
        </div>

        <div className="flex items-center gap-2 p-1 bg-neutral-100 rounded-xl">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              viewMode === 'list'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <FileSpreadsheet className="w-4 h-4" />
            列表视图
          </button>
          <button
            onClick={() => setViewMode('summary')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all',
              viewMode === 'summary'
                ? 'bg-white text-primary-600 shadow-sm'
                : 'text-neutral-500 hover:text-neutral-700'
            )}
          >
            <BarChart3 className="w-4 h-4" />
            汇总视图
          </button>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="计划学位总数"
          value={formatNumber(totalPlannedCapacity)}
          icon={<GraduationCap className="w-6 h-6" />}
          variant="primary"
          suffix="个"
          trendData={[80, 85, 82, 88, 90, 92, 95]}
        />
        <StatCard
          title="实际入托数"
          value={formatNumber(totalActualEnrollment)}
          icon={<Users className="w-6 h-6" />}
          variant="health"
          suffix="人"
          trendData={[70, 72, 75, 78, 80, 82, 85]}
        />
        <StatCard
          title="平均入托率"
          value={formatPercent(avgEnrollmentRate)}
          icon={<TrendingUp className="w-6 h-6" />}
          variant="warning"
          trendData={[85, 86, 84, 87, 88, 87, 89]}
        />
        <StatCard
          title="预测学位缺口（90天）"
          value={formatNumber(totalDegreeGap)}
          icon={<AlertTriangle className="w-6 h-6" />}
          variant="danger"
          suffix="个"
          trendData={[50, 55, 52, 58, 60, 62, 65]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">90天学位供需预测趋势</h3>
              <p className="text-xs text-neutral-500">预测未来90天的学位需求、供给及缺口变化</p>
            </div>
          </div>
        </div>
        <div className="h-80">
          <ReactECharts
            option={chartOption}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </motion.div>

      {viewMode === 'list' && (
        <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-1">
          <div
            className={cn(
              'bg-white rounded-2xl shadow-card border-2 border-dashed p-6 transition-all duration-300',
              isDragging
                ? 'border-primary-400 bg-primary-50/50'
                : 'border-neutral-200 hover:border-primary-300'
            )}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className={cn(
                'w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-colors',
                isDragging ? 'bg-primary-100' : 'bg-neutral-100'
              )}>
                {uploadStatus === 'success' ? (
                  <CheckCircle className="w-8 h-8 text-health-500" />
                ) : uploadStatus === 'error' ? (
                  <X className="w-8 h-8 text-danger-500" />
                ) : uploadStatus === 'uploading' ? (
                  <FileSpreadsheet className="w-8 h-8 text-primary-500 animate-pulse" />
                ) : (
                  <Upload className={cn('w-8 h-8', isDragging ? 'text-primary-500' : 'text-neutral-400')} />
                )}
              </div>
              <h4 className="text-base font-semibold text-neutral-800 mb-1">
                年度招生计划上传
              </h4>
              <p className="text-xs text-neutral-500 mb-4">
                {uploadMessage || '拖拽Excel文件到此处，或点击上传'}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadStatus === 'uploading'}
                className={cn(
                  'px-5 py-2 rounded-xl text-sm font-medium transition-all',
                  uploadStatus === 'uploading'
                    ? 'bg-neutral-200 text-neutral-500 cursor-not-allowed'
                    : 'bg-primary-500 text-white hover:bg-primary-600 active:scale-95'
                )}
              >
                {uploadStatus === 'uploading' ? '上传中...' : '选择文件'}
              </button>
              <div className="mt-4 flex items-center gap-1 text-xs text-neutral-400">
                <Info className="w-3.5 h-3.5" />
                <span>支持 .xlsx / .xls 格式</span>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  type="text"
                  placeholder="搜索机构名称..."
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-neutral-50 border border-neutral-200 rounded-xl text-sm text-neutral-700 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                />
              </div>

              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={yearFilter || 'all'}
                    onChange={(e) => setYearFilter(e.target.value === 'all' ? null : Number(e.target.value))}
                    className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
                  >
                    <option value="all">全部年度</option>
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}年
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={semesterFilter || 'all'}
                    onChange={(e) => setSemesterFilter(e.target.value === 'all' ? null : e.target.value)}
                    className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
                  >
                    {semesterOptions.map((sem) => (
                      <option key={sem.value} value={sem.value}>
                        {sem.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-neutral-100">
                    <th className="text-left py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      机构名称
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      年度学期
                    </th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      计划学位
                    </th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      实际入托
                    </th>
                    <th className="text-left py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      入托率
                    </th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      缺口预测
                    </th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      状态
                    </th>
                    <th className="text-center py-3 px-3 text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-50">
                  {filteredPlans.map((plan, index) => {
                    const status = getStatusStyle(plan.enrollmentRate);
                    const latestGap = plan.forecast[plan.forecast.length - 1]?.projectedGap || 0;
                    return (
                      <motion.tr
                        key={plan.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="hover:bg-neutral-50 transition-colors"
                      >
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center flex-shrink-0">
                              <GraduationCap className="w-4 h-4 text-primary-500" />
                            </div>
                            <span className="text-sm font-medium text-neutral-800 truncate max-w-[180px]">
                              {plan.institutionName}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <span className="text-sm text-neutral-600">
                            {plan.year}年{getSemesterText(plan.semester)}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="text-sm font-medium text-neutral-700">
                            {formatNumber(plan.plannedCapacity)}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className="text-sm font-medium text-neutral-700">
                            {formatNumber(plan.actualEnrollment)}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-neutral-100 rounded-full overflow-hidden max-w-[100px]">
                              <div
                                className={cn('h-full rounded-full transition-all duration-500', getProgressColor(plan.enrollmentRate))}
                                style={{ width: `${Math.min(plan.enrollmentRate, 100)}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold text-neutral-600 w-14 text-right">
                              {formatPercent(plan.enrollmentRate)}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className={cn(
                            'text-sm font-semibold',
                            latestGap > 0 ? 'text-danger-500' : 'text-health-500'
                          )}>
                            {latestGap > 0 ? `+${formatNumber(latestGap)}` : formatNumber(latestGap)}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <span className={cn(
                            'px-2.5 py-1 text-xs font-medium rounded-full border',
                            status.class
                          )}>
                            {status.text}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-center">
                          <button className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {filteredPlans.length === 0 && !loading && (
              <div className="py-12 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-neutral-100 flex items-center justify-center">
                  <Search className="w-8 h-8 text-neutral-300" />
                </div>
                <p className="text-sm text-neutral-400">暂无匹配的招生计划数据</p>
              </div>
            )}

            {totalPages > 0 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-neutral-100">
                <div className="text-sm text-neutral-500">
                  共 <span className="font-medium text-neutral-700">{totalFilteredCount}</span> 条记录，
                  第 <span className="font-medium text-neutral-700">{page}</span> / {totalPages} 页
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page <= 1}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      page <= 1
                        ? 'text-neutral-300 cursor-not-allowed'
                        : 'text-neutral-500 hover:bg-neutral-100'
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
                        onClick={() => setPage(pageNum)}
                        className={cn(
                          'w-8 h-8 rounded-lg text-sm font-medium transition-colors',
                          page === pageNum
                            ? 'bg-primary-500 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        )}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page >= totalPages}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      page >= totalPages
                        ? 'text-neutral-300 cursor-not-allowed'
                        : 'text-neutral-500 hover:bg-neutral-100'
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
        </motion.div>
      )}

      {viewMode === 'summary' && (
        <motion.div variants={itemVariants} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white rounded-2xl shadow-card p-5 border border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">机构总数</span>
                <Building2 className="w-5 h-5 text-primary-400" />
              </div>
              <div className="text-2xl font-bold text-neutral-800">
                {formatNumber(summaryData.totalInstitutions)}
              </div>
              <div className="text-xs text-neutral-400 mt-1">个机构</div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-5 border border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">计划学位</span>
                <GraduationCap className="w-5 h-5 text-primary-400" />
              </div>
              <div className="text-2xl font-bold text-primary-600">
                {formatNumber(summaryData.totalPlannedCapacity)}
              </div>
              <div className="text-xs text-neutral-400 mt-1">个学位</div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-5 border border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">实际入托</span>
                <Users className="w-5 h-5 text-health-400" />
              </div>
              <div className="text-2xl font-bold text-health-600">
                {formatNumber(summaryData.totalActualEnrollment)}
              </div>
              <div className="text-xs text-neutral-400 mt-1">人</div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-5 border border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">平均入托率</span>
                <TrendingUp className="w-5 h-5 text-warning-400" />
              </div>
              <div className="text-2xl font-bold text-warning-600">
                {formatPercent(summaryData.avgEnrollmentRate)}
              </div>
              <div className="text-xs text-neutral-400 mt-1">%占比</div>
            </div>
            <div className="bg-white rounded-2xl shadow-card p-5 border border-neutral-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-neutral-500">90天缺口</span>
                <AlertTriangle className="w-5 h-5 text-danger-400" />
              </div>
              <div className="text-2xl font-bold text-danger-600">
                {formatNumber(summaryData.totalGap90Days)}
              </div>
              <div className="text-xs text-neutral-400 mt-1">个学位</div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800">
                    {user?.role === 'national' ? '按省份汇总' :
                     user?.role === 'provincial' ? '按城市汇总' : '按区县汇总'}
                  </h3>
                  <p className="text-xs text-neutral-500">各区域招生计划统计</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {summaryData.byRegion.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-neutral-400">暂无汇总数据</p>
                  </div>
                ) : (
                  summaryData.byRegion.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-primary-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-primary-600">{idx + 1}</span>
                          </div>
                          <span className="font-medium text-neutral-800">{item.region}</span>
                          <span className="text-xs text-neutral-400">({item.institutionCount}个机构)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">计划学位</p>
                          <p className="text-sm font-semibold text-primary-600">{formatNumber(item.plannedCapacity)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">实际入托</p>
                          <p className="text-sm font-semibold text-health-600">{formatNumber(item.actualEnrollment)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">90天缺口</p>
                          <p className="text-sm font-semibold text-danger-600">{formatNumber(item.gap90Days)}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                          <span>入托率</span>
                          <span className="font-medium text-neutral-700">{formatPercent(item.enrollmentRate)}</span>
                        </div>
                        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              item.enrollmentRate >= 85 ? 'bg-health-500' :
                              item.enrollmentRate >= 70 ? 'bg-warning-500' : 'bg-danger-500'
                            )}
                            style={{ width: `${item.enrollmentRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-neutral-800">按机构类型汇总</h3>
                  <p className="text-xs text-neutral-500">不同类型机构招生统计</p>
                </div>
              </div>

              <div className="space-y-3 max-h-[400px] overflow-y-auto">
                {summaryData.byType.length === 0 ? (
                  <div className="py-12 text-center">
                    <p className="text-sm text-neutral-400">暂无汇总数据</p>
                  </div>
                ) : (
                  summaryData.byType.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-4 bg-neutral-50 rounded-xl hover:bg-neutral-100 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-lg bg-warning-100 flex items-center justify-center">
                            <span className="text-sm font-bold text-warning-600">{idx + 1}</span>
                          </div>
                          <span className="font-medium text-neutral-800">
                            {getInstitutionTypeText(item.type)}
                          </span>
                          <span className="text-xs text-neutral-400">({item.institutionCount}个机构)</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">计划学位</p>
                          <p className="text-sm font-semibold text-primary-600">{formatNumber(item.plannedCapacity)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">实际入托</p>
                          <p className="text-sm font-semibold text-health-600">{formatNumber(item.actualEnrollment)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-neutral-500 mb-1">90天缺口</p>
                          <p className="text-sm font-semibold text-danger-600">{formatNumber(item.gap90Days)}</p>
                        </div>
                      </div>
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-neutral-500 mb-1">
                          <span>入托率</span>
                          <span className="font-medium text-neutral-700">{formatPercent(item.enrollmentRate)}</span>
                        </div>
                        <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all',
                              item.enrollmentRate >= 85 ? 'bg-health-500' :
                              item.enrollmentRate >= 70 ? 'bg-warning-500' : 'bg-danger-500'
                            )}
                            style={{ width: `${item.enrollmentRate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <Modal
        title="导入预览"
        open={showPreview}
        onCancel={handleCancelPreview}
        footer={null}
        width={900}
        destroyOnClose
      >
        {previewData && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-health-500" />
                <span className="text-sm text-neutral-700">
                  正常数据：<span className="font-semibold text-health-600">{previewData.validCount}</span> 条
                </span>
              </div>
              {previewData.invalidCount > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-danger-500" />
                  <span className="text-sm text-neutral-700">
                    异常数据：<span className="font-semibold text-danger-600">{previewData.invalidCount}</span> 条
                  </span>
                </div>
              )}
              {previewData.warningCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning-500" />
                  <span className="text-sm text-neutral-700">
                    警告提示：<span className="font-semibold text-warning-600">{previewData.warningCount}</span> 条
                  </span>
                </div>
              )}
            </div>

            <div className="border border-neutral-200 rounded-xl overflow-hidden">
              <div className="max-h-[450px] overflow-y-auto">
                <table className="w-full">
                  <thead className="bg-neutral-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-14">
                        序号
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider">
                        机构名称
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                        年度
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                        学期
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-24">
                        计划学位
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-28">
                        匹配机构
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-32">
                        重复处理
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-medium text-neutral-500 uppercase tracking-wider w-20">
                        状态
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {previewData.items.map((item) => (
                      <tr
                        key={item.index}
                        className={cn(
                          'hover:bg-neutral-50 transition-colors',
                          item.errors.length > 0 ? 'bg-danger-50/30' : ''
                        )}
                      >
                        <td className="px-3 py-3 text-sm text-neutral-500">
                          {item.index}
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="text"
                            value={item.institutionName}
                            onChange={(e) => updatePreviewItem(item.index, { institutionName: e.target.value })}
                            placeholder="请输入机构名称"
                            className={cn(
                              'w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all',
                              item.errors.some(err => err.includes('机构名称'))
                                ? 'border-danger-300 bg-danger-50'
                                : 'border-neutral-200 bg-white'
                            )}
                          />
                          {(item.errors.length > 0 || item.warnings.length > 0) && (
                            <div className="mt-1 space-y-0.5">
                              {item.errors.map((err, idx) => (
                                <div key={`e-${idx}`} className="flex items-center gap-1 text-xs text-danger-600">
                                  <AlertCircle className="w-3 h-3 flex-shrink-0" />
                                  {err}
                                </div>
                              ))}
                              {item.warnings.map((warn, idx) => (
                                <div key={`w-${idx}`} className="flex items-center gap-1 text-xs text-warning-600">
                                  <AlertTriangle className="w-3 h-3 flex-shrink-0" />
                                  {warn}
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={item.year || ''}
                            onChange={(e) => updatePreviewItem(item.index, { year: parseInt(e.target.value) || 0 })}
                            placeholder="年度"
                            className={cn(
                              'w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all',
                              item.errors.some(err => err.includes('年度'))
                                ? 'border-danger-300 bg-danger-50'
                                : 'border-neutral-200 bg-white'
                            )}
                          />
                        </td>
                        <td className="px-3 py-3">
                          <select
                            value={item.semester}
                            onChange={(e) => updatePreviewItem(item.index, { semester: e.target.value as 'spring' | 'autumn' })}
                            className="w-full px-2 py-1.5 text-sm border border-neutral-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all"
                          >
                            <option value="spring">春季</option>
                            <option value="autumn">秋季</option>
                          </select>
                        </td>
                        <td className="px-3 py-3">
                          <input
                            type="number"
                            value={item.plannedCapacity ?? ''}
                            onChange={(e) => {
                              const val = e.target.value;
                              updatePreviewItem(item.index, { 
                                plannedCapacity: val === '' ? null : parseFloat(val) 
                              });
                            }}
                            placeholder="学位数"
                            className={cn(
                              'w-full px-2 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all',
                              item.errors.some(err => err.includes('计划学位'))
                                ? 'border-danger-300 bg-danger-50'
                                : 'border-neutral-200 bg-white'
                            )}
                          />
                        </td>
                        <td className="px-3 py-3">
                          {item.matchedInstitution ? (
                            <div>
                              <div className="text-sm font-medium text-neutral-800 truncate">
                                {item.matchedInstitution.name}
                              </div>
                              <div className="text-xs text-neutral-500">
                                {getInstitutionTypeText(item.matchedInstitution.type)}
                              </div>
                            </div>
                          ) : item.isNewInstitution ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning-50 text-warning-700 text-xs font-medium rounded-full">
                              <Info className="w-3 h-3" />
                              新机构
                            </span>
                          ) : (
                            <span className="text-neutral-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {item.isDuplicate ? (
                            <select
                              value={item.duplicateStrategy || 'skip'}
                              onChange={(e) => setDuplicateStrategy(item.index, e.target.value as any)}
                              className="w-full px-2 py-1.5 text-sm border border-warning-300 rounded-lg bg-warning-50 text-warning-700 focus:outline-none focus:ring-2 focus:ring-warning-200 focus:border-warning-400 transition-all"
                            >
                              <option value="skip">跳过</option>
                              <option value="overwrite">覆盖</option>
                              <option value="new_semester">作为新学期</option>
                            </select>
                          ) : (
                            <span className="text-neutral-400 text-sm">-</span>
                          )}
                        </td>
                        <td className="px-3 py-3">
                          {item.errors.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-danger-50 text-danger-700 text-xs font-medium rounded-full">
                              <XCircle className="w-3 h-3" />
                              异常
                            </span>
                          ) : item.warnings.length > 0 ? (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-warning-50 text-warning-700 text-xs font-medium rounded-full">
                              <AlertTriangle className="w-3 h-3" />
                              警告
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-1 bg-health-50 text-health-700 text-xs font-medium rounded-full">
                              <CheckCircle2 className="w-3 h-3" />
                              正常
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-neutral-500">
                {previewData.hasErrors
                  ? '异常数据将被跳过，仅导入正常数据'
                  : '所有数据均可正常导入'}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={handleCancelPreview}
                  className="px-5 py-2.5 text-sm font-medium text-neutral-600 bg-neutral-100 rounded-xl hover:bg-neutral-200 transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={importing || previewData.validCount === 0}
                  className={cn(
                    'flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white rounded-xl transition-all',
                    importing || previewData.validCount === 0
                      ? 'bg-neutral-300 cursor-not-allowed'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 hover:from-primary-600 hover:to-primary-700 shadow-sm hover:shadow-md'
                  )}
                >
                  {importing ? (
                    <>
                      <Spin size="small" />
                      导入中...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      确认导入（{previewData.validCount}条）
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </motion.div>
  );
}
