import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnrollmentPlan, EnrollmentForecast } from '@/types';
import { mockEnrollmentPlans, mockInstitutions } from '@/mock/data';
import { useAuthStore } from '@/store/auth';

interface EnrollmentState {
  allPlans: EnrollmentPlan[];
  selectedPlan: EnrollmentPlan | null;
  loading: boolean;
  searchKeyword: string;
  yearFilter: number | null;
  semesterFilter: string | null;
  page: number;
  pageSize: number;

  initPlans: () => void;
  fetchPlans: () => Promise<{ list: EnrollmentPlan[]; total: number }>;
  fetchPlanDetail: (id: string) => Promise<void>;
  setSearchKeyword: (keyword: string) => void;
  setYearFilter: (year: number | null) => void;
  setSemesterFilter: (semester: string | null) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  uploadPlan: (plans: EnrollmentPlan[]) => Promise<{ success: boolean; message?: string }>;
  addPlan: (plan: EnrollmentPlan) => void;
  updatePlan: (id: string, updates: Partial<EnrollmentPlan>) => void;
  deletePlan: (id: string) => void;
  getFilteredPlans: () => EnrollmentPlan[];
  getTotalDegreeGap: () => number;
  getAvgEnrollmentRate: () => number;
  getTotalPlannedCapacity: () => number;
  getTotalActualEnrollment: () => number;
  getAggregatedForecast: () => EnrollmentForecast[];
}

function generateForecast(planned: number): EnrollmentForecast[] {
  const forecast: EnrollmentForecast[] = [];
  const today = new Date();

  for (let i = 0; i < 90; i++) {
    const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
    const growth = 0.95 + Math.random() * 0.1;
    const demand = Math.floor(planned * (0.8 + Math.random() * 0.3) * growth);
    const supply = Math.floor(planned * (0.85 + Math.random() * 0.1));

    forecast.push({
      date: date.toISOString().split('T')[0],
      projectedDemand: demand,
      projectedSupply: supply,
      projectedGap: demand - supply,
    });
  }

  return forecast;
}

export const useEnrollmentStore = create<EnrollmentState>()(
  persist(
    (set, get) => ({
      allPlans: [],
      selectedPlan: null,
      loading: false,
      searchKeyword: '',
      yearFilter: null,
      semesterFilter: null,
      page: 1,
      pageSize: 10,

      initPlans: () => {
        if (get().allPlans.length === 0) {
          set({ allPlans: [...mockEnrollmentPlans] });
        }
      },

      fetchPlans: async () => {
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, 300));

        get().initPlans();

        const filtered = get().getFilteredPlans();
        set({ loading: false });

        const start = (get().page - 1) * get().pageSize;
        const end = start + get().pageSize;
        return { list: filtered.slice(start, end), total: filtered.length };
      },

      fetchPlanDetail: async (id: string) => {
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, 200));

        get().initPlans();
        const plan = get().allPlans.find((p) => p.id === id) || null;
        set({ selectedPlan: plan, loading: false });
      },

      setSearchKeyword: (keyword) => set({ searchKeyword: keyword, page: 1 }),
      setYearFilter: (year) => set({ yearFilter: year, page: 1 }),
      setSemesterFilter: (semester) => set({ semesterFilter: semester, page: 1 }),
      setPage: (page) => set({ page }),
      setPageSize: (size) => set({ pageSize: size, page: 1 }),

      uploadPlan: async (plans) => {
        await new Promise((resolve) => setTimeout(resolve, 800));

        get().initPlans();

        set((state) => {
          const existingIds = new Set(state.allPlans.map((p) => p.id));
          const newPlans = plans.filter((p) => !existingIds.has(p.id));
          return {
            allPlans: [...newPlans, ...state.allPlans],
          };
        });

        return {
          success: true,
          message: `上传成功，已导入 ${plans.length} 个机构的招生计划`,
        };
      },

      addPlan: (plan) => {
        get().initPlans();
        set((state) => ({
          allPlans: [plan, ...state.allPlans],
        }));
      },

      updatePlan: (id, updates) => {
        set((state) => ({
          allPlans: state.allPlans.map((p) =>
            p.id === id ? { ...p, ...updates } : p
          ),
          selectedPlan:
            state.selectedPlan?.id === id
              ? { ...state.selectedPlan, ...updates }
              : state.selectedPlan,
        }));
      },

      deletePlan: (id) => {
        set((state) => ({
          allPlans: state.allPlans.filter((p) => p.id !== id),
          selectedPlan:
            state.selectedPlan?.id === id ? null : state.selectedPlan,
        }));
      },

      getFilteredPlans: () => {
        const { allPlans, searchKeyword, yearFilter, semesterFilter } = get();
        const user = useAuthStore.getState().user;

        let result = [...allPlans];

        if (user && user.role !== 'national') {
          let instIds = mockInstitutions.map((i) => i.id);
          if (user.region.province) {
            instIds = mockInstitutions
              .filter((i) => i.address.province === user.region.province)
              .map((i) => i.id);
          }
          if (user.region.city) {
            instIds = mockInstitutions
              .filter((i) => i.address.city === user.region.city)
              .map((i) => i.id);
          }
          if (user.region.institutionId) {
            instIds = [user.region.institutionId];
          }
          result = result.filter((p) => instIds.includes(p.institutionId));
        }

        if (searchKeyword) {
          result = result.filter((p) =>
            p.institutionName.toLowerCase().includes(searchKeyword.toLowerCase())
          );
        }

        if (yearFilter) {
          result = result.filter((p) => p.year === yearFilter);
        }

        if (semesterFilter) {
          result = result.filter((p) => p.semester === semesterFilter);
        }

        return result;
      },

      getTotalDegreeGap: () => {
        const filtered = get().getFilteredPlans();
        if (filtered.length === 0) return 0;
        const totalGap = filtered.reduce((sum, plan) => {
          const latestGap =
            plan.forecast[plan.forecast.length - 1]?.projectedGap || 0;
          return sum + latestGap;
        }, 0);
        return totalGap;
      },

      getAvgEnrollmentRate: () => {
        const filtered = get().getFilteredPlans();
        if (filtered.length === 0) return 0;
        const avg =
          filtered.reduce((sum, plan) => sum + plan.enrollmentRate, 0) /
          filtered.length;
        return parseFloat(avg.toFixed(1));
      },

      getTotalPlannedCapacity: () => {
        const filtered = get().getFilteredPlans();
        return filtered.reduce((sum, plan) => sum + plan.plannedCapacity, 0);
      },

      getTotalActualEnrollment: () => {
        const filtered = get().getFilteredPlans();
        return filtered.reduce((sum, plan) => sum + plan.actualEnrollment, 0);
      },

      getAggregatedForecast: () => {
        const filtered = get().getFilteredPlans();
        if (filtered.length === 0) return [];

        const days = 90;
        const result: EnrollmentForecast[] = [];

        for (let i = 0; i < days; i++) {
          const date = filtered[0].forecast[i]?.date || '';
          const totalDemand = filtered.reduce(
            (sum, plan) => sum + (plan.forecast[i]?.projectedDemand || 0),
            0
          );
          const totalSupply = filtered.reduce(
            (sum, plan) => sum + (plan.forecast[i]?.projectedSupply || 0),
            0
          );
          result.push({
            date,
            projectedDemand: totalDemand,
            projectedSupply: totalSupply,
            projectedGap: totalDemand - totalSupply,
          });
        }

        return result;
      },
    }),
    {
      name: 'enrollment-storage',
      partialize: (state) => ({ allPlans: state.allPlans }),
    }
  )
);

export { generateForecast };
