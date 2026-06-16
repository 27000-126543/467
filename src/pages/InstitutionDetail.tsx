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
  Phone,
  User,
  Moon,
  Activity,
  BarChart3,
  FileText,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  Footprints,
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
  getAlertTypeText,
  getAlertLevelText,
  getAlertStatusText,
  getApprovalTypeText,
  getApprovalStatusText,
} from '@/utils/format';
import { cn } from '@/lib/utils';

type TabKey = 'overview' | 'trends' | 'alerts' | 'approvals';

const tabs: { key: TabKey; label: string }[] = [
  { key: 'overview', label: '实时概览' },
  { key: 'trends', label: '历史趋势' },
  { key: 'alerts', label: '预警记录' },
  { key: 'approvals', label: '审批记录' },
];

export default function InstitutionDetail() {
  const navigate = useNavigate();
  const { institutionId = 'inst001' } = useParams<{ institutionId: string }>();
  const {
    loading,
    selectedInstitution,
    selectedInstitutionRealtime,
    historicalData,
    institutionAlerts,
    institutionApprovals,
    fetchInstitutionDetail,
    fetchHistoricalData,
    fetchInstitutionAlerts,
    fetchInstitutionApprovals,
  } = useInstitutionStore();

  const [activeTab, setActiveTab] = useState<TabKey>('overview');

  useEffect(() => {
    fetchInstitutionDetail(institutionId);
    fetchHistoricalData(institutionId, 30);
    fetchInstitutionAlerts(institutionId);
    fetchInstitutionApprovals(institutionId);
  }, [institutionId, fetchInstitutionDetail, fetchHistoricalData, fetchInstitutionAlerts, fetchInstitutionApprovals]);

  const trendOption = useMemo(() => {
    const data = historicalData;
    const dates = data.map((d) => {
      const date = new Date(d.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

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
        data: ['入托率', '健康合格率', '营养达标率'],
        top: 0,
        right: 0,
        textStyle: { color: '#718096', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        min: 60,
        max: 100,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 12, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(203, 213, 220, 0.3)', type: 'dashed' } },
      },
      series: [
        {
          name: '入托率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: data.map((d) => d.attendance.rate),
          lineStyle: { width: 2, color: '#1a365d' },
          itemStyle: { color: '#1a365d', borderColor: '#fff', borderWidth: 2 },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(26, 54, 93, 0.15)' },
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
          symbolSize: 5,
          data: data.map((d) => 100 - d.health.abnormalRate),
          lineStyle: { width: 2, color: '#38a169' },
          itemStyle: { color: '#38a169', borderColor: '#fff', borderWidth: 2 },
        },
        {
          name: '营养达标率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: data.map((d) => d.diet.nutritionComplianceRate),
          lineStyle: { width: 2, color: '#dd6b20' },
          itemStyle: { color: '#dd6b20', borderColor: '#fff', borderWidth: 2 },
        },
      ],
    };
  }, [historicalData]);

  const healthTrendOption = useMemo(() => {
    const data = historicalData;
    const dates = data.map((d) => {
      const date = new Date(d.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

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
        data: ['发热', '咳嗽', '腹泻'],
        top: 0,
        right: 0,
        textStyle: { color: '#718096', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 12 },
        splitLine: { lineStyle: { color: 'rgba(203, 213, 220, 0.3)', type: 'dashed' } },
      },
      series: [
        {
          name: '发热',
          type: 'bar',
          stack: 'total',
          barWidth: '50%',
          data: data.map((d) => d.health.abnormalDetails.fever),
          itemStyle: { color: '#e53e3e' },
        },
        {
          name: '咳嗽',
          type: 'bar',
          stack: 'total',
          data: data.map((d) => d.health.abnormalDetails.cough),
          itemStyle: { color: '#dd6b20' },
        },
        {
          name: '腹泻',
          type: 'bar',
          stack: 'total',
          data: data.map((d) => d.health.abnormalDetails.diarrhea),
          itemStyle: { color: '#3182ce' },
        },
      ],
    };
  }, [historicalData]);

  const dietTrendOption = useMemo(() => {
    const data = historicalData;
    const dates = data.map((d) => {
      const date = new Date(d.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

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
        data: ['早餐剩余', '午餐剩余', '晚餐剩余'],
        top: 0,
        right: 0,
        textStyle: { color: '#718096', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 11 },
      },
      yAxis: {
        type: 'value',
        max: 25,
        axisLine: { show: false },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 12, formatter: '{value}%' },
        splitLine: { lineStyle: { color: 'rgba(203, 213, 220, 0.3)', type: 'dashed' } },
      },
      series: [
        {
          name: '早餐剩余',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: data.map((d) => d.diet.breakfastRemaining),
          lineStyle: { width: 2, color: '#3182ce' },
          itemStyle: { color: '#3182ce', borderColor: '#fff', borderWidth: 2 },
        },
        {
          name: '午餐剩余',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: data.map((d) => d.diet.lunchRemaining),
          lineStyle: { width: 2, color: '#38a169' },
          itemStyle: { color: '#38a169', borderColor: '#fff', borderWidth: 2 },
        },
        {
          name: '晚餐剩余',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: data.map((d) => d.diet.dinnerRemaining),
          lineStyle: { width: 2, color: '#dd6b20' },
          itemStyle: { color: '#dd6b20', borderColor: '#fff', borderWidth: 2 },
        },
      ],
    };
  }, [historicalData]);

  const sleepTrendOption = useMemo(() => {
    const data = historicalData;
    const dates = data.map((d) => {
      const date = new Date(d.timestamp);
      return `${date.getMonth() + 1}/${date.getDate()}`;
    });

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
        data: ['平均睡眠时长', '睡眠达标率'],
        top: 0,
        right: 0,
        textStyle: { color: '#718096', fontSize: 12 },
        itemWidth: 12,
        itemHeight: 8,
      },
      xAxis: {
        type: 'category',
        data: dates,
        axisLine: { lineStyle: { color: '#e2e8f0' } },
        axisTick: { show: false },
        axisLabel: { color: '#a0aec0', fontSize: 11 },
      },
      yAxis: [
        {
          type: 'value',
          name: '小时',
          min: 0,
          max: 4,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#a0aec0', fontSize: 12 },
          splitLine: { lineStyle: { color: 'rgba(203, 213, 220, 0.3)', type: 'dashed' } },
        },
        {
          type: 'value',
          name: '%',
          min: 60,
          max: 100,
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#a0aec0', fontSize: 12, formatter: '{value}%' },
          splitLine: { show: false },
        },
      ],
      series: [
        {
          name: '平均睡眠时长',
          type: 'bar',
          barWidth: '40%',
          data: data.map((d) => d.sleep.avgDuration),
          itemStyle: { color: '#805ad5', borderRadius: [6, 6, 0, 0] },
          yAxisIndex: 0,
        },
        {
          name: '睡眠达标率',
          type: 'line',
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          data: data.map((d) => d.sleep.complianceRate),
          lineStyle: { width: 2, color: '#dd6b20' },
          itemStyle: { color: '#dd6b20', borderColor: '#fff', borderWidth: 2 },
          yAxisIndex: 1,
        },
      ],
    };
  }, [historicalData]);

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

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'demo': return 'bg-health-100 text-health-700';
      case 'first': return 'bg-primary-100 text-primary-700';
      case 'second': return 'bg-warning-100 text-warning-700';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal': return 'bg-health-100 text-health-700';
      case 'warning': return 'bg-danger-100 text-danger-700';
      case 'restricted': return 'bg-warning-100 text-warning-700';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  const getAlertLevelColor = (level: number) => {
    if (level === 1) return 'bg-danger-100 text-danger-700 border-danger-200';
    if (level === 2) return 'bg-warning-100 text-warning-700 border-warning-200';
    return 'bg-primary-100 text-primary-700 border-primary-200';
  };

  const getAlertStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-danger-100 text-danger-700';
      case 'processing': return 'bg-warning-100 text-warning-700';
      case 'resolved': return 'bg-health-100 text-health-700';
      default: return 'bg-neutral-100 text-neutral-600';
    }
  };

  if (loading && !selectedInstitution) {
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
          <button
            onClick={() => navigate(`/city/${selectedInstitution?.address.city || '深圳市'}`)}
            className="hover:text-primary-600 transition-colors"
          >
            {selectedInstitution?.address.city}
          </button>
          <ChevronRight className="w-4 h-4" />
          <span className="text-primary-600 font-medium">
            {selectedInstitution?.name}
          </span>
        </nav>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-gradient-to-br from-primary-700 via-primary-600 to-primary-500 rounded-2xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
        
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center flex-shrink-0">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">
                  {selectedInstitution?.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 mt-2">
                  <span className={cn(
                    'px-3 py-1 text-sm font-medium rounded-full',
                    getLevelColor(selectedInstitution?.level || '')
                  )}>
                    {getInstitutionLevelText(selectedInstitution?.level || '')}
                  </span>
                  <span className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full',
                    getStatusColor(selectedInstitution?.status || '')
                  )}>
                    <span className={cn(
                      'w-2 h-2 rounded-full',
                      selectedInstitution?.status === 'normal' && 'bg-health-500',
                      selectedInstitution?.status === 'warning' && 'bg-danger-500 animate-pulse',
                      selectedInstitution?.status === 'restricted' && 'bg-warning-500',
                    )} />
                    {getInstitutionStatusText(selectedInstitution?.status || '')}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-4 mt-3 text-white/80 text-sm">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4" />
                    <span>
                      {selectedInstitution?.address.province}
                      {selectedInstitution?.address.city}
                      {selectedInstitution?.address.district}
                      {selectedInstitution?.address.detail}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 lg:gap-6">
              <div className="text-center">
                <p className="text-white/70 text-sm mb-1">容量</p>
                <p className="text-2xl font-bold">
                  {selectedInstitution?.capacity}
                  <span className="text-sm font-normal ml-1 text-white/70">人</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm mb-1">在园儿童</p>
                <p className="text-2xl font-bold">
                  {selectedInstitution?.studentCount}
                  <span className="text-sm font-normal ml-1 text-white/70">人</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm mb-1">教师数</p>
                <p className="text-2xl font-bold">
                  {selectedInstitution?.teacherCount}
                  <span className="text-sm font-normal ml-1 text-white/70">人</span>
                </p>
              </div>
              <div className="text-center">
                <p className="text-white/70 text-sm mb-1">师生比</p>
                <p className="text-2xl font-bold">
                  {selectedInstitution 
                    ? formatRatio(selectedInstitution.teacherCount / selectedInstitution.studentCount)
                    : '--'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-white/20">
            <div className="flex items-center gap-2 text-sm text-white/80">
              <User className="w-4 h-4" />
              <span>联系人：{selectedInstitution?.contactPerson}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Phone className="w-4 h-4" />
              <span>联系电话：{selectedInstitution?.contactPhone}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-white/80">
              <Calendar className="w-4 h-4" />
              <span>成立时间：{selectedInstitution?.establishedDate}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="bg-white rounded-2xl shadow-card border border-neutral-100 overflow-hidden">
        <div className="flex border-b border-neutral-100">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-6 py-4 text-sm font-medium transition-all border-b-2 -mb-px',
                activeTab === tab.key
                  ? 'text-primary-600 border-primary-600 bg-primary-50/30'
                  : 'text-neutral-500 border-transparent hover:text-neutral-700 hover:bg-neutral-50'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <StatCard
                  title="当日出勤"
                  value={formatPercent(selectedInstitutionRealtime?.attendance.rate || 0)}
                  icon={<Users className="w-5 h-5" />}
                  variant="primary"
                  change={1.2}
                  changeLabel="较昨日"
                />
                <StatCard
                  title="晨检异常"
                  value={selectedInstitutionRealtime?.health.abnormalCount || 0}
                  unit="人"
                  icon={<HeartPulse className="w-5 h-5" />}
                  variant="danger"
                  change={-0.5}
                  changeLabel="较昨日"
                />
                <StatCard
                  title="营养达标"
                  value={formatPercent(selectedInstitutionRealtime?.diet.nutritionComplianceRate || 0)}
                  icon={<UtensilsCrossed className="w-5 h-5" />}
                  variant="health"
                  change={2.1}
                  changeLabel="较昨日"
                />
                <StatCard
                  title="平均睡眠"
                  value={(selectedInstitutionRealtime?.sleep.avgDuration || 0).toFixed(1)}
                  unit="小时"
                  icon={<Moon className="w-5 h-5" />}
                  variant="warning"
                  change={0.3}
                  changeLabel="较昨日"
                />
                <StatCard
                  title="活动量"
                  value={formatNumber(selectedInstitutionRealtime?.activity.avgSteps || 0)}
                  unit="步"
                  icon={<Footprints className="w-5 h-5" />}
                  variant="primary"
                  change={5.2}
                  changeLabel="较昨日"
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <HeartPulse className="w-5 h-5 text-danger-600" />
                    <h3 className="text-base font-semibold text-neutral-800">今日健康详情</h3>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-neutral-600">发热</span>
                        <span className="font-medium text-neutral-800">
                          {selectedInstitutionRealtime?.health.abnormalDetails.fever || 0} 例
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-danger-500 rounded-full transition-all"
                          style={{
                            width: `${((selectedInstitutionRealtime?.health.abnormalDetails.fever || 0) / (selectedInstitutionRealtime?.health.totalChecked || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-neutral-600">咳嗽</span>
                        <span className="font-medium text-neutral-800">
                          {selectedInstitutionRealtime?.health.abnormalDetails.cough || 0} 例
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-warning-500 rounded-full transition-all"
                          style={{
                            width: `${((selectedInstitutionRealtime?.health.abnormalDetails.cough || 0) / (selectedInstitutionRealtime?.health.totalChecked || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-neutral-600">腹泻</span>
                        <span className="font-medium text-neutral-800">
                          {selectedInstitutionRealtime?.health.abnormalDetails.diarrhea || 0} 例
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary-500 rounded-full transition-all"
                          style={{
                            width: `${((selectedInstitutionRealtime?.health.abnormalDetails.diarrhea || 0) / (selectedInstitutionRealtime?.health.totalChecked || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-neutral-600">其他</span>
                        <span className="font-medium text-neutral-800">
                          {selectedInstitutionRealtime?.health.abnormalDetails.other || 0} 例
                        </span>
                      </div>
                      <div className="h-2 bg-neutral-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-neutral-400 rounded-full transition-all"
                          style={{
                            width: `${((selectedInstitutionRealtime?.health.abnormalDetails.other || 0) / (selectedInstitutionRealtime?.health.totalChecked || 1)) * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="w-5 h-5 text-health-600" />
                    <h3 className="text-base font-semibold text-neutral-800">今日饮食情况</h3>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-primary-600">早</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-800">早餐剩余率</p>
                          <p className="text-xs text-neutral-500">早餐剩餐比例</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-primary-600">
                        {selectedInstitutionRealtime?.diet.breakfastRemaining.toFixed(1) || 0}%
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-health-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-health-600">午</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-800">午餐剩余率</p>
                          <p className="text-xs text-neutral-500">午餐剩餐比例</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-health-600">
                        {selectedInstitutionRealtime?.diet.lunchRemaining.toFixed(1) || 0}%
                      </p>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-warning-100 flex items-center justify-center">
                          <span className="text-sm font-bold text-warning-600">晚</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-neutral-800">晚餐剩余率</p>
                          <p className="text-xs text-neutral-500">晚餐剩餐比例</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-warning-600">
                        {selectedInstitutionRealtime?.diet.dinnerRemaining.toFixed(1) || 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-primary-600" />
                  <h3 className="text-base font-semibold text-neutral-800">近30天综合趋势</h3>
                </div>
                <div className="h-80">
                  <ReactECharts
                    option={trendOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'trends' && (
            <div className="space-y-6">
              <div className="bg-neutral-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="w-5 h-5 text-primary-600" />
                  <h3 className="text-base font-semibold text-neutral-800">入托率与健康合格率趋势</h3>
                </div>
                <div className="h-80">
                  <ReactECharts
                    option={trendOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-neutral-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <HeartPulse className="w-5 h-5 text-danger-600" />
                    <h3 className="text-base font-semibold text-neutral-800">健康异常分类统计</h3>
                  </div>
                  <div className="h-72">
                    <ReactECharts
                      option={healthTrendOption}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'canvas' }}
                    />
                  </div>
                </div>

                <div className="bg-neutral-50 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <UtensilsCrossed className="w-5 h-5 text-health-600" />
                    <h3 className="text-base font-semibold text-neutral-800">餐食剩余率趋势</h3>
                  </div>
                  <div className="h-72">
                    <ReactECharts
                      option={dietTrendOption}
                      style={{ height: '100%', width: '100%' }}
                      opts={{ renderer: 'canvas' }}
                    />
                  </div>
                </div>
              </div>

              <div className="bg-neutral-50 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <Moon className="w-5 h-5 text-warning-600" />
                  <h3 className="text-base font-semibold text-neutral-800">睡眠情况趋势</h3>
                </div>
                <div className="h-80">
                  <ReactECharts
                    option={sleepTrendOption}
                    style={{ height: '100%', width: '100%' }}
                    opts={{ renderer: 'canvas' }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  共 {institutionAlerts.length} 条预警记录
                </p>
              </div>

              <div className="space-y-3">
                {institutionAlerts.length > 0 ? (
                  institutionAlerts.map((alert, index) => (
                    <motion.div
                      key={alert.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={cn(
                        'p-4 rounded-xl border transition-all',
                        alert.status === 'pending'
                          ? 'bg-danger-50/50 border-danger-200 hover:border-danger-300'
                          : alert.status === 'processing'
                          ? 'bg-warning-50/50 border-warning-200 hover:border-warning-300'
                          : alert.status === 'resolved'
                          ? 'bg-health-50/50 border-health-200 hover:border-health-300'
                          : 'bg-neutral-50 border-neutral-200 hover:border-neutral-300'
                      )}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-3 flex-1">
                          <div className={cn(
                            'w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0',
                            alert.status === 'pending' && 'bg-danger-100',
                            alert.status === 'processing' && 'bg-warning-100',
                            alert.status === 'resolved' && 'bg-health-100',
                            alert.status === 'escalated' && 'bg-danger-100',
                          )}>
                            <AlertTriangle className={cn(
                              'w-5 h-5',
                              alert.status === 'resolved' ? 'text-health-600' : 'text-danger-600'
                            )} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full border',
                                getAlertLevelColor(alert.level)
                              )}>
                                {getAlertLevelText(alert.level)}
                              </span>
                              <span className="text-xs text-neutral-500">
                                {getAlertTypeText(alert.type)}
                              </span>
                              <span className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                getAlertStatusColor(alert.status)
                              )}>
                                {getAlertStatusText(alert.status)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-neutral-800">
                              {alert.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-neutral-500">
                              <div className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                <span>触发时间：{formatDateTime(alert.triggeredAt)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>阈值：{alert.threshold}，实际：{alert.actualValue}</span>
                              </div>
                              <span>连续{alert.consecutiveDays}天</span>
                            </div>
                            {alert.handlerName && (
                              <div className="mt-2 text-xs text-neutral-500">
                                处理人：{alert.handlerName}
                              </div>
                            )}
                            {alert.resolvedAt && (
                              <div className="mt-1 text-xs text-neutral-500">
                                解决时间：{formatDateTime(alert.resolvedAt)}
                              </div>
                            )}
                            {alert.resolution && (
                              <div className="mt-2 p-2 bg-white/60 rounded-lg text-xs text-neutral-600">
                                处理结果：{alert.resolution}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <CheckCircle className="w-12 h-12 text-health-400 mx-auto mb-3" />
                    <p className="text-neutral-500">暂无预警记录</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'approvals' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-neutral-500">
                  共 {institutionApprovals.length} 条审批记录
                </p>
              </div>

              <div className="space-y-4">
                {institutionApprovals.length > 0 ? (
                  institutionApprovals.map((approval, index) => (
                    <motion.div
                      key={approval.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="p-5 bg-white rounded-xl border border-neutral-200 hover:border-primary-200 transition-all"
                    >
                      <div className="flex items-start justify-between gap-4 mb-4">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center">
                            <FileText className="w-5 h-5 text-primary-600" />
                          </div>
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="px-2 py-0.5 bg-primary-100 text-primary-700 text-xs font-medium rounded-full">
                                {getApprovalTypeText(approval.type)}
                              </span>
                              <span className={cn(
                                'px-2 py-0.5 text-xs font-medium rounded-full',
                                approval.status === 'approved' && 'bg-health-100 text-health-700',
                                approval.status === 'rejected' && 'bg-danger-100 text-danger-700',
                                approval.status.startsWith('pending') && 'bg-warning-100 text-warning-700',
                              )}>
                                {getApprovalStatusText(approval.status)}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-neutral-800">
                              {approval.proposedAction}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-xs text-neutral-500 mb-2">审批流程</p>
                        <div className="flex items-center">
                          {approval.stages.map((stage, idx) => (
                            <div key={stage.stage} className="flex items-center flex-1">
                              <div className="flex flex-col items-center">
                                <div className={cn(
                                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                                  stage.status === 'approved' && 'bg-health-500 text-white',
                                  stage.status === 'rejected' && 'bg-danger-500 text-white',
                                  stage.status === 'pending' && 'bg-neutral-200 text-neutral-500',
                                )}>
                                  {stage.status === 'approved' ? (
                                    <CheckCircle className="w-4 h-4" />
                                  ) : stage.status === 'rejected' ? (
                                    <XCircle className="w-4 h-4" />
                                  ) : (
                                    stage.stage
                                  )}
                                </div>
                                <p className="text-xs text-neutral-600 mt-1.5 font-medium">
                                  {stage.role}
                                </p>
                                {stage.handlerName && (
                                  <p className="text-xs text-neutral-400">{stage.handlerName}</p>
                                )}
                                {stage.handledAt && (
                                  <p className="text-xs text-neutral-400 mt-0.5">
                                    {formatDateTime(stage.handledAt)}
                                  </p>
                                )}
                              </div>
                              {idx < approval.stages.length - 1 && (
                                <div className={cn(
                                  'flex-1 h-0.5 mx-2 mb-8',
                                  stage.status === 'approved' ? 'bg-health-400' : 'bg-neutral-200'
                                )} />
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {approval.expectedEffect && (
                        <div className="p-3 bg-neutral-50 rounded-lg">
                          <p className="text-xs text-neutral-500 mb-1">预期效果</p>
                          <p className="text-sm text-neutral-700">{approval.expectedEffect}</p>
                        </div>
                      )}

                      <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
                        <span className="text-xs text-neutral-500">
                          申请时间：{formatDateTime(approval.createdAt)}
                        </span>
                        <button className="text-primary-600 text-sm font-medium hover:text-primary-700 transition-colors">
                          查看详情
                        </button>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <div className="py-12 text-center">
                    <FileText className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
                    <p className="text-neutral-500">暂无审批记录</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
