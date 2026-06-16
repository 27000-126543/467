import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactECharts from 'echarts-for-react';
import {
  Home,
  ChevronRight,
  Building2,
  Users,
  HeartPulse,
  UtensilsCrossed,
  UserCheck,
  TrendingUp,
  TrendingDown,
  MapPin,
  AlertTriangle,
  Clock,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight as ChevronRightIcon,
  Moon,
  Activity,
  BarChart3,
  PieChart,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/common/StatCard';
import { useInstitutionStore } from '@/store/institution';
import {
  formatPercent,
  formatRatio,
  formatNumber,
  getInstitutionLevelText,
  getInstitutionStatusText,
  formatDateTime,
} from '@/utils/format';
import { cn } from '@/lib/utils';

type TabKey = 'attendance' | 'health' | 'diet-sleep' | 'institutions';

const tabs: { key: TabKey; label: string; icon: typeof Home }[] = [
  { key: 'attendance', label: '出勤趋势', icon: TrendingUp },
  { key: 'health', label: '健康分析', icon: HeartPulse },
  { key: 'diet-sleep', label: '饮食睡眠', icon: UtensilsCrossed },
  { key: 'institutions', label: '机构列表', icon: Building2 },
];

export default function CityDetail() {
  const navigate = useNavigate();
  const { cityName = '深圳市' } = useParams<{ cityName: string }>();
  const {
    loading,
    cityMetrics,
    cityInstitutions,
    cityRealtimeData,
    currentPage,
    pageSize,
    sortField,
    sortOrder,
    selectedInstitutionIds,
    fetchCityData,
    setCurrentPage,
    setPageSize,
    setSortField,
    toggleInstitutionSelection,
  } = useInstitutionStore();

  const [activeTab, setActiveTab] = useState<TabKey>('attendance');
  const [dateRange, setDateRange] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    fetchCityData(cityName);
  }, [cityName, fetchCityData]);

  const sortedInstitutions = useMemo(() => {
    const list = [...cityInstitutions];
    list.sort((a, b) => {
      let valA: number | string = '';
      let valB: number | string = '';

      switch (sortField) {
        case 'studentCount':
          valA = a.studentCount;
          valB = b.studentCount;
          break;
        case 'teacherCount':
          valA = a.teacherCount;
          valB = b.teacherCount;
          break;
        case 'capacity':
          valA = a.capacity;
          valB = b.capacity;
          break;
        case 'establishedDate':
          valA = a.establishedDate;
          valB = b.establishedDate;
          break;
        default:
          valA = a.studentCount;
          valB = b.studentCount;
      }

      if (typeof valA === 'number' && typeof valB === 'number') {
        return sortOrder === 'asc' ? valA - valB : valB - valA;
      }
      return sortOrder === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
    return list;
  }, [cityInstitutions, sortField, sortOrder]);

  const paginatedInstitutions = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedInstitutions.slice(start, start + pageSize);
  }, [sortedInstitutions, currentPage, pageSize]);

  const totalPages = Math.ceil(sortedInstitutions.length / pageSize);

  const generateTrendData = (days: number) => {
    const data: { date: string; [key: string]: number | string }[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const item: { date: string; [key: string]: number | string } = { date: dateStr };

      cityRealtimeData.forEach((inst) => {
        const baseRate = inst.attendance.rate;
        const variation = (Math.random() - 0.5) * 6;
        item[inst.institutionId] = parseFloat((baseRate + variation).toFixed(2));
      });

      data.push(item);
    }
    return data;
  };

  const attendanceTrendOption = useMemo(() => {
    const days = dateRange === '7d' ? 7 : 30;
    const data = generateTrendData(days);
    const selectedData = selectedInstitutionIds.length > 0
      ? cityRealtimeData.filter((d) => selectedInstitutionIds.includes(d.institutionId))
      : cityRealtimeData.slice(0, 5);

    const colors = [
      '#1a365d',
      '#38a169',
      '#dd6b20',
      '#e53e3e',
      '#805ad5',
      '#3182ce',
      '#d69e2e',
      '#e53e3e',
    ];

    const series = selectedData.map((inst, index) => ({
      name: inst.institutionName,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      data: data.map((d) => d[inst.institutionId] as number),
      lineStyle: {
        width: 2,
        color: colors[index % colors.length],
      },
      itemStyle: {
        color: colors[index % colors.length],
        borderColor: '#fff',
        borderWidth: 2,
      },
    }));

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
        textStyle: { color: '#fff' },
      },
      legend: {
        data: selectedData.map((d) => d.institutionName),
        top: 0,
        right: 0,
        textStyle: { color: '#718096', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 12 },
      },
      yAxis: {
        type: 'value',
        min: 75,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 12, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(203, 213, 220, 0.3)', type: 'dashed' } },
      },
      series,
    };
  }, [cityRealtimeData, dateRange, selectedInstitutionIds]);

  const healthPieOption = useMemo(() => {
    const totalAbnormal = cityRealtimeData.reduce(
      (sum, d) => sum + d.health.abnormalCount,
      0
    );
    const fever = cityRealtimeData.reduce(
      (sum, d) => sum + d.health.abnormalDetails.fever,
      0
    );
    const cough = cityRealtimeData.reduce(
      (sum, d) => sum + d.health.abnormalDetails.cough,
      0
    );
    const diarrhea = cityRealtimeData.reduce(
      (sum, d) => sum + d.health.abnormalDetails.diarrhea,
      0
    );
    const other = cityRealtimeData.reduce(
      (sum, d) => sum + d.health.abnormalDetails.other,
      0
    );

    return {
      backgroundColor: 'transparent',
      tooltip: {
        trigger: 'item',
        backgroundColor: 'rgba(26, 54, 93, 0.95)',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        textStyle: { color: '#fff' },
        formatter: '{b}: {c}例 ({d}%)',
      },
      legend: {
        orient: 'vertical',
        right: '5%',
        top: 'center',
        textStyle: { color: '#4a5568', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 12,
      },
      series: [
        {
          name: '常见疾病分布',
          type: 'pie',
          radius: ['50%', '75%'],
          center: ['35%', '50%'],
          avoidLabelOverlap: false,
          itemStyle: {
            borderRadius: 8,
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
              color: '#1a365d',
            },
          },
          labelLine: { show: false },
          data: [
            { value: fever, name: '发热', itemStyle: { color: '#e53e3e' } },
            { value: cough, name: '咳嗽', itemStyle: { color: '#dd6b20' } },
            { value: diarrhea, name: '腹泻', itemStyle: { color: '#3182ce' } },
            { value: other, name: '其他', itemStyle: { color: '#718096' } },
          ],
        },
      ],
      graphic: [
        {
          type: 'text',
          left: '35%',
          top: '42%',
          style: {
            text: '异常总例数',
            textAlign: 'center',
            fill: '#718096',
            fontSize: 12,
          },
        },
        {
          type: 'text',
          left: '35%',
          top: '52%',
          style: {
            text: totalAbnormal,
            textAlign: 'center',
            fill: '#1a365d',
            fontSize: 24,
            fontWeight: 'bold',
          },
        },
      ],
    };
  }, [cityRealtimeData]);

  const healthTrendOption = useMemo(() => {
    const days = 7;
    const data: { date: string; rate: number; weekAgo: number }[] = [];
    const today = new Date();

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()}`;
      const avgRate = cityRealtimeData.length > 0
        ? cityRealtimeData.reduce((sum, d) => sum + d.health.abnormalRate, 0) / cityRealtimeData.length
        : 3;
      data.push({
        date: dateStr,
        rate: parseFloat((avgRate + (Math.random() - 0.5) * 2).toFixed(2)),
        weekAgo: parseFloat((avgRate + (Math.random() - 0.5) * 3).toFixed(2)),
      });
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
        textStyle: { color: '#fff' },
      },
      legend: {
        data: ['本周异常率', '上周异常率'],
        top: 0,
        right: 0,
        textStyle: { color: '#718096', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        data: data.map((d) => d.date),
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 12 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 12, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(203, 213, 220, 0.3)', type: 'dashed' } },
      },
      series: [
        {
          name: '本周异常率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: data.map((d) => d.rate),
          lineStyle: { width: 2, color: '#e53e3e' },
          itemStyle: { color: '#e53e3e', borderColor: '#fff', borderWidth: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(229, 62, 62, 0.15)' },
                { offset: 1, color: 'rgba(229, 62, 62, 0.02)' },
              ],
            },
          },
        },
        {
          name: '上周异常率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: data.map((d) => d.weekAgo),
          lineStyle: { width: 2, color: '#a0aec0', type: 'dashed' },
          itemStyle: { color: '#a0aec0', borderColor: '#fff', borderWidth: 2 },
        },
      ],
    };
  }, [cityRealtimeData]);

  const dietBarOption = useMemo(() => {
    const avgBreakfast = cityRealtimeData.length > 0
      ? cityRealtimeData.reduce((sum, d) => sum + d.diet.breakfastRemaining, 0) / cityRealtimeData.length
      : 0;
    const avgLunch = cityRealtimeData.length > 0
      ? cityRealtimeData.reduce((sum, d) => sum + d.diet.lunchRemaining, 0) / cityRealtimeData.length
      : 0;
    const avgDinner = cityRealtimeData.length > 0
      ? cityRealtimeData.reduce((sum, d) => sum + d.diet.dinnerRemaining, 0) / cityRealtimeData.length
      : 0;

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
        textStyle: { color: '#fff' },
        formatter: (params: { name: string; value: number }[]) => {
          return `${params[0].name}剩余率: ${params[0].value.toFixed(2)}%`;
        },
      },
      xAxis: {
        type: 'category',
        data: ['早餐', '午餐', '晚餐'],
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#4a5568', fontSize: 13, fontWeight: 500 },
      },
      yAxis: {
        type: 'value',
        max: 20,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 12, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(203, 213, 220, 0.3)', type: 'dashed' } },
      },
      series: [
        {
          type: 'bar',
          barWidth: '40%',
          data: [
            { value: avgBreakfast, itemStyle: { color: '#3182ce', borderRadius: [8, 8, 0, 0] } },
            { value: avgLunch, itemStyle: { color: '#38a169', borderRadius: [8, 8, 0, 0] } },
            { value: avgDinner, itemStyle: { color: '#dd6b20', borderRadius: [8, 8, 0, 0] } },
          ],
          label: {
            show: true,
            position: 'top',
            color: '#1a365d',
            fontWeight: 600,
            fontSize: 12,
            formatter: '{c}%',
          },
        },
      ],
    };
  }, [cityRealtimeData]);

  const sleepData = useMemo(() => {
    const avgDuration = cityRealtimeData.length > 0
      ? cityRealtimeData.reduce((sum, d) => sum + d.sleep.avgDuration, 0) / cityRealtimeData.length
      : 0;
    const avgCompliance = cityRealtimeData.length > 0
      ? cityRealtimeData.reduce((sum, d) => sum + d.sleep.complianceRate, 0) / cityRealtimeData.length
      : 0;
    return { avgDuration, avgCompliance };
  }, [cityRealtimeData]);

  const nutritionData = useMemo(() => {
    return cityRealtimeData.length > 0
      ? cityRealtimeData.reduce((sum, d) => sum + d.diet.nutritionComplianceRate, 0) / cityRealtimeData.length
      : 0;
  }, [cityRealtimeData]);

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortField(field, sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field, 'desc');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
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

  if (loading && !cityMetrics) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full" />
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
            <span>首页</span>
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary-600 font-medium">{cityName}</span>
        </nav>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary-800">{cityName}</h1>
                <p className="text-sm text-neutral-500 mt-0.5">
                  托育机构运营数据详情
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-500">
            <Clock className="w-4 h-4" />
            <span>数据更新时间：{formatDateTime(new Date())}</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="机构数量"
          value={cityMetrics?.institutionCount || 0}
          unit="家"
          icon={<Building2 className="w-5 h-5" />}
          variant="primary"
          change={3.2}
          changeLabel="较上月"
        />
        <StatCard
          title="在园儿童"
          value={formatNumber(cityMetrics?.totalStudents || 0)}
          unit="人"
          icon={<Users className="w-5 h-5" />}
          variant="health"
          change={2.5}
          changeLabel="较上月"
        />
        <StatCard
          title="平均入托率"
          value={formatPercent(cityMetrics?.attendanceRate || 0)}
          icon={<TrendingUp className="w-5 h-5" />}
          variant="primary"
          change={1.8}
          changeLabel="较上周"
        />
        <StatCard
          title="健康合格率"
          value={formatPercent(100 - (cityMetrics?.healthAbnormalRate || 0))}
          icon={<HeartPulse className="w-5 h-5" />}
          variant="health"
          change={0.5}
          changeLabel="较上周"
        />
        <StatCard
          title="师生比"
          value={formatRatio(cityMetrics?.teacherStudentRatio || 0)}
          icon={<UserCheck className="w-5 h-5" />}
          variant="warning"
          change={-0.3}
          changeLabel="较上月"
        />
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
        <div className="flex border-b border-neutral-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'flex items-center gap-2 px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-px',
                  activeTab === tab.key
                    ? 'text-primary-600 border-primary-600 bg-primary-50/30'
                    : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:bg-neutral-50'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>

        <div className="p-6">
          {activeTab === 'attendance' && (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-neutral-600">时间范围：</span>
                  <div className="flex bg-neutral-100 rounded-lg p-1">
                    {(['7d', '30d'] as const).map((range) => (
                      <button
                        key={range}
                        onClick={() => setDateRange(range)}
                        className={cn(
                          'px-4 py-1.5 text-xs font-medium rounded-md transition-all',
                          dateRange === range
                            ? 'bg-white text-primary-600 shadow-sm'
                            : 'text-neutral-500 hover:text-neutral-700'
                        )}
                      >
                        {range === '7d' ? '近7天' : '近30天'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500">
                    已选择 {selectedInstitutionIds.length} 个机构
                  </span>
                  {selectedInstitutionIds.length > 0 && (
                    <button
                      onClick={() => useInstitutionStore.setState({ selectedInstitutionIds: [] })}
                      className="text-xs text-danger-600 hover:text-danger-700"
                    >
                      清空选择
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-4">
                <p className="text-sm text-neutral-600 mb-3 font-medium">选择机构查看趋势：</p>
                <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                  {cityRealtimeData.slice(0, 10).map((inst) => (
                    <button
                      key={inst.institutionId}
                      onClick={() => toggleInstitutionSelection(inst.institutionId)}
                      className={cn(
                        'px-3 py-1.5 text-xs rounded-full border transition-all',
                        selectedInstitutionIds.includes(inst.institutionId)
                          ? 'bg-primary-500 text-white border-primary-500'
                          : 'bg-white text-neutral-600 border-neutral-200 hover:border-primary-300'
                      )}
                    >
                      {inst.institutionName}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-96">
                <ReactECharts
                  option={attendanceTrendOption}
                  style={{ height: '100%', width: '100%' }}
                  opts={{ renderer: 'canvas' }}
                />
              </div>
            </div>
          )}

          {activeTab === 'health' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <PieChart className="w-5 h-5 text-primary-600" />
                    <h3 className="text-base font-semibold text-neutral-800">常见疾病分布</h3>
                  </div>
                  <div className="h-72">
                    <ReactECharts
                      option={healthPieOption}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'canvas' }}
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-danger-600" />
                      <h3 className="text-base font-semibold text-neutral-800">健康异常率趋势</h3>
                    </div>
                    <span className="text-xs text-neutral-500">近7天</span>
                  </div>
                  <div className="h-72">
                    <ReactECharts
                      option={healthTrendOption}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'canvas' }}
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-danger-50 to-white rounded-xl p-4 border border-danger-100">
                  <p className="text-sm text-neutral-600 mb-2">周同比变化</p>
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-5 h-5 text-health-600" />
                    <span className="text-2xl font-bold text-health-600">-12.5%</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">异常率有所下降</p>
                </div>
                <div className="bg-gradient-to-br from-warning-50 to-white rounded-xl p-4 border border-warning-100">
                  <p className="text-sm text-neutral-600 mb-2">发热病例</p>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-danger-500" />
                    <span className="text-2xl font-bold text-neutral-800">
                      {cityRealtimeData.reduce((sum, d) => sum + d.health.abnormalDetails.fever, 0)}
                    </span>
                    <span className="text-sm text-neutral-500">例</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">需重点关注</p>
                </div>
                <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-4 border border-primary-100">
                  <p className="text-sm text-neutral-600 mb-2">咳嗽病例</p>
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary-500" />
                    <span className="text-2xl font-bold text-neutral-800">
                      {cityRealtimeData.reduce((sum, d) => sum + d.health.abnormalDetails.cough, 0)}
                    </span>
                    <span className="text-sm text-neutral-500">例</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">占比最高</p>
                </div>
                <div className="bg-gradient-to-br from-health-50 to-white rounded-xl p-4 border border-health-100">
                  <p className="text-sm text-neutral-600 mb-2">健康合格率</p>
                  <div className="flex items-center gap-2">
                    <HeartPulse className="w-5 h-5 text-health-500" />
                    <span className="text-2xl font-bold text-health-600">
                      {formatPercent(100 - (cityMetrics?.healthAbnormalRate || 0))}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-2">持续向好</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'diet-sleep' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart3 className="w-5 h-5 text-primary-600" />
                    <h3 className="text-base font-semibold text-neutral-800">餐食剩余率</h3>
                  </div>
                  <div className="h-72">
                    <ReactECharts
                      option={dietBarOption}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'canvas' }}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="bg-gradient-to-br from-health-50 to-white rounded-xl p-5 border border-health-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-health-100 flex items-center justify-center">
                          <UtensilsCrossed className="w-6 h-6 text-health-600" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">营养达标率</p>
                          <p className="text-2xl font-bold text-health-600 mt-1">
                            {formatPercent(nutritionData)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-health-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">+2.3%</span>
                      </div>
                    </div>
                    <div className="mt-4 h-2 bg-health-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-health-400 to-health-600 rounded-full transition-all duration-500"
                        style={{ width: `${nutritionData}%` }}
                      />
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-primary-50 to-white rounded-xl p-5 border border-primary-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
                          <Moon className="w-6 h-6 text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">平均睡眠时长</p>
                          <p className="text-2xl font-bold text-primary-600 mt-1">
                            {sleepData.avgDuration.toFixed(1)}
                            <span className="text-sm font-normal ml-1">小时</span>
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-primary-600">
                        <TrendingUp className="w-4 h-4" />
                        <span className="text-sm font-medium">+0.2h</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-warning-50 to-white rounded-xl p-5 border border-warning-100">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-xl bg-warning-100 flex items-center justify-center">
                          <Moon className="w-6 h-6 text-warning-600" />
                        </div>
                        <div>
                          <p className="text-sm text-neutral-600">睡眠达标率</p>
                          <p className="text-2xl font-bold text-warning-600 mt-1">
                            {formatPercent(sleepData.avgCompliance)}
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-4 h-2 bg-warning-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-warning-400 to-warning-600 rounded-full transition-all duration-500"
                        style={{ width: `${sleepData.avgCompliance}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'institutions' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  共 {sortedInstitutions.length} 家机构
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-neutral-500">每页显示：</span>
                  <select
                    value={pageSize}
                    onChange={(e) => setPageSize(Number(e.target.value))}
                    className="border border-neutral-200 rounded-lg px-3 py-1.5 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400"
                  >
                    {[10, 20, 50].map((size) => (
                      <option key={size} value={size}>{size}条</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto rounded-xl border border-neutral-200">
                <table className="w-full">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        机构名称
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        等级
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                        onClick={() => handleSort('studentCount')}
                      >
                        <div className="flex items-center gap-1">
                          在园儿童
                          <ArrowUpDown className={cn(
                            'w-3 h-3 transition-colors',
                            sortField === 'studentCount' ? 'text-primary-600' : 'text-neutral-400'
                          )} />
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                        onClick={() => handleSort('teacherCount')}
                      >
                        <div className="flex items-center gap-1">
                          教师数
                          <ArrowUpDown className={cn(
                            'w-3 h-3 transition-colors',
                            sortField === 'teacherCount' ? 'text-primary-600' : 'text-neutral-400'
                          )} />
                        </div>
                      </th>
                      <th
                        className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider cursor-pointer hover:bg-neutral-100"
                        onClick={() => handleSort('capacity')}
                      >
                        <div className="flex items-center gap-1">
                          容量
                          <ArrowUpDown className={cn(
                            'w-3 h-3 transition-colors',
                            sortField === 'capacity' ? 'text-primary-600' : 'text-neutral-400'
                          )} />
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        师生比
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        状态
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-neutral-600 uppercase tracking-wider">
                        操作
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {paginatedInstitutions.map((inst) => {
                      const realtime = cityRealtimeData.find(
                        (d) => d.institutionId === inst.id
                      );
                      return (
                        <tr
                          key={inst.id}
                          className={cn(
                            'transition-colors hover:bg-neutral-50',
                            inst.status === 'warning' && 'bg-danger-50/30'
                          )}
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-neutral-400" />
                              <span className="font-medium text-neutral-800">
                                {inst.name}
                              </span>
                              {inst.status === 'warning' && (
                                <span className="px-1.5 py-0.5 bg-danger-100 text-danger-600 text-xs font-medium rounded">
                                  异常
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-neutral-500 mt-1 ml-6">
                              {inst.address.district} · {inst.address.detail.slice(0, 15)}...
                            </p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'px-2 py-1 text-xs font-medium rounded-full',
                              inst.level === 'demo' && 'bg-health-100 text-health-700',
                              inst.level === 'first' && 'bg-primary-100 text-primary-700',
                              inst.level === 'second' && 'bg-warning-100 text-warning-700',
                              inst.level === 'third' && 'bg-neutral-100 text-neutral-600',
                            )}>
                              {getInstitutionLevelText(inst.level)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {inst.studentCount}人
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {inst.teacherCount}人
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {inst.capacity}人
                          </td>
                          <td className="px-4 py-3 text-sm text-neutral-700">
                            {formatRatio(inst.teacherCount / inst.studentCount)}
                          </td>
                          <td className="px-4 py-3">
                            <span className={cn(
                              'inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full',
                              inst.status === 'normal' && 'bg-health-100 text-health-700',
                              inst.status === 'warning' && 'bg-danger-100 text-danger-700',
                              inst.status === 'restricted' && 'bg-warning-100 text-warning-700',
                              inst.status === 'closed' && 'bg-neutral-100 text-neutral-600',
                            )}>
                              <span className={cn(
                                'w-1.5 h-1.5 rounded-full',
                                inst.status === 'normal' && 'bg-health-500',
                                inst.status === 'warning' && 'bg-danger-500 animate-pulse',
                                inst.status === 'restricted' && 'bg-warning-500',
                                inst.status === 'closed' && 'bg-neutral-400',
                              )} />
                              {getInstitutionStatusText(inst.status)}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => navigate(`/institution/${inst.id}`)}
                              className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors"
                            >
                              查看详情
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between pt-4">
                <p className="text-sm text-neutral-500">
                  显示 {(currentPage - 1) * pageSize + 1} - {Math.min(currentPage * pageSize, sortedInstitutions.length)} 条，
                  共 {sortedInstitutions.length} 条
                </p>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      currentPage === 1
                        ? 'text-neutral-300 cursor-not-allowed'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let page: number;
                    if (totalPages <= 5) {
                      page = i + 1;
                    } else if (currentPage <= 3) {
                      page = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      page = totalPages - 4 + i;
                    } else {
                      page = currentPage - 2 + i;
                    }
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={cn(
                          'min-w-9 h-9 px-3 rounded-lg text-sm font-medium transition-colors',
                          currentPage === page
                            ? 'bg-primary-600 text-white'
                            : 'text-neutral-600 hover:bg-neutral-100'
                        )}
                      >
                        {page}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      'p-2 rounded-lg transition-colors',
                      currentPage === totalPages
                        ? 'text-neutral-300 cursor-not-allowed'
                        : 'text-neutral-600 hover:bg-neutral-100'
                    )}
                  >
                    <ChevronRightIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
