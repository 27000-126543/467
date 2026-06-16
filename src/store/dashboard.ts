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
  mockAlerts,
  mockReports,
} from '@/mock/data';

interface DashboardState {
  loading: boolean;
  nationalMetrics: AggregatedMetrics | null;
  provinceMetrics: AggregatedMetrics[];
  heatmapData: HeatmapPoint[];
  institutions: Institution[];
  realtimeData: RealtimeData[];
  recentAlerts: Alert[];
  recentReports: OperationReport[];
  selectedProvince: string | null;
  selectedIndicator: 'attendance' | 'health';
  
  fetchNationalMetrics: () => Promise<void>;
  fetchProvinceMetrics: () => Promise<void>;
  fetchHeatmapData: (indicator: 'attendance' | 'health') => Promise<void>;
  fetchInstitutions: (filters?: { province?: string; city?: string; level?: string }) => Promise<void>;
  fetchRealtimeData: (region?: string) => Promise<void>;
  fetchRecentAlerts: () => Promise<void>;
  fetchRecentReports: () => Promise<void>;
  setSelectedProvince: (province: string | null) => void;
  setSelectedIndicator: (indicator: 'attendance' | 'health') => void;
  refreshAll: () => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  loading: false,
  nationalMetrics: null,
  provinceMetrics: [],
  heatmapData: [],
  institutions: mockInstitutions,
  realtimeData: mockRealtimeData,
  recentAlerts: mockAlerts.slice(0, 5),
  recentReports: mockReports.slice(0, 3),
  selectedProvince: null,
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
    set({ recentAlerts: mockAlerts.slice(0, 5), loading: false });
  },

  fetchRecentReports: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    set({ recentReports: mockReports.slice(0, 3), loading: false });
  },

  setSelectedProvince: (province) => {
    set({ selectedProvince: province });
  },

  setSelectedIndicator: (indicator) => {
    set({ selectedIndicator: indicator });
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
