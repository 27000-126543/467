import { create } from 'zustand';
import type { Approval, ApprovalStatus, ApprovalType, PaginatedResponse } from '@/types';
import { mockApprovals } from '@/mock/data';

type TabType = 'pending' | 'approved' | 'all';

interface ApprovalsState {
  loading: boolean;
  approvals: Approval[];
  total: number;
  page: number;
  pageSize: number;
  selectedApproval: Approval | null;
  
  activeTab: TabType;
  typeFilter: ApprovalType | 'all';
  statusFilter: ApprovalStatus | 'all';
  dateRange: [string, string] | null;
  searchKeyword: string;
  
  fetchApprovals: (params?: {
    page?: number;
    pageSize?: number;
    tab?: TabType;
    type?: ApprovalType | 'all';
    status?: ApprovalStatus | 'all';
    dateRange?: [string, string] | null;
    keyword?: string;
  }) => Promise<void>;
  
  fetchApprovalById: (id: string) => Promise<void>;
  
  approveApproval: (id: string, comment: string) => Promise<boolean>;
  
  rejectApproval: (id: string, comment: string) => Promise<boolean>;
  
  setActiveTab: (tab: TabType) => void;
  
  setFilters: (filters: Partial<{
    type: ApprovalType | 'all';
    status: ApprovalStatus | 'all';
    dateRange: [string, string] | null;
    keyword: string;
  }>) => void;
  
  setPagination: (page: number, pageSize: number) => void;
  
  getStats: () => {
    total: number;
    pending: number;
    processing: number;
    approved: number;
    rejected: number;
  };
}

export const useApprovalsStore = create<ApprovalsState>((set, get) => ({
  loading: false,
  approvals: mockApprovals,
  total: mockApprovals.length,
  page: 1,
  pageSize: 10,
  selectedApproval: null,
  
  activeTab: 'pending',
  typeFilter: 'all',
  statusFilter: 'all',
  dateRange: null,
  searchKeyword: '',

  fetchApprovals: async (params) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 400));
    
    let result = [...mockApprovals];
    
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
      result = result.filter((a) => 
        a.institutionName.includes(keyword) || 
        a.id.includes(keyword)
      );
    }
    
    const total = result.length;
    const start = (page - 1) * pageSize;
    const list = result.slice(start, start + pageSize);
    
    set({
      approvals: list,
      total,
      page,
      pageSize,
      loading: false,
    });
  },

  fetchApprovalById: async (id) => {
    set({ loading: true });
    await new Promise((resolve) => setTimeout(resolve, 300));
    
    const approval = mockApprovals.find((a) => a.id === id) || null;
    set({ selectedApproval: approval, loading: false });
  },

  approveApproval: async (id, comment) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    set((state) => ({
      approvals: state.approvals.map((a) => {
        if (a.id !== id) return a;
        
        const newStages = [...a.stages];
        const currentStageIdx = a.currentStage - 1;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        if (currentStageIdx < newStages.length) {
          newStages[currentStageIdx] = {
            ...newStages[currentStageIdx],
            status: 'approved',
            comment,
            handledAt: now,
          };
        }
        
        let newStatus: ApprovalStatus = a.status;
        let newCurrentStage = a.currentStage;
        
        if (a.currentStage < 3) {
          newCurrentStage = a.currentStage + 1;
          newStatus = a.currentStage === 1 ? 'pending_district' : 
                     a.currentStage === 2 ? 'pending_city' : a.status;
        } else {
          newStatus = 'approved';
        }
        
        return {
          ...a,
          status: newStatus,
          currentStage: newCurrentStage,
          stages: newStages,
        };
      }),
    }));
    
    return true;
  },

  rejectApproval: async (id, comment) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    
    set((state) => ({
      approvals: state.approvals.map((a) => {
        if (a.id !== id) return a;
        
        const newStages = [...a.stages];
        const currentStageIdx = a.currentStage - 1;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
        
        if (currentStageIdx < newStages.length) {
          newStages[currentStageIdx] = {
            ...newStages[currentStageIdx],
            status: 'rejected',
            comment,
            handledAt: now,
          };
        }
        
        return {
          ...a,
          status: 'rejected',
          stages: newStages,
        };
      }),
    }));
    
    return true;
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

  getStats: () => {
    const allApprovals = mockApprovals;
    return {
      total: allApprovals.length,
      pending: allApprovals.filter((a) => 
        a.status === 'pending_principal' || 
        a.status === 'pending_district' || 
        a.status === 'pending_city'
      ).length,
      processing: allApprovals.filter((a) => 
        a.status === 'pending_district' || 
        a.status === 'pending_city'
      ).length,
      approved: allApprovals.filter((a) => a.status === 'approved').length,
      rejected: allApprovals.filter((a) => a.status === 'rejected').length,
    };
  },
}));
