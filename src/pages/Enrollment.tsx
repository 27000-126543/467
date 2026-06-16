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
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/common/StatCard';
import { useEnrollmentStore, generateForecast } from '@/store/enrollment';
import { mockInstitutions } from '@/mock/data';
import { useAuthStore } from '@/store/auth';
import { formatNumber, formatPercent, getSemesterText } from '@/utils/format';
import { cn } from '@/lib/utils';
import * as XLSX from 'xlsx';
import type { EnrollmentPlan } from '@/types';

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
    initPlans,
    fetchPlans,
    setSearchKeyword,
    setYearFilter,
    setSemesterFilter,
    setPage,
    uploadPlan,
    getFilteredPlans,
    getTotalDegreeGap,
    getAvgEnrollmentRate,
    getTotalPlannedCapacity,
    getTotalActualEnrollment,
    getAggregatedForecast,
  } = useEnrollmentStore();

  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [uploadMessage, setUploadMessage] = useState('');
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

      const plans: EnrollmentPlan[] = jsonData.map((row, index) => {
        const institutionName = row['机构名称'] || row['institutionName'] || `机构${index + 1}`;
        const year = Number(row['年度'] || row['year'] || 2025);
        const semester = (row['学期'] || row['semester'] || 'spring') as 'spring' | 'autumn';
        const plannedCapacity = Number(row['计划学位数'] || row['plannedCapacity'] || 0);
        const actualEnrollment = Math.floor(plannedCapacity * (0.7 + Math.random() * 0.2));
        const enrollmentRate = parseFloat(((actualEnrollment / plannedCapacity) * 100).toFixed(1)) || 0;
        const forecast = generateForecast(plannedCapacity);

        const matchedInstitution = mockInstitutions.find(
          (inst) => inst.name === institutionName
        );

        let institutionId = `inst_${institutionName}`;
        let address: EnrollmentPlan['address'] = undefined;
        let isNewInstitution = false;
        let uploadedByUserId: string | undefined = undefined;
        let uploadedByRegion: EnrollmentPlan['uploadedByRegion'] = undefined;

        if (matchedInstitution) {
          institutionId = matchedInstitution.id;
          address = {
            province: matchedInstitution.address.province,
            city: matchedInstitution.address.city,
            district: matchedInstitution.address.district,
          };
          isNewInstitution = false;
        } else {
          isNewInstitution = true;
          uploadedByUserId = user?.id;
          uploadedByRegion = user?.region
            ? {
                province: user.region.province,
                city: user.region.city,
                district: user.region.district,
              }
            : undefined;
          address = {};
        }

        return {
          id: `plan_${Date.now()}_${index}`,
          institutionId,
          institutionName,
          year,
          semester,
          plannedCapacity,
          actualEnrollment,
          enrollmentRate,
          forecast,
          address,
          isNewInstitution,
          uploadedByUserId,
          uploadedByRegion,
        };
      });

      const result = await uploadPlan(plans);
      if (result.success) {
        setUploadStatus('success');
        setUploadMessage(result.message || '上传成功');
      } else {
        setUploadStatus('error');
        setUploadMessage(result.message || '上传失败');
      }
    } catch {
      setUploadStatus('error');
      setUploadMessage('文件解析失败，请检查文件格式');
    }

    setTimeout(() => {
      setUploadStatus('idle');
      setUploadMessage('');
    }, 3000);
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
    </motion.div>
  );
}
