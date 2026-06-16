import { create } from 'zustand';
import type { EnrollmentPlan, EnrollmentForecast } from '@/types';
import { mockEnrollmentPlans } from '@/mock/data';

interface EnrollmentState {
  plans: EnrollmentPlan[];
  selectedPlan: EnrollmentPlan | null;
  forecastData: EnrollmentForecast[];
  loading: boolean;
  searchKeyword: string;
  yearFilter: number | null;
  semesterFilter: string | null;
  page: number;
  pageSize: number;
  total: number;

  fetchPlans: () => Promise<void>;
  fetchPlanDetail: (id: string) => Promise<void>;
  setSearchKeyword: (keyword: string) => void;
  setYearFilter: (year: number | null) => void;
  setSemesterFilter: (semester: string | null) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  uploadPlan: (file: File) => Promise<{ success: boolean; message?: string }>;
  getFilteredPlans: () => EnrollmentPlan[];
  getTotalDegreeGap: () => number;
  getAvgEnrollmentRate: () => number;
}

export const useEnrollmentStore = create<EnrollmentState>((set, get) => ({
  plans: [],
  selectedPlan: null,
  forecastData: [],
  loading: false,
  searchKeyword: '',
  yearFilter: null,
  semesterFilter: null,
  page: 1,
  pageSize: 10,
  total: 0,

  fetchPlans: async () => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    set({
      plans: mockEnrollmentPlans,
      total: mockEnrollmentPlans.length,
      loading: false,
    });
  },

  fetchPlanDetail: async (id: string) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 500));
    const plan = mockEnrollmentPlans.find((p) => p.id === id);
    if (plan) {
      set({ selectedPlan: plan, forecastData: plan.forecast, loading: false });
    } else {
      set({ loading: false });
    }
  },

  setSearchKeyword: (keyword) => set({ searchKeyword: keyword, page: 1 }),
  setYearFilter: (year) => set({ yearFilter: year, page: 1 }),
  setSemesterFilter: (semester) => set({ semesterFilter: semester, page: 1 }),
  setPage: (page) => set({ page }),
  setPageSize: (size) => set({ pageSize: size, page: 1 }),

  uploadPlan: async (file) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log('Uploaded file:', file.name);
    return { success: true, message: '上传成功，已提取20个机构的招生计划' };
  },

  getFilteredPlans: () => {
    const { plans, searchKeyword, yearFilter, semesterFilter } = get();
    let filtered = [...plans];

    if (searchKeyword) {
      filtered = filtered.filter(
        (p) =>
          p.institutionName.toLowerCase().includes(searchKeyword.toLowerCase())
      );
    }

    if (yearFilter) {
      filtered = filtered.filter((p) => p.year === yearFilter);
    }

    if (semesterFilter) {
      filtered = filtered.filter((p) => p.semester === semesterFilter);
    }

    return filtered;
  },

  getTotalDegreeGap: () => {
    const { plans } = get();
    if (plans.length === 0) return 0;
    const totalGap = plans.reduce((sum, plan) => {
      const latestGap = plan.forecast[plan.forecast.length - 1]?.projectedGap || 0;
      return sum + latestGap;
    }, 0);
    return totalGap;
  },

  getAvgEnrollmentRate: () => {
    const { plans } = get();
    if (plans.length === 0) return 0;
    const avg = plans.reduce((sum, plan) => sum + plan.enrollmentRate, 0) / plans.length;
    return parseFloat(avg.toFixed(1));
  },
}));
