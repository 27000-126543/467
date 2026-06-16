import { create } from 'zustand';
import type {
  Institution,
  RealtimeData,
  Alert,
  Approval,
  AggregatedMetrics,
} from '@/types';
import {
  mockInstitutions,
  mockRealtimeData,
  generateHistoricalRealtimeData,
  mockAlerts,
  mockApprovals,
} from '@/mock/data';

interface InstitutionState {
  loading: boolean;
  cityName: string;
  cityMetrics: AggregatedMetrics | null;
  cityInstitutions: Institution[];
  cityRealtimeData: RealtimeData[];
  historicalData: RealtimeData[];
  selectedInstitution: Institution | null;
  selectedInstitutionRealtime: RealtimeData | null;
  institutionAlerts: Alert[];
  institutionApprovals: Approval[];
  currentPage: number;
  pageSize: number;
  sortField: string;
  sortOrder: 'asc' | 'desc';
  selectedInstitutionIds: string[];

  fetchCityData: (cityName: string) => Promise<void>;
  fetchCityInstitutions: (cityName: string) => Promise<void>;
  fetchCityRealtimeData: (cityName: string) => Promise<void>;
  fetchInstitutionDetail: (institutionId: string) => Promise<void>;
  fetchHistoricalData: (institutionId: string, days?: number) => Promise<void>;
  fetchInstitutionAlerts: (institutionId: string) => Promise<void>;
  fetchInstitutionApprovals: (institutionId: string) => Promise<void>;
  setCurrentPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSortField: (field: string, order: 'asc' | 'desc') => void;
  toggleInstitutionSelection: (institutionId: string) => void;
  setCityName: (name: string) => void;
}

export const useInstitutionStore = create<InstitutionState>((set, get) => ({
  loading: false,
  cityName: '深圳市',
  cityMetrics: null,
  cityInstitutions: [],
  cityRealtimeData: [],
  historicalData: [],
  selectedInstitution: null,
  selectedInstitutionRealtime: null,
  institutionAlerts: [],
  institutionApprovals: [],
  currentPage: 1,
  pageSize: 10,
  sortField: 'studentCount',
  sortOrder: 'desc',
  selectedInstitutionIds: [],

  fetchCityData: async (cityName) => {
    set({ loading: true, cityName });
    await Promise.all([
      get().fetchCityInstitutions(cityName),
      get().fetchCityRealtimeData(cityName),
    ]);

    const { cityInstitutions, cityRealtimeData } = get();
    const totalStudents = cityInstitutions.reduce((sum, inst) => sum + inst.studentCount, 0);
    const totalTeachers = cityInstitutions.reduce((sum, inst) => sum + inst.teacherCount, 0);
    const avgAttendanceRate = cityRealtimeData.length > 0
      ? cityRealtimeData.reduce((sum, d) => sum + d.attendance.rate, 0) / cityRealtimeData.length
      : 0;
    const avgHealthAbnormalRate = cityRealtimeData.length > 0
      ? cityRealtimeData.reduce((sum, d) => sum + d.health.abnormalRate, 0) / cityRealtimeData.length
      : 0;
    const avgNutritionComplianceRate = cityRealtimeData.length > 0
      ? cityRealtimeData.reduce((sum, d) => sum + d.diet.nutritionComplianceRate, 0) / cityRealtimeData.length
      : 0;

    set({
      cityMetrics: {
        regionCode: cityName,
        regionName: cityName,
        period: 'day',
        periodStart: new Date().toISOString().split('T')[0],
        periodEnd: new Date().toISOString().split('T')[0],
        attendanceRate: parseFloat(avgAttendanceRate.toFixed(2)),
        healthAbnormalRate: parseFloat(avgHealthAbnormalRate.toFixed(2)),
        nutritionComplianceRate: parseFloat(avgNutritionComplianceRate.toFixed(2)),
        teacherStudentRatio: totalStudents > 0 ? parseFloat((totalTeachers / totalStudents).toFixed(3)) : 0,
        attendanceStabilityIndex: 95.5,
        institutionCount: cityInstitutions.length,
        totalStudents,
        totalTeachers,
      },
      loading: false,
    });
  },

  fetchCityInstitutions: async (cityName) => {
    await new Promise((resolve) => setTimeout(resolve, 300));
    const institutions = mockInstitutions.filter(
      (i) => i.address.city === cityName
    );
    set({ cityInstitutions: institutions });
  },

  fetchCityRealtimeData: async (cityName) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const cityInstIds = mockInstitutions
      .filter((i) => i.address.city === cityName)
      .map((i) => i.id);
    const realtimeData = mockRealtimeData.filter((d) =>
      cityInstIds.includes(d.institutionId)
    );
    set({ cityRealtimeData: realtimeData });
  },

  fetchInstitutionDetail: async (institutionId) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));

    const institution = mockInstitutions.find((i) => i.id === institutionId);
    const realtime = mockRealtimeData.find((d) => d.institutionId === institutionId);

    set({
      selectedInstitution: institution || null,
      selectedInstitutionRealtime: realtime || null,
      loading: false,
    });
  },

  fetchHistoricalData: async (institutionId, days = 30) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));
    const data = generateHistoricalRealtimeData(institutionId, days);
    set({ historicalData: data, loading: false });
  },

  fetchInstitutionAlerts: async (institutionId) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const alerts = mockAlerts.filter((a) => a.institutionId === institutionId);
    set({ institutionAlerts: alerts });
  },

  fetchInstitutionApprovals: async (institutionId) => {
    await new Promise((resolve) => setTimeout(resolve, 200));
    const approvals = mockApprovals.filter((a) => a.institutionId === institutionId);
    set({ institutionApprovals: approvals });
  },

  setCurrentPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),

  setSortField: (field, order) => {
    set({ sortField: field, sortOrder: order });
  },

  toggleInstitutionSelection: (institutionId) => {
    const { selectedInstitutionIds } = get();
    const exists = selectedInstitutionIds.includes(institutionId);
    if (exists) {
      set({ selectedInstitutionIds: selectedInstitutionIds.filter((id) => id !== institutionId) });
    } else {
      set({ selectedInstitutionIds: [...selectedInstitutionIds, institutionId] });
    }
  },

  setCityName: (name) => set({ cityName: name }),
}));
