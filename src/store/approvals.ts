import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Approval, ApprovalStatus, ApprovalType, Alert } from '@/types';
import { mockApprovals, mockInstitutions } from '@/mock/data';
import { useAuthStore } from '@/store/auth';
import { useAlertsStore } from '@/store/alerts';

type TabType = 'pending' | 'approved' | 'all';

interface ApprovalsState {
  allApprovals: Approval[];
  loading: boolean;
  page: number;
  pageSize: number;
  selectedApproval: Approval | null;
  
  activeTab: TabType;
  typeFilter: ApprovalType | 'all';
  statusFilter: ApprovalStatus | 'all';
  dateRange: [string, string] | null;
  searchKeyword: string;
  
  initApprovals: () => void;
  
  fetchApprovals: (params?: {
    page?: number;
    pageSize?: number;
    tab?: TabType;
    type?: ApprovalType | 'all';
    status?: ApprovalStatus | 'all';
    dateRange?: [string, string] | null;
    keyword?: string;
  }) => Promise<{ list: Approval[]; total: number }>;
  
  fetchApprovalById: (id: string) => Promise<void>;
  
  approveApproval: (id: string, comment: string, handlerName?: string) => Promise<boolean>;
  
  rejectApproval: (id: string, comment: string, handlerName?: string) => Promise<boolean>;
  
  createEscalationApproval: (alert: Alert, escalationReason: string, handlerName?: string) => Promise<Approval | null>;
  
  setActiveTab: (tab: TabType) => void;
  
  setFilters: (filters: Partial<{
    type: ApprovalType | 'all';
    status: ApprovalStatus | 'all';
    dateRange: [string, string] | null;
    keyword: string;
  }>) => void;
  
  setPagination: (page: number, pageSize: number) => void;
  
  getFilteredApprovals: () => Approval[];
  
  getStats: () => {
    total: number;
    pending: number;
    processing: number;
    approved: number;
    rejected: number;
  };
}

export const useApprovalsStore = create<ApprovalsState>()(
  persist(
    (set, get) => ({
      allApprovals: [],
      loading: false,
      page: 1,
      pageSize: 10,
      selectedApproval: null,
      
      activeTab: 'pending',
      typeFilter: 'all',
      statusFilter: 'all',
      dateRange: null,
      searchKeyword: '',

      initApprovals: () => {
        if (get().allApprovals.length === 0) {
          set({ allApprovals: [...mockApprovals] });
        }
      },

      fetchApprovals: async (params) => {
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, 300));

        get().initApprovals();

        const user = useAuthStore.getState().user;
        let result = [...get().allApprovals];

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

        const activeTab = params?.tab ?? get().activeTab;
        const type = params?.type ?? get().typeFilter;
        const status = params?.status ?? get().statusFilter;
        const dateRange = params?.dateRange ?? get().dateRange;
        const keyword = params?.keyword ?? get().searchKeyword;
        const page = params?.page ?? get().page;
        const pageSize = params?.pageSize ?? get().pageSize;

        if (activeTab === 'pending') {
          result = result.filter((a) =>
            a.status === 'pending_principal' ||
            a.status === 'pending_district' ||
            a.status === 'pending_city'
          );
        } else if (activeTab === 'approved') {
          result = result.filter((a) => a.status === 'approved' || a.status === 'rejected');
        }

        if (type && type !== 'all') {
          result = result.filter((a) => a.type === type);
        }
        if (status && status !== 'all') {
          result = result.filter((a) => a.status === status);
        }
        if (dateRange && dateRange[0] && dateRange[1]) {
          result = result.filter((a) => {
            const createdAt = new Date(a.createdAt).getTime();
            const start = new Date(dateRange[0]).getTime();
            const end = new Date(dateRange[1]).getTime() + 24 * 60 * 60 * 1000;
            return createdAt >= start && createdAt <= end;
          });
        }
        if (keyword) {
          result = result.filter(
            (a) =>
              a.institutionName.includes(keyword) || a.id.includes(keyword)
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

      fetchApprovalById: async (id) => {
        set({ loading: true });
        await new Promise((resolve) => setTimeout(resolve, 200));

        get().initApprovals();
        const approval = get().allApprovals.find((a) => a.id === id) || null;
        set({ selectedApproval: approval, loading: false });
      },

      approveApproval: async (id, comment, handlerName) => {
        await new Promise((resolve) => setTimeout(resolve, 400));

        get().initApprovals();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const operator = handlerName || '系统管理员';

        set((state) => {
          const newApprovals = state.allApprovals.map((a) => {
            if (a.id !== id) return a;

            const newStages = [...a.stages];
            const currentStageIdx = a.currentStage - 1;

            const historyRecord = {
              stage: a.currentStage,
              role: newStages[currentStageIdx]?.role || '',
              status: 'approved' as const,
              comment,
              handledAt: now,
              handlerName: operator,
            };

            const newProcessHistory = [...(a.processHistory || []), historyRecord];

            if (currentStageIdx < newStages.length) {
              newStages[currentStageIdx] = {
                ...newStages[currentStageIdx],
                status: 'approved',
                comment,
                handledAt: now,
                handlerName: operator,
              };
            }

            let newStatus: ApprovalStatus = a.status;
            let newCurrentStage = a.currentStage;

            if (a.currentStage < 3) {
              newCurrentStage = a.currentStage + 1;
              newStatus =
                a.currentStage === 1
                  ? 'pending_district'
                  : a.currentStage === 2
                  ? 'pending_city'
                  : a.status;
            } else {
              newStatus = 'approved';
            }

            return {
              ...a,
              status: newStatus,
              currentStage: newCurrentStage,
              stages: newStages,
              processHistory: newProcessHistory,
            };
          });

          const updated = newApprovals.find((a) => a.id === id) || null;

          if (updated && updated.alertId) {
            const alertUpdate: Partial<Alert> = {
              approvalStatus: updated.status,
              approvalResult: comment,
              approvalProcessedAt: now,
            };
            if (updated.status === 'approved') {
              alertUpdate.status = 'processing';
              alertUpdate.resolution = `升级审批已通过，${comment}`;
            }
            useAlertsStore.getState().updateAlert(updated.alertId, alertUpdate);
          }

          return {
            allApprovals: newApprovals,
            selectedApproval:
              state.selectedApproval?.id === id ? updated : state.selectedApproval,
          };
        });

        return true;
      },

      rejectApproval: async (id, comment, handlerName) => {
        await new Promise((resolve) => setTimeout(resolve, 400));

        get().initApprovals();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const operator = handlerName || '系统管理员';

        set((state) => {
          const newApprovals = state.allApprovals.map((a) => {
            if (a.id !== id) return a;

            const newStages = [...a.stages];
            const currentStageIdx = a.currentStage - 1;

            const historyRecord = {
              stage: a.currentStage,
              role: newStages[currentStageIdx]?.role || '',
              status: 'rejected' as const,
              comment,
              handledAt: now,
              handlerName: operator,
            };

            const newProcessHistory = [...(a.processHistory || []), historyRecord];

            if (currentStageIdx < newStages.length) {
              newStages[currentStageIdx] = {
                ...newStages[currentStageIdx],
                status: 'rejected' as const,
                comment,
                handledAt: now,
                handlerName: operator,
              };
            }

            const newStatus: ApprovalStatus = 'rejected';

            return {
              ...a,
              status: newStatus,
              stages: newStages,
              processHistory: newProcessHistory,
            };
          });

          const updated = newApprovals.find((a) => a.id === id) || null;

          if (updated && updated.alertId) {
            useAlertsStore.getState().updateAlert(updated.alertId, {
              approvalStatus: 'rejected',
              approvalResult: comment,
              approvalProcessedAt: now,
            });
          }

          return {
            allApprovals: newApprovals,
            selectedApproval:
              state.selectedApproval?.id === id ? updated : state.selectedApproval,
          };
        });

        return true;
      },

      createEscalationApproval: async (alert, escalationReason, handlerName) => {
        await new Promise((resolve) => setTimeout(resolve, 400));

        get().initApprovals();
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const newApproval: Approval = {
          id: `app_escalate_${Date.now()}`,
          alertId: alert.id,
          institutionId: alert.institutionId,
          institutionName: alert.institutionName,
          type: 'alert_escalation',
          status: 'pending_principal',
          currentStage: 1,
          stages: [
            {
              stage: 1,
              role: '园长确认',
              status: 'pending',
            },
            {
              stage: 2,
              role: '区卫健复核',
              status: 'pending',
            },
            {
              stage: 3,
              role: '市卫健委批准',
              status: 'pending',
            },
          ],
          createdAt: now,
          proposedAction: '预警升级审批',
          escalationReason,
          alertSnapshot: {
            id: alert.id,
            type: alert.type,
            level: alert.level,
            description: alert.description,
            threshold: alert.threshold,
            actualValue: alert.actualValue,
            triggeredAt: alert.triggeredAt,
          },
          processHistory: [],
        };

        set((state) => ({
          allApprovals: [newApproval, ...state.allApprovals],
        }));

        return newApproval;
      },

      setActiveTab: (tab) => {
        set({ activeTab: tab, page: 1 });
      },

      setFilters: (filters) => {
        set((state) => ({
          typeFilter: filters.type ?? state.typeFilter,
          statusFilter: filters.status ?? state.statusFilter,
          dateRange: filters.dateRange ?? state.dateRange,
          searchKeyword: filters.keyword ?? state.searchKeyword,
          page: 1,
        }));
      },

      setPagination: (page, pageSize) => {
        set({ page, pageSize });
      },

      getFilteredApprovals: () => {
        const {
          allApprovals,
          activeTab,
          typeFilter,
          statusFilter,
          dateRange,
          searchKeyword,
        } = get();

        const user = useAuthStore.getState().user;
        let result = [...allApprovals];

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

        if (activeTab === 'pending') {
          result = result.filter((a) =>
            a.status === 'pending_principal' ||
            a.status === 'pending_district' ||
            a.status === 'pending_city'
          );
        } else if (activeTab === 'approved') {
          result = result.filter(
            (a) => a.status === 'approved' || a.status === 'rejected'
          );
        }

        if (typeFilter && typeFilter !== 'all') {
          result = result.filter((a) => a.type === typeFilter);
        }
        if (statusFilter && statusFilter !== 'all') {
          result = result.filter((a) => a.status === statusFilter);
        }
        if (dateRange && dateRange[0] && dateRange[1]) {
          result = result.filter((a) => {
            const createdAt = new Date(a.createdAt).getTime();
            const start = new Date(dateRange[0]).getTime();
            const end = new Date(dateRange[1]).getTime() + 24 * 60 * 60 * 1000;
            return createdAt >= start && createdAt <= end;
          });
        }
        if (searchKeyword) {
          result = result.filter(
            (a) =>
              a.institutionName.includes(searchKeyword) ||
              a.id.includes(searchKeyword)
          );
        }

        return result;
      },

      getStats: () => {
        const filtered = get().getFilteredApprovals();
        return {
          total: filtered.length,
          pending: filtered.filter(
            (a) =>
              a.status === 'pending_principal' ||
              a.status === 'pending_district' ||
              a.status === 'pending_city'
          ).length,
          processing: filtered.filter(
            (a) =>
              a.status === 'pending_district' || a.status === 'pending_city'
          ).length,
          approved: filtered.filter((a) => a.status === 'approved').length,
          rejected: filtered.filter((a) => a.status === 'rejected').length,
        };
      },
    }),
    {
      name: 'approvals-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return null;
        }
        return persistedState;
      },
      partialize: (state) => ({
        allApprovals: state.allApprovals,
        activeTab: state.activeTab,
        typeFilter: state.typeFilter,
        statusFilter: state.statusFilter,
        dateRange: state.dateRange,
        searchKeyword: state.searchKeyword,
        page: state.page,
        pageSize: state.pageSize,
      }),
    }
  )
);
