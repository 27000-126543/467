import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { EnrollmentPlan, EnrollmentForecast, EnrollmentPlanPreview, EnrollmentPlanPreviewItem, EnrollmentSummary, EnrollmentSummaryItem, InstitutionType } from '@/types';
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
  previewData: EnrollmentPlanPreview | null;

  initPlans: () => void;
  fetchPlans: () => Promise<{ list: EnrollmentPlan[]; total: number }>;
  fetchPlanDetail: (id: string) => Promise<void>;
  setSearchKeyword: (keyword: string) => void;
  setYearFilter: (year: number | null) => void;
  setSemesterFilter: (semester: string | null) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  previewPlan: (rawData: Record<string, any>[]) => EnrollmentPlanPreview;
  confirmImport: () => Promise<{ success: boolean; message?: string }>;
  clearPreview: () => void;
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
  getSummary: () => EnrollmentSummary;
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
      previewData: null,

      initPlans: () => {
        if (get().allPlans.length === 0) {
          set({ allPlans: [...mockEnrollmentPlans] });
        }
      },

      previewPlan: (rawData) => {
        const existingCombinations = new Set(
          get().allPlans.map((p) => `${p.institutionName}-${p.year}`)
        );
        const previewCombinations = new Set<string>();

        const items: EnrollmentPlanPreviewItem[] = rawData.map((row, index) => {
          const institutionName = String(row['机构名称'] || row['institutionName'] || '').trim();
          const yearStr = String(row['年度'] || row['year'] || '').trim();
          const plannedCapacityStr = String(row['计划学位'] || row['plannedCapacity'] || '').trim();

          const year = yearStr ? parseInt(yearStr, 10) : 0;
          const plannedCapacity = plannedCapacityStr ? parseFloat(plannedCapacityStr) : null;

          const errors: string[] = [];
          const warnings: string[] = [];

          if (!institutionName) {
            errors.push('机构名称不能为空');
          }

          if (isNaN(year) || year < 2020 || year > 2030) {
            errors.push('年度必须是2020-2030之间的数字');
          }

          if (plannedCapacity === null || isNaN(plannedCapacity) || plannedCapacity < 0) {
            errors.push('计划学位必须是非负数字');
          }

          const matchedInstitution = institutionName
            ? mockInstitutions.find((inst) => inst.name === institutionName) || null
            : null;

          const isNewInstitution = institutionName ? !matchedInstitution : false;

          if (institutionName && !matchedInstitution) {
            warnings.push('该机构为新机构，导入后需完善机构信息');
          }

          const combination = `${institutionName}-${year}`;
          if (institutionName && !isNaN(year)) {
            if (existingCombinations.has(combination)) {
              warnings.push('该机构该年度计划已存在，将更新原有数据');
            }
            if (previewCombinations.has(combination)) {
              errors.push('导入文件中存在重复的机构年度组合');
            }
            previewCombinations.add(combination);
          }

          return {
            index: index + 1,
            institutionName,
            year,
            plannedCapacity,
            matchedInstitution: matchedInstitution
              ? {
                  id: matchedInstitution.id,
                  name: matchedInstitution.name,
                  type: matchedInstitution.type,
                }
              : null,
            isNewInstitution,
            errors,
            warnings,
            rawData: row,
          };
        });

        const validCount = items.filter((item) => item.errors.length === 0).length;
        const invalidCount = items.filter((item) => item.errors.length > 0).length;
        const warningCount = items.filter((item) => item.warnings.length > 0).length;
        const hasErrors = invalidCount > 0;

        const preview: EnrollmentPlanPreview = {
          items,
          validCount,
          invalidCount,
          warningCount,
          hasErrors,
        };

        set({ previewData: preview });
        return preview;
      },

      confirmImport: async () => {
        const preview = get().previewData;
        if (!preview) {
          return { success: false, message: '没有预览数据' };
        }

        await new Promise((resolve) => setTimeout(resolve, 800));

        get().initPlans();
        const user = useAuthStore.getState().user;
        const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

        const validItems = preview.items.filter((item) => item.errors.length === 0);

        const processedPlans: EnrollmentPlan[] = validItems.map((item) => {
          const basePlan: EnrollmentPlan = {
            id: `plan_${Date.now()}_${item.index}`,
            institutionName: item.institutionName,
            institutionId: item.matchedInstitution?.id || '',
            year: item.year,
            semester: 'spring',
            plannedCapacity: item.plannedCapacity as number,
            actualEnrollment: Math.floor((item.plannedCapacity as number) * (0.85 + Math.random() * 0.1)),
            enrollmentRate: 85 + Math.random() * 10,
            forecast: generateForecast(item.plannedCapacity as number),
            createdAt: now,
            updatedAt: now,
          };

          if (item.matchedInstitution) {
            const matched = mockInstitutions.find((inst) => inst.id === item.matchedInstitution!.id);
            return {
              ...basePlan,
              institutionId: item.matchedInstitution.id,
              address: matched
                ? {
                    province: matched.address.province,
                    city: matched.address.city,
                    district: matched.address.district,
                  }
                : undefined,
              isNewInstitution: false,
            };
          } else {
            return {
              ...basePlan,
              uploadedByUserId: user?.id,
              uploadedByRegion: user?.region
                ? {
                    province: user.region.province,
                    city: user.region.city,
                    district: user.region.district,
                  }
                : undefined,
              isNewInstitution: true,
            };
          }
        });

        set((state) => {
          const existingCombinations = new Map(
            state.allPlans.map((p) => [`${p.institutionName}-${p.year}`, p.id])
          );

          const newPlans = processedPlans.filter((p) => {
            const key = `${p.institutionName}-${p.year}`;
            return !existingCombinations.has(key);
          });

          const updatedPlans = state.allPlans.map((p) => {
            const key = `${p.institutionName}-${p.year}`;
            const matching = processedPlans.find((pp) => `${pp.institutionName}-${pp.year}` === key);
            if (matching) {
              return {
                ...p,
                plannedCapacity: matching.plannedCapacity,
                actualEnrollment: matching.actualEnrollment,
                enrollmentRate: matching.enrollmentRate,
                forecast: matching.forecast,
                updatedAt: now,
              };
            }
            return p;
          });

          return {
            allPlans: [...newPlans, ...updatedPlans],
            previewData: null,
          };
        });

        return {
          success: true,
          message: `导入成功，新增 ${validItems.length - (preview.items.length - preview.validCount)} 条，更新 ${preview.items.length - preview.validCount} 条`,
        };
      },

      clearPreview: () => {
        set({ previewData: null });
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
        const user = useAuthStore.getState().user;

        const processedPlans = plans.map((plan) => {
          const matchedInstitution = mockInstitutions.find(
            (inst) => inst.name === plan.institutionName
          );

          if (matchedInstitution) {
            return {
              ...plan,
              institutionId: matchedInstitution.id,
              address: {
                province: matchedInstitution.address.province,
                city: matchedInstitution.address.city,
                district: matchedInstitution.address.district,
              },
              isNewInstitution: false,
            };
          } else {
            return {
              ...plan,
              address: plan.address || {},
              uploadedByUserId: user?.id,
              uploadedByRegion: user?.region
                ? {
                    province: user.region.province,
                    city: user.region.city,
                    district: user.region.district,
                  }
                : undefined,
              isNewInstitution: true,
            };
          }
        });

        set((state) => {
          const existingIds = new Set(state.allPlans.map((p) => p.id));
          const newPlans = processedPlans.filter((p) => !existingIds.has(p.id));
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
        const user = useAuthStore.getState().user;

        const matchedInstitution = mockInstitutions.find(
          (inst) => inst.name === plan.institutionName
        );

        let processedPlan = { ...plan };

        if (matchedInstitution) {
          processedPlan = {
            ...processedPlan,
            institutionId: matchedInstitution.id,
            address: {
              province: matchedInstitution.address.province,
              city: matchedInstitution.address.city,
              district: matchedInstitution.address.district,
            },
            isNewInstitution: false,
          };
        } else {
          processedPlan = {
            ...processedPlan,
            address: processedPlan.address || {},
            uploadedByUserId: user?.id,
            uploadedByRegion: user?.region
              ? {
                  province: user.region.province,
                  city: user.region.city,
                  district: user.region.district,
                }
              : undefined,
            isNewInstitution: true,
          };
        }

        set((state) => ({
          allPlans: [processedPlan, ...state.allPlans],
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
          result = result.filter((p) => {
            if (user.region.institutionId) {
              return p.institutionId === user.region.institutionId;
            }

            const matchedInstitution = mockInstitutions.find(
              (inst) => inst.id === p.institutionId
            );

            let planProvince: string | undefined;
            let planCity: string | undefined;

            if (matchedInstitution) {
              planProvince = matchedInstitution.address.province;
              planCity = matchedInstitution.address.city;
            } else if (p.address) {
              planProvince = p.address.province;
              planCity = p.address.city;
            }

            if (!planProvince && p.uploadedByRegion) {
              planProvince = p.uploadedByRegion.province;
              planCity = p.uploadedByRegion.city;
            }

            if (p.isNewInstitution && p.uploadedByUserId === user.id) {
              return true;
            }

            if (p.uploadedByRegion) {
              const userProvince = user.region.province;
              const userCity = user.region.city;
              const uploadProvince = p.uploadedByRegion.province;
              const uploadCity = p.uploadedByRegion.city;

              if (userProvince && uploadProvince !== userProvince) {
                return false;
              }
              if (userCity && uploadCity !== userCity) {
                return false;
              }
              return true;
            }

            if (user.region.province && planProvince !== user.region.province) {
              return false;
            }
            if (user.region.city && planCity !== user.region.city) {
              return false;
            }

            return true;
          });
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

      getSummary: () => {
        const filtered = get().getFilteredPlans();

        const totalInstitutions = filtered.length;
        const totalPlannedCapacity = filtered.reduce((sum, p) => sum + p.plannedCapacity, 0);
        const totalActualEnrollment = filtered.reduce((sum, p) => sum + p.actualEnrollment, 0);
        const avgEnrollmentRate = totalInstitutions > 0
          ? parseFloat((filtered.reduce((sum, p) => sum + p.enrollmentRate, 0) / totalInstitutions).toFixed(1))
          : 0;
        const totalGap90Days = filtered.reduce((sum, plan) => {
          const latestGap = plan.forecast[plan.forecast.length - 1]?.projectedGap || 0;
          return sum + latestGap;
        }, 0);

        const regionMap = new Map<string, EnrollmentSummaryItem>();
        const typeMap = new Map<string, EnrollmentSummaryItem>();

        filtered.forEach((plan) => {
          const matchedInstitution = mockInstitutions.find(
            (inst) => inst.id === plan.institutionId
          );

          let region = '未知区域';
          let type: InstitutionType = 'kindergarten';

          if (matchedInstitution) {
            const user = useAuthStore.getState().user;
            if (user?.role === 'national') {
              region = matchedInstitution.address.province || '未知';
            } else if (user?.role === 'provincial') {
              region = matchedInstitution.address.city || '未知';
            } else {
              region = matchedInstitution.address.district || '未知';
            }
            type = matchedInstitution.type;
          } else if (plan.uploadedByRegion) {
            const user = useAuthStore.getState().user;
            if (user?.role === 'national') {
              region = plan.uploadedByRegion.province || '未知';
            } else if (user?.role === 'provincial') {
              region = plan.uploadedByRegion.city || '未知';
            } else {
              region = plan.uploadedByRegion.district || '未知';
            }
          }

          const gap = plan.forecast[plan.forecast.length - 1]?.projectedGap || 0;

          if (!regionMap.has(region)) {
            regionMap.set(region, {
              region,
              type,
              institutionCount: 0,
              plannedCapacity: 0,
              actualEnrollment: 0,
              enrollmentRate: 0,
              gap90Days: 0,
            });
          }
          const regionItem = regionMap.get(region)!;
          regionItem.institutionCount += 1;
          regionItem.plannedCapacity += plan.plannedCapacity;
          regionItem.actualEnrollment += plan.actualEnrollment;
          regionItem.gap90Days += gap;

          const typeKey = type;
          if (!typeMap.has(typeKey)) {
            typeMap.set(typeKey, {
              region: '',
              type,
              institutionCount: 0,
              plannedCapacity: 0,
              actualEnrollment: 0,
              enrollmentRate: 0,
              gap90Days: 0,
            });
          }
          const typeItem = typeMap.get(typeKey)!;
          typeItem.institutionCount += 1;
          typeItem.plannedCapacity += plan.plannedCapacity;
          typeItem.actualEnrollment += plan.actualEnrollment;
          typeItem.gap90Days += gap;
        });

        const byRegion = Array.from(regionMap.values()).map((item) => ({
          ...item,
          enrollmentRate: item.plannedCapacity > 0
            ? parseFloat(((item.actualEnrollment / item.plannedCapacity) * 100).toFixed(1))
            : 0,
        }));

        const byType = Array.from(typeMap.values()).map((item) => ({
          ...item,
          enrollmentRate: item.plannedCapacity > 0
            ? parseFloat(((item.actualEnrollment / item.plannedCapacity) * 100).toFixed(1))
            : 0,
        }));

        return {
          totalInstitutions,
          totalPlannedCapacity,
          totalActualEnrollment,
          avgEnrollmentRate,
          totalGap90Days,
          byRegion,
          byType,
        };
      },
    }),
    {
      name: 'enrollment-storage',
      version: 2,
      migrate: (persistedState: any, version: number) => {
        if (version < 2) {
          return null;
        }
        return persistedState;
      },
      partialize: (state) => ({ allPlans: state.allPlans, previewData: null }),
    }
  )
);

export { generateForecast };
