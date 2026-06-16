import { useState, useEffect, useMemo } from 'react';
import ReactECharts from 'echarts-for-react';
import {
  Users,
  HeartPulse,
  UtensilsCrossed,
  UserCheck,
  MapPin,
  Building2,
  ChevronDown,
  AlertTriangle,
  FileText,
  Trophy,
  TrendingUp,
  Clock,
  MoreHorizontal,
  BarChart3,
  Activity,
} from 'lucide-react';
import { motion } from 'framer-motion';
import StatCard from '@/components/common/StatCard';
import { useDashboardStore } from '@/store/dashboard';
import {
  formatPercent,
  formatRatio,
  formatDateTime,
  getAlertLevelText,
  getAlertTypeText,
  getAlertStatusText,
} from '@/utils/format';
import { cn } from '@/lib/utils';
import { regionOptions } from '@/mock/data';

const ageGroups = [
  { label: '全部年龄段', value: 'all' },
  { label: '0-1岁', value: '0-1' },
  { label: '1-2岁', value: '1-2' },
  { label: '2-3岁', value: '2-3' },
  { label: '3-4岁', value: '3-4' },
  { label: '4-5岁', value: '4-5' },
  { label: '5-6岁', value: '5-6' },
];

const institutionLevels = [
  { label: '全部等级', value: 'all' },
  { label: '示范园', value: 'demo' },
  { label: '一级园', value: 'first' },
  { label: '二级园', value: 'second' },
  { label: '三级园', value: 'third' },
];

export default function Dashboard() {
  const {
    nationalMetrics,
    provinceMetrics,
    recentAlerts,
    recentReports,
    fetchNationalMetrics,
    fetchProvinceMetrics,
    fetchHeatmapData,
    fetchRecentAlerts,
    fetchRecentReports,
  } = useDashboardStore();

  const [selectedProvince, setSelectedProvince] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedAgeGroup, setSelectedAgeGroup] = useState<string>('all');
  const [activeIndicator, setActiveIndicator] = useState<'attendance' | 'health'>('attendance');

  useEffect(() => {
    fetchNationalMetrics();
    fetchProvinceMetrics();
    fetchHeatmapData('attendance');
    fetchRecentAlerts();
    fetchRecentReports();
  }, [fetchNationalMetrics, fetchProvinceMetrics, fetchHeatmapData, fetchRecentAlerts, fetchRecentReports]);

  const sortedProvinceMetrics = useMemo(() => {
    return [...provinceMetrics].sort((a, b) => {
      if (activeIndicator === 'attendance') {
        return b.attendanceRate - a.attendanceRate;
      }
      return b.healthAbnormalRate - a.healthAbnormalRate;
    });
  }, [provinceMetrics, activeIndicator]);

  const healthRanking = useMemo(() => {
    return [...provinceMetrics]
      .sort((a, b) => a.healthAbnormalRate - b.healthAbnormalRate)
      .slice(0, 10);
  }, [provinceMetrics]);

  const teacherRatioRanking = useMemo(() => {
    return [...provinceMetrics]
      .sort((a, b) => b.teacherStudentRatio - a.teacherStudentRatio)
      .slice(0, 10);
  }, [provinceMetrics]);

  const heatmapOption = useMemo(() => {
    const data = sortedProvinceMetrics.map((item) => ({
      name: item.regionName,
      value: activeIndicator === 'attendance'
        ? item.attendanceRate
        : item.healthAbnormalRate,
    }));

    const maxValue = Math.max(...data.map((d) => d.value));
    const minValue = Math.min(...data.map((d) => d.value));

    return {
      backgroundColor: 'transparent',
      grid: {
        left: '3%',
        right: '8%',
        top: '10%',
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
          const metric = activeIndicator === 'attendance' ? '入托率' : '健康异常率';
          const valueColor = activeIndicator === 'attendance' ? '#68d391' : '#fc8181';
          return `
            <div style="font-weight: 600; margin-bottom: 4px;">${item.name}</div>
            <div style="display: flex; justify-content: space-between; gap: 20px;">
              <span>${metric}：</span>
              <span style="font-weight: 600; color: ${valueColor}">
                ${item.value.toFixed(2)}%
              </span>
            </div>
          `;
        },
      },
      visualMap: {
        show: true,
        orient: 'vertical',
        right: '2%',
        top: 'center',
        min: minValue,
        max: maxValue,
        text: ['高', '低'],
        textStyle: {
          color: '#718096',
          fontSize: 12,
        },
        inRange: {
          color:
            activeIndicator === 'attendance'
              ? ['#e0ebff', '#7aa8ff', '#3b76f5', '#1a365d', '#0f1f38']
              : ['#c6f6d5', '#68d391', '#38a169', '#276749', '#1c4532'],
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
          fontSize: 12,
          formatter: '{value}%',
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
        data: data.map((d) => d.name),
        inverse: true,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#4a5568',
          fontSize: 12,
          fontWeight: 500,
        },
      },
      series: [
        {
          type: 'bar',
          data: data.map((d) => d.value),
          barWidth: '60%',
          itemStyle: {
            borderRadius: [0, 4, 4, 0],
          },
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
  }, [sortedProvinceMetrics, activeIndicator]);

  const trendOption = useMemo(() => {
    const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
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
      },
      legend: {
        data: ['入托率', '健康合格率'],
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
        data: days,
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
          fontSize: 12,
        },
      },
      yAxis: {
        type: 'value',
        max: 100,
        axisLine: {
          show: false,
        },
        axisTick: {
          show: false,
        },
        axisLabel: {
          color: '#a0aec0',
          fontSize: 12,
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
          symbolSize: 6,
          data: [92.5, 93.2, 91.8, 94.1, 93.5, 89.2, 88.6],
          lineStyle: {
            width: 2,
            color: '#1a365d',
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
        },
        {
          name: '健康合格率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 6,
          data: [96.2, 95.8, 97.1, 96.5, 95.9, 97.3, 96.8],
          lineStyle: {
            width: 2,
            color: '#38a169',
          },
          itemStyle: {
            color: '#38a169',
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
                { offset: 0, color: 'rgba(56, 161, 105, 0.15)' },
                { offset: 1, color: 'rgba(56, 161, 105, 0.02)' },
              ],
            },
          },
        },
      ],
    };
  }, []);

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

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-400 text-yellow-900';
    if (rank === 2) return 'bg-gray-300 text-gray-700';
    if (rank === 3) return 'bg-amber-600 text-white';
    return 'bg-neutral-100 text-neutral-600';
  };

  const getAlertLevelStyle = (level: number) => {
    if (level === 1) return 'bg-danger-50 text-danger-600 border-danger-200';
    if (level === 2) return 'bg-warning-50 text-warning-600 border-warning-200';
    return 'bg-primary-50 text-primary-600 border-primary-200';
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
            <BarChart3 className="w-7 h-7 text-primary-600" />
            全国总览看板
          </h1>
          <p className="text-sm text-neutral-500 mt-1">
            实时监控全国托育机构运营数据，助力科学决策
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
            >
              <option value="all">全部省份</option>
              {regionOptions.map((prov) => (
                <option key={prov.code} value={prov.code}>
                  {prov.name}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedLevel}
              onChange={(e) => setSelectedLevel(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
            >
              {institutionLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>

          <div className="relative">
            <select
              value={selectedAgeGroup}
              onChange={(e) => setSelectedAgeGroup(e.target.value)}
              className="appearance-none bg-white border border-neutral-200 rounded-xl px-4 py-2.5 pr-10 text-sm text-neutral-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 transition-all cursor-pointer"
            >
              {ageGroups.map((age) => (
                <option key={age.value} value={age.value}>
                  {age.label}
                </option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="全国入托率"
          value={nationalMetrics ? formatPercent(nationalMetrics.attendanceRate) : '--'}
          icon={<Users className="w-6 h-6" />}
          variant="primary"
          change={2.3}
          changeLabel="较上周"
          trendData={[88, 90, 89, 92, 91, 93, 94]}
        />
        <StatCard
          title="健康异常率"
          value={nationalMetrics ? formatPercent(nationalMetrics.healthAbnormalRate) : '--'}
          icon={<HeartPulse className="w-6 h-6" />}
          variant="danger"
          change={-0.8}
          changeLabel="较上周"
          trendData={[5.2, 4.8, 5.1, 4.5, 4.2, 4.0, 3.8]}
        />
        <StatCard
          title="营养达标率"
          value={nationalMetrics ? formatPercent(nationalMetrics.nutritionComplianceRate) : '--'}
          icon={<UtensilsCrossed className="w-6 h-6" />}
          variant="health"
          change={1.5}
          changeLabel="较上周"
          trendData={[88, 89, 90, 91, 90, 92, 93]}
        />
        <StatCard
          title="师生比"
          value={nationalMetrics ? formatRatio(nationalMetrics.teacherStudentRatio) : '--'}
          icon={<UserCheck className="w-6 h-6" />}
          variant="warning"
          change={0.5}
          changeLabel="较上周"
          trendData={[0.12, 0.122, 0.125, 0.123, 0.126, 0.128, 0.13]}
        />
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-3 bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">各省份数据分布</h3>
                <p className="text-xs text-neutral-500">按{activeIndicator === 'attendance' ? '入托率' : '健康异常率'}排序</p>
              </div>
            </div>
            <div className="flex bg-neutral-100 rounded-lg p-1">
              <button
                onClick={() => setActiveIndicator('attendance')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  activeIndicator === 'attendance'
                    ? 'bg-white text-primary-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                入托率
              </button>
              <button
                onClick={() => setActiveIndicator('health')}
                className={cn(
                  'px-3 py-1.5 text-xs font-medium rounded-md transition-all',
                  activeIndicator === 'health'
                    ? 'bg-white text-health-600 shadow-sm'
                    : 'text-neutral-500 hover:text-neutral-700'
                )}
              >
                健康异常率
              </button>
            </div>
          </div>
          <div className="h-96">
            <ReactECharts
              option={heatmapOption}
              style={{ height: '100%', width: '100%' }}
              opts={{ renderer: 'canvas' }}
            />
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                <Trophy className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">省份排名榜单</h3>
                <p className="text-xs text-neutral-500">
                  {activeIndicator === 'attendance' ? '入托率TOP10' : '健康异常率TOP10'}
                </p>
              </div>
            </div>
            <button className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors">
              查看全部
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-2">
            {sortedProvinceMetrics.slice(0, 10).map((province, index) => (
              <motion.div
                key={province.regionCode}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-neutral-50 transition-colors group"
              >
                <div
                  className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                    getRankBadgeColor(index + 1)
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-neutral-800 truncate">
                    {province.regionName}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          'h-full rounded-full transition-all duration-500',
                          activeIndicator === 'attendance' ? 'bg-primary-500' : 'bg-health-500'
                        )}
                        style={{
                          width: `${((activeIndicator === 'attendance'
                            ? province.attendanceRate
                            : province.healthAbnormalRate) / 100) * 100}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs font-semibold text-neutral-600 flex-shrink-0">
                      {activeIndicator === 'attendance'
                        ? formatPercent(province.attendanceRate)
                        : formatPercent(province.healthAbnormalRate)}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <Building2 className="w-3.5 h-3.5 text-neutral-400" />
                  <span className="text-xs text-neutral-500">
                    {province.institutionCount}家
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-danger-50 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">近期待办预警</h3>
                <p className="text-xs text-neutral-500">需及时处理的预警事项</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 bg-danger-50 text-danger-600 text-xs font-medium rounded-full">
                {recentAlerts.filter((a) => a.status === 'pending' || a.status === 'processing').length} 条待处理
              </span>
              <button className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors">
                更多
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {recentAlerts.slice(0, 4).map((alert, index) => (
              <motion.div
                key={alert.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className={cn(
                  'p-4 rounded-xl border transition-all hover:shadow-md cursor-pointer',
                  alert.status === 'pending'
                    ? 'bg-danger-50/50 border-danger-200'
                    : alert.status === 'processing'
                    ? 'bg-warning-50/50 border-warning-200'
                    : 'bg-neutral-50 border-neutral-200'
                )}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          'px-2 py-0.5 text-xs font-medium rounded-full border',
                          getAlertLevelStyle(alert.level)
                        )}
                      >
                        {getAlertLevelText(alert.level)}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {getAlertTypeText(alert.type)}
                      </span>
                    </div>
                    <p className="text-sm font-medium text-neutral-800 truncate">
                      {alert.institutionName}
                    </p>
                    <p className="text-xs text-neutral-500 mt-1 line-clamp-1">
                      {alert.description}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="text-xs text-neutral-500">
                          {formatDateTime(alert.triggeredAt)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-neutral-500">连续{alert.consecutiveDays}天</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <span
                      className={cn(
                        'px-2.5 py-1 text-xs font-medium rounded-full',
                        alert.status === 'pending'
                          ? 'bg-danger-100 text-danger-700'
                          : alert.status === 'processing'
                          ? 'bg-warning-100 text-warning-700'
                          : 'bg-neutral-200 text-neutral-600'
                      )}
                    >
                      {getAlertStatusText(alert.status)}
                    </span>
                    <MoreHorizontal className="w-4 h-4 text-neutral-400 cursor-pointer hover:text-neutral-600" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">最新报告</h3>
                <p className="text-xs text-neutral-500">运营分析与建议报告</p>
              </div>
            </div>
            <button className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors">
              全部报告
            </button>
          </div>

          <div className="space-y-3">
            {recentReports.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.08 }}
                className="p-4 rounded-xl border border-neutral-200 hover:border-primary-200 hover:bg-primary-50/30 transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                        {report.period === 'week' ? '周报' : '月报'}
                      </span>
                      <span className="text-xs text-neutral-500">
                        {report.periodStart} ~ {report.periodEnd}
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-neutral-800 group-hover:text-primary-700 transition-colors">
                      {report.regionName}运营分析报告
                    </h4>
                    <p className="text-xs text-neutral-500 mt-1.5">
                      包含 {report.recommendations.length} 条优化建议
                    </p>
                    <div className="flex items-center gap-4 mt-3">
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5 text-health-500" />
                        <span className="text-xs text-neutral-600">
                          入托率 {formatPercent(report.metrics.attendanceRate.value)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <HeartPulse className="w-3.5 h-3.5 text-danger-500" />
                        <span className="text-xs text-neutral-600">
                          异常率 {formatPercent(report.metrics.healthAbnormalRate.value)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                      <FileText className="w-4 h-4 text-primary-600" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-health-50 flex items-center justify-center">
                <HeartPulse className="w-5 h-5 text-health-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">机构健康合格率排名</h3>
                <p className="text-xs text-neutral-500">健康合格率最高的省份</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {healthRanking.map((item, index) => (
              <div
                key={item.regionCode}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                    index < 3 ? getRankBadgeColor(index + 1) : 'bg-neutral-100 text-neutral-500'
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700 truncate">
                      {item.regionName}
                    </span>
                    <span className="text-sm font-semibold text-health-600">
                      {formatPercent(100 - item.healthAbnormalRate)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-health-400 to-health-600 rounded-full transition-all duration-700"
                      style={{ width: `${((100 - item.healthAbnormalRate) / 100) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-warning-50 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-warning-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-neutral-800">师生比排名</h3>
                <p className="text-xs text-neutral-500">师生比最优的省份</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5">
            {teacherRatioRanking.map((item, index) => (
              <div
                key={item.regionCode}
                className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-neutral-50 transition-colors"
              >
                <div
                  className={cn(
                    'w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0',
                    index < 3 ? getRankBadgeColor(index + 1) : 'bg-neutral-100 text-neutral-500'
                  )}
                >
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-neutral-700 truncate">
                      {item.regionName}
                    </span>
                    <span className="text-sm font-semibold text-warning-600">
                      {formatRatio(item.teacherStudentRatio)}
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-neutral-100 rounded-full mt-1.5 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-warning-400 to-warning-600 rounded-full transition-all duration-700"
                      style={{ width: `${(item.teacherStudentRatio / 0.2) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card p-6 border border-neutral-100">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-neutral-800">本周趋势分析</h3>
              <p className="text-xs text-neutral-500">入托率与健康合格率走势</p>
            </div>
          </div>
        </div>
        <div className="h-72">
          <ReactECharts
            option={trendOption}
            style={{ height: '100%', width: '100%' }}
            opts={{ renderer: 'canvas' }}
          />
        </div>
      </motion.div>
    </motion.div>
  );
}
