import { create } from 'zustand';
import type {
  AggregatedMetrics,
  Institution,
  RealtimeData,
  Alert,
  HeatmapPoint,
  OperationReport,
} from '@/types';
import {
  mockInstitutions,
  mockRealtimeData,
  generateNationalMetrics,
  generateProvinceMetrics,
  mockHeatmapData,
  mockReports,
  regionOptions,
} from '@/mock/data';
import { useAuthStore } from '@/store/auth';
import { useAlertsStore } from '@/store/alerts';

const ageGroupRatios: Record<string, number> = {
  'all': 1,
  '0-1': 0.1,
  '1-2': 0.15,
  '2-3': 0.2,
  '3-4': 0.2,
  '4-5': 0.2,
  '5-6': 0.15,
};

interface DashboardState {
  loading: boolean;
  nationalMetrics: AggregatedMetrics | null;
  provinceMetrics: AggregatedMetrics[];
  heatmapData: HeatmapPoint[];
  institutions: Institution[];
  realtimeData: RealtimeData[];
  recentAlerts: Alert[];
  recentReports: OperationReport[];
  selectedProvince: string;
  selectedLevel: string;
  selectedAgeGroup: string;
  selectedIndicator: 'attendance' | 'health';
  
  fetchNationalMetrics: () => Promise<void>;
  fetchProvinceMetrics: () => Promise<void>;
  fetchHeatmapData: (indicator: 'attendance' | 'health') => Promise<void>;
  fetchInstitutions: (filters?: { province?: string; city?: string; level?: string }) => Promise<void>;
  fetchRealtimeData: (region?: string) => Promise<void>;
  fetchRecentAlerts: () => Promise<void>;
  fetchRecentReports: () => Promise<void>;
  setSelectedProvince: (province: string) => void;
  setSelectedLevel: (level: string) => void;
  setSelectedAgeGroup: (ageGroup: string) => void;
  setSelectedIndicator: (indicator: 'attendance' | 'health') => void;
  getFilteredInstitutions: () => Institution[];
  getFilteredRealtimeData: () => RealtimeData[];
  getFilteredNationalMetrics: () => AggregatedMetrics | null;
  getFilteredProvinceMetrics: () => AggregatedMetrics[];
  getFilteredAlerts: () => Alert[];
  getFilteredReports: () => OperationReport[];
  refreshAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  loading: false,
  nationalMetrics: null,
  provinceMetrics: [],
  heatmapData: [],
  institutions: mockInstitutions,
  realtimeData: mockRealtimeData,
  recentAlerts: [],
  recentReports: [],
  selectedProvince: 'all',
  selectedLevel: 'all',
  selectedAgeGroup: 'all',
  selectedIndicator: 'attendance',

  fetchNationalMetrics: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ nationalMetrics: generateNationalMetrics(), loading: false });
  },

  fetchProvinceMetrics: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({ provinceMetrics: generateProvinceMetrics(), loading: false });
  },

  fetchHeatmapData: async (indicator) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));
    set({ heatmapData: mockHeatmapData, selectedIndicator: indicator, loading: false });
  },

  fetchInstitutions: async (filters) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    let result = [...mockInstitutions];
    
    if (filters?.province) {
      result = result.filter((i) => i.address.province === filters.province);
    }
    if (filters?.city) {
      result = result.filter((i) => i.address.city === filters.city);
    }
    if (filters?.level) {
      result = result.filter((i) => i.level === filters.level);
    }
    
    set({ institutions: result, loading: false });
  },

  fetchRealtimeData: async (region) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    let result = [...mockRealtimeData];
    
    if (region) {
      const regionInstitutions = mockInstitutions.filter(
        (i) => i.address.province === region || i.address.city === region
      );
      const instIds = regionInstitutions.map((i) => i.id);
      result = result.filter((d) => instIds.includes(d.institutionId));
    }
    
    set({ realtimeData: result, loading: false });
  },

  fetchRecentAlerts: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const alertsStore = useAlertsStore.getState();
    alertsStore.initAlerts();
    const filteredAlerts = get().getFilteredAlerts();
    set({ recentAlerts: filteredAlerts, loading: false });
  },

  fetchRecentReports: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    const filteredReports = get().getFilteredReports();
    set({ recentReports: filteredReports, loading: false });
  },

  setSelectedProvince: (province) => {
    set({ selectedProvince: province });
  },

  setSelectedLevel: (level) => {
    set({ selectedLevel: level });
  },

  setSelectedAgeGroup: (ageGroup) => {
    set({ selectedAgeGroup: ageGroup });
  },

  setSelectedIndicator: (indicator) => {
    set({ selectedIndicator: indicator });
  },

  getFilteredInstitutions: () => {
    const { selectedProvince, selectedLevel } = get();
    const user = useAuthStore.getState().user;
    
    let result = [...mockInstitutions];
    
    if (user?.role === 'provincial' && user.region.province) {
      result = result.filter((i) => i.address.province === user.region.province);
    } else if (user?.role === 'municipal' && user.region.city) {
      result = result.filter((i) => i.address.city === user.region.city);
    }
    
    if (selectedProvince !== 'all') {
      result = result.filter((i) => i.address.province === selectedProvince);
    }
    
    if (selectedLevel !== 'all') {
      result = result.filter((i) => i.level === selectedLevel);
    }
    
    return result;
  },

  getFilteredRealtimeData: () => {
    const filteredInstitutions = get().getFilteredInstitutions();
    const instIds = filteredInstitutions.map((i) => i.id);
    return mockRealtimeData.filter((d) => instIds.includes(d.institutionId));
  },

  getFilteredNationalMetrics: () => {
    const { selectedAgeGroup } = get();
    const filteredInstitutions = get().getFilteredInstitutions();
    const filteredRealtime = get().getFilteredRealtimeData();
    
    if (filteredInstitutions.length === 0) {
      return null;
    }
    
    const ageRatio = ageGroupRatios[selectedAgeGroup] || 1;
    const totalStudents = Math.floor(filteredInstitutions.reduce((sum, inst) => sum + inst.studentCount, 0) * ageRatio);
    const totalTeachers = filteredInstitutions.reduce((sum, inst) => sum + inst.teacherCount, 0);
    
    const avgAttendanceRate = filteredRealtime.length > 0
      ? filteredRealtime.reduce((sum, d) => sum + d.attendance.rate, 0) / filteredRealtime.length
      : 0;
    const avgHealthAbnormalRate = filteredRealtime.length > 0
      ? filteredRealtime.reduce((sum, d) => sum + d.health.abnormalRate, 0) / filteredRealtime.length
      : 0;
    const avgNutritionComplianceRate = filteredRealtime.length > 0
      ? filteredRealtime.reduce((sum, d) => sum + d.diet.nutritionComplianceRate, 0) / filteredRealtime.length
      : 0;
    
    return {
      regionCode: 'national',
      regionName: '全国',
      period: 'day',
      periodStart: new Date().toISOString().split('T')[0],
      periodEnd: new Date().toISOString().split('T')[0],
      attendanceRate: parseFloat(avgAttendanceRate.toFixed(2)),
      healthAbnormalRate: parseFloat(avgHealthAbnormalRate.toFixed(2)),
      nutritionComplianceRate: parseFloat(avgNutritionComplianceRate.toFixed(2)),
      teacherStudentRatio: totalStudents > 0 ? parseFloat((totalTeachers / totalStudents).toFixed(3)) : 0,
      attendanceStabilityIndex: 95.5,
      institutionCount: filteredInstitutions.length,
      totalStudents,
      totalTeachers,
    };
  },

  getFilteredProvinceMetrics: () => {
    const { selectedAgeGroup } = get();
    const filteredInstitutions = get().getFilteredInstitutions();
    const filteredRealtime = get().getFilteredRealtimeData();
    
    const provinces = [...new Set(filteredInstitutions.map((i) => i.address.province))];
    const ageRatio = ageGroupRatios[selectedAgeGroup] || 1;
    
    return provinces.map((province) => {
      const provInstitutions = filteredInstitutions.filter((i) => i.address.province === province);
      const provInstIds = provInstitutions.map((i) => i.id);
      const provRealtime = filteredRealtime.filter((d) => provInstIds.includes(d.institutionId));
      
      const totalStudents = Math.floor(provInstitutions.reduce((sum, inst) => sum + inst.studentCount, 0) * ageRatio);
      const totalTeachers = provInstitutions.reduce((sum, inst) => sum + inst.teacherCount, 0);
      
      const avgAttendanceRate = provRealtime.length > 0
        ? provRealtime.reduce((sum, d) => sum + d.attendance.rate, 0) / provRealtime.length
        : 0;
      const avgHealthAbnormalRate = provRealtime.length > 0
        ? provRealtime.reduce((sum, d) => sum + d.health.abnormalRate, 0) / provRealtime.length
        : 0;
      const avgNutritionComplianceRate = provRealtime.length > 0
        ? provRealtime.reduce((sum, d) => sum + d.diet.nutritionComplianceRate, 0) / provRealtime.length
        : 0;
      
      return {
        regionCode: province,
        regionName: province,
        period: 'day',
        periodStart: new Date().toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        attendanceRate: parseFloat(avgAttendanceRate.toFixed(2)),
        healthAbnormalRate: parseFloat(avgHealthAbnormalRate.toFixed(2)),
        nutritionComplianceRate: parseFloat(avgNutritionComplianceRate.toFixed(2)),
        teacherStudentRatio: totalStudents > 0 ? parseFloat((totalTeachers / totalStudents).toFixed(3)) : 0,
        attendanceStabilityIndex: 95.5,
        institutionCount: provInstitutions.length,
        totalStudents,
        totalTeachers,
      };
    });
  },

  getFilteredAlerts: () => {
    const alertsStore = useAlertsStore.getState();
    alertsStore.initAlerts();
    const filteredInstitutions = get().getFilteredInstitutions();
    const instIds = filteredInstitutions.map((i) => i.id);
    const allAlerts = alertsStore.allAlerts;
    return allAlerts.filter((a) => instIds.includes(a.institutionId)).slice(0, 5);
  },

  getFilteredReports: () => {
    const user = useAuthStore.getState().user;
    const { selectedProvince } = get();

    let result = [...mockReports];

    if (user && user.role !== 'national') {
      if (user.role === 'provincial' && user.region.province) {
        result = result.filter((r) => r.regionName === user.region.province);
      } else if (user.role === 'municipal' && user.region.city) {
        result = result.filter((r) => r.regionName === user.region.city);
      }
    }

    if (selectedProvince !== 'all') {
      result = result.filter((r) => r.regionName === selectedProvince);
    }

    return result.slice(0, 3);
  },

  refreshAll: async () => {
    set({ loading: true });
    await Promise.all([
      get().fetchNationalMetrics(),
      get().fetchProvinceMetrics(),
      get().fetchHeatmapData(get().selectedIndicator),
      get().fetchRecentAlerts(),
      get().fetchRecentReports(),
    ]);
    set({ loading: false });
  },
}));
