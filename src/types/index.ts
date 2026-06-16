export type UserRole = 'national' | 'provincial' | 'municipal' | 'principal';

export interface User {
  id: string;
  username: string;
  name: string;
  role: UserRole;
  region: {
    province?: string;
    city?: string;
    district?: string;
    institutionId?: string;
  };
  avatar?: string;
  permissions: string[];
}

export type InstitutionLevel = 'demo' | 'first' | 'second' | 'third';
export type InstitutionStatus = 'normal' | 'warning' | 'restricted' | 'closed';

export interface Institution {
  id: string;
  name: string;
  level: InstitutionLevel;
  address: {
    province: string;
    city: string;
    district: string;
    detail: string;
  };
  location: {
    lng: number;
    lat: number;
  };
  capacity: number;
  teacherCount: number;
  studentCount: number;
  establishedDate: string;
  status: InstitutionStatus;
  contactPerson: string;
  contactPhone: string;
}

export interface AttendanceData {
  total: number;
  present: number;
  absent: number;
  rate: number;
}

export interface HealthAbnormalDetails {
  fever: number;
  cough: number;
  diarrhea: number;
  other: number;
}

export interface HealthData {
  totalChecked: number;
  abnormalCount: number;
  abnormalRate: number;
  abnormalDetails: HealthAbnormalDetails;
}

export interface DietData {
  breakfastRemaining: number;
  lunchRemaining: number;
  dinnerRemaining: number;
  avgRemainingRate: number;
  nutritionComplianceRate: number;
}

export interface SleepData {
  avgDuration: number;
  complianceRate: number;
}

export interface ActivityData {
  avgSteps: number;
  activityLevel: 'low' | 'medium' | 'high';
}

export interface RealtimeData {
  institutionId: string;
  institutionName: string;
  timestamp: string;
  attendance: AttendanceData;
  health: HealthData;
  diet: DietData;
  sleep: SleepData;
  activity: ActivityData;
}

export type PeriodType = 'day' | 'week' | 'month';

export interface AggregatedMetrics {
  regionCode: string;
  regionName: string;
  period: PeriodType;
  periodStart: string;
  periodEnd: string;
  attendanceRate: number;
  healthAbnormalRate: number;
  nutritionComplianceRate: number;
  teacherStudentRatio: number;
  attendanceStabilityIndex: number;
  institutionCount: number;
  totalStudents: number;
  totalTeachers: number;
}

export type AlertType = 'health_abnormal' | 'teacher_ratio' | 'enrollment_shortfall';
export type AlertLevel = 1 | 2 | 3;
export type AlertStatus = 'pending' | 'processing' | 'resolved' | 'escalated';

export interface Alert {
  id: string;
  institutionId: string;
  institutionName: string;
  type: AlertType;
  level: AlertLevel;
  status: AlertStatus;
  triggeredAt: string;
  threshold: number;
  actualValue: number;
  consecutiveDays: number;
  handlerId?: string;
  handlerName?: string;
  resolvedAt?: string;
  resolution?: string;
  description: string;
}

export type ApprovalType = 'class_adjustment' | 'enrollment_suspension';
export type ApprovalStatus = 
  | 'pending_principal' 
  | 'pending_district' 
  | 'pending_city' 
  | 'approved' 
  | 'rejected';

export interface ApprovalStage {
  stage: number;
  role: string;
  status: 'pending' | 'approved' | 'rejected';
  handlerId?: string;
  handlerName?: string;
  comment?: string;
  handledAt?: string;
}

export interface Approval {
  id: string;
  alertId: string;
  institutionId: string;
  institutionName: string;
  type: ApprovalType;
  status: ApprovalStatus;
  currentStage: number;
  stages: ApprovalStage[];
  createdAt: string;
  proposedAction: string;
  expectedEffect?: string;
}

export type SemesterType = 'spring' | 'autumn';

export interface EnrollmentForecast {
  date: string;
  projectedDemand: number;
  projectedSupply: number;
  projectedGap: number;
}

export interface EnrollmentPlan {
  id: string;
  institutionId: string;
  institutionName: string;
  year: number;
  semester: SemesterType;
  plannedCapacity: number;
  actualEnrollment: number;
  enrollmentRate: number;
  forecast: EnrollmentForecast[];
}

export type ReportPeriod = 'week' | 'month';

export interface ReportMetricsItem {
  value: number;
  yoy: number;
  mom: number;
}

export interface ReportMetrics {
  attendanceRate: ReportMetricsItem;
  healthAbnormalRate: ReportMetricsItem;
  teacherStudentRatio: ReportMetricsItem;
  nutritionComplianceRate: ReportMetricsItem;
}

export interface HealthAbnormalReason {
  reason: string;
  count: number;
  percentage: number;
}

export interface TeacherRatioRanking {
  rank: number;
  institutionName: string;
  ratio: number;
  level: InstitutionLevel;
}

export interface ReportAnalysis {
  healthAbnormalReasons: HealthAbnormalReason[];
  teacherRatioRanking: TeacherRatioRanking[];
  attendanceTrend: { date: string; rate: number }[];
}

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory = 'class_size' | 'diet' | 'health' | 'staffing';

export interface ReportRecommendation {
  id: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  content: string;
  expectedImpact: string;
}

export interface OperationReport {
  id: string;
  regionCode: string;
  regionName: string;
  period: ReportPeriod;
  periodStart: string;
  periodEnd: string;
  metrics: ReportMetrics;
  analysis: ReportAnalysis;
  recommendations: ReportRecommendation[];
  generatedAt: string;
}

export interface HeatmapPoint {
  name: string;
  value: number;
  geo: [number, number];
  level?: string;
}

export interface PaginationParams {
  page: number;
  pageSize: number;
}

export interface PaginatedResponse<T> {
  list: T[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AlertConfig {
  healthAbnormalThreshold: number;
  healthAbnormalConsecutiveDays: number;
  teacherRatioStandard: number;
  enrollmentShortfallThreshold: number;
  escalationDays: number;
}

export interface RegionOption {
  code: string;
  name: string;
  children?: RegionOption[];
}
