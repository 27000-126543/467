import type { User, Institution, Alert, Approval, EnrollmentPlan, OperationReport } from '@/types';
import { mockInstitutions } from '@/mock/data';

function getInstitutionIdsByRegion(region: { province?: string; city?: string; institutionId?: string }): string[] {
  let result = [...mockInstitutions];

  if (region.province) {
    result = result.filter((i) => i.address.province === region.province);
  }
  if (region.city) {
    result = result.filter((i) => i.address.city === region.city);
  }
  if (region.institutionId) {
    result = result.filter((i) => i.id === region.institutionId);
  }

  return result.map((i) => i.id);
}

export function filterInstitutionsByUser(
  institutions: Institution[],
  user: User | null
): Institution[] {
  if (!user) return [];
  if (user.role === 'national') return institutions;

  let result = [...institutions];

  if (user.region.province) {
    result = result.filter((i) => i.address.province === user.region.province);
  }
  if (user.region.city) {
    result = result.filter((i) => i.address.city === user.region.city);
  }
  if (user.region.institutionId) {
    result = result.filter((i) => i.id === user.region.institutionId);
  }

  return result;
}

export function filterAlertsByUser(alerts: Alert[], user: User | null): Alert[] {
  if (!user) return [];
  if (user.role === 'national') return alerts;

  const instIds = getInstitutionIdsByRegion(user.region);
  return alerts.filter((a) => instIds.includes(a.institutionId));
}

export function filterApprovalsByUser(approvals: Approval[], user: User | null): Approval[] {
  if (!user) return [];
  if (user.role === 'national') return approvals;

  const instIds = getInstitutionIdsByRegion(user.region);
  return approvals.filter((a) => instIds.includes(a.institutionId));
}

export function filterEnrollmentPlansByUser(
  plans: EnrollmentPlan[],
  user: User | null
): EnrollmentPlan[] {
  if (!user) return [];
  if (user.role === 'national') return plans;

  const instIds = getInstitutionIdsByRegion(user.region);
  return plans.filter((p) => instIds.includes(p.institutionId));
}

export function filterReportsByUser(
  reports: OperationReport[],
  user: User | null
): OperationReport[] {
  if (!user) return [];
  if (user.role === 'national') return reports;

  return reports.filter((r) => {
    if (user.region.province && r.regionCode === user.region.province) return true;
    if (user.region.city && r.regionCode === user.region.city) return true;
    return false;
  });
}
