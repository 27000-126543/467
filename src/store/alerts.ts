import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Alert, AlertStatus, AlertLevel, AlertType } from '@/types';
import { mockAlerts, mockInstitutions } from '@/mock/data';
import { useAuthStore } from '@/store/auth';

interface AlertsState {
  allAlerts: Alert[];
  loading: boolean;
  page: number;
  pageSize: number;
  selectedAlert: Alert | null;
  
  statusFilter: AlertStatus | 'all';
  levelFilter: AlertLevel | 'all';
  typeFilter: AlertType | 'all';
  searchKeyword: string;
  
  initAlerts: () => void;
  fetchAlerts: (params?: {
    page?: number;
    pageSize?: number;
    status?: AlertStatus | 'all';
    level?: AlertLevel | 'all';
    type?: AlertType | 'all';
    keyword?: string;
  }) => Promise<{ list: Alert[]; total: number }>;
  
  fetchAlertById: (id: string) => Promise<void>;
  
  processAlert: (id: string, status: AlertStatus, resolution: string, handlerName?: string) => Promise<boolean>;
  
  escalateAlert: (id: string) => Promise<boolean>;
  
  setFilters: (filters: Partial<{
    status: AlertStatus | 'all';
    level: AlertLevel | 'all';
    type: AlertType | 'all';
    keyword: string;
  }>) => void;
  
  setPagination: (page: number, pageSize: number) => void;
  
  getFilteredAlerts: () => Alert[];
  
  getStats: () => {
    total: number;
    pending: number;
    processing: number;
    resolved: number;
    escalated: number;
  };
}

export const useAlertsStore = create<AlertsState>()(
  persist(
    (set, get) => ({
      allAlerts: [],
      loading: false,
      page: 1,
      pageSize: 10,
      selectedAlert: null,
      statusFilter: 'all',
      levelFilter: 'all',
      typeFilter: 'all',
      searchKeyword: '',

      initAlerts: () => {
        if (get().allAlerts.length === 0) {
          set({ allAlerts: [...mockAlerts] });
        }
      },

      fetchAlerts: async (params) => {
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, 300));

        get().initAlerts();

        const { allAlerts } = get();
        const user = useAuthStore.getState().user;

        let result = [...allAlerts];

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
          result = result.filter((a) => instIds.includes(a.institutionId));
        }

        const status = params?.status ?? get().statusFilter;
        const level = params?.level ?? get().levelFilter;
        const type = params?.type ?? get().typeFilter;
        const keyword = params?.keyword ?? get().searchKeyword;
        const page = params?.page ?? get().page;
        const pageSize = params?.pageSize ?? get().pageSize;

        if (status && status !== 'all') {
          result = result.filter((a) => a.status === status);
        }
        if (level && level !== 'all') {
          result = result.filter((a) => a.level === level);
        }
        if (type && type !== 'all') {
          result = result.filter((a) => a.type === type);
        }
        if (keyword) {
          result = result.filter(
            (a) =>
              a.institutionName.includes(keyword) || a.description.includes(keyword)
          );
        }

        const total = result.length;
        const start = (page - 1) * pageSize;
        const list = result.slice(start, start + pageSize);

        set({
          page,
          pageSize,
          loading: false,
        });

        return { list, total };
      },

      fetchAlertById: async (id) => {
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, 200));

        get().initAlerts();
        const alert = get().allAlerts.find((a) => a.id === id) || null;
        set({ selectedAlert: alert, loading: false });
      },

      processAlert: async (id, status, resolution, handlerName) => {
        await new Promise((resolve) => setTimeout(resolve, 400));

        get().initAlerts();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        set((state) => {
          const newAlerts = state.allAlerts.map((a) => {
            if (a.id !== id) return a;
            
            const baseUpdate = {
              ...a,
              status,
              resolution,
              handlerName: handlerName || '系统管理员',
            };
            
            if (status === 'processing') {
              return {
                ...baseUpdate,
                processedAt: now,
              };
            } else if (status === 'resolved') {
              return {
                ...baseUpdate,
                resolvedAt: now,
                processedAt: a.processedAt || now,
              };
            }
            
            return baseUpdate;
          });

          const updated = newAlerts.find((a) => a.id === id) || null;

          return {
            allAlerts: newAlerts,
            selectedAlert: state.selectedAlert?.id === id ? updated : state.selectedAlert,
          };
        });

        return true;
      },

      escalateAlert: async (id) => {
        await new Promise((resolve) => setTimeout(resolve, 400));

        get().initAlerts();

        set((state) => {
          const newAlerts = state.allAlerts.map((a) =>
            a.id === id
              ? {
                  ...a,
                  level: (Math.min(a.level + 1, 3) as 1 | 2 | 3),
                  status: 'escalated' as const,
                }
              : a
          );

          const updated = newAlerts.find((a) => a.id === id) || null;

          return {
            allAlerts: newAlerts,
            selectedAlert: state.selectedAlert?.id === id ? updated : state.selectedAlert,
          };
        });

        return true;
      },

      setFilters: (filters) => {
        set((state) => ({
          statusFilter: filters.status ?? state.statusFilter,
          levelFilter: filters.level ?? state.levelFilter,
          typeFilter: filters.type ?? state.typeFilter,
          searchKeyword: filters.keyword ?? state.searchKeyword,
          page: 1,
        }));
      },

      setPagination: (page, pageSize) => {
        set({ page, pageSize });
      },

      getFilteredAlerts: () => {
        const { allAlerts, statusFilter, levelFilter, typeFilter, searchKeyword } = get();
        const user = useAuthStore.getState().user;

        let result = [...allAlerts];

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
          result = result.filter((a) => instIds.includes(a.institutionId));
        }

        if (statusFilter && statusFilter !== 'all') {
          result = result.filter((a) => a.status === statusFilter);
        }
        if (levelFilter && levelFilter !== 'all') {
          result = result.filter((a) => a.level === levelFilter);
        }
        if (typeFilter && typeFilter !== 'all') {
          result = result.filter((a) => a.type === typeFilter);
        }
        if (searchKeyword) {
          result = result.filter(
            (a) =>
              a.institutionName.includes(searchKeyword) ||
              a.description.includes(searchKeyword)
          );
        }

        return result;
      },

      getStats: () => {
        const filtered = get().getFilteredAlerts();
        return {
          total: filtered.length,
          pending: filtered.filter((a) => a.status === 'pending').length,
          processing: filtered.filter((a) => a.status === 'processing').length,
          resolved: filtered.filter((a) => a.status === 'resolved').length,
          escalated: filtered.filter((a) => a.status === 'escalated').length,
        };
      },
    }),
    {
      name: 'alerts-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return null;
        }
        return persistedState;
      },
      partialize: (state) => ({
        allAlerts: state.allAlerts,
        page: state.page,
        pageSize: state.pageSize,
        statusFilter: state.statusFilter,
        levelFilter: state.levelFilter,
        typeFilter: state.typeFilter,
        searchKeyword: state.searchKeyword,
      }),
    }
  )
);
