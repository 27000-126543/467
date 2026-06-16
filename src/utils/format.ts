export function formatNumber(num: number, decimals = 0): string {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toFixed(decimals);
}

export function formatPercent(num: number, decimals = 1): string {
  return `${num.toFixed(decimals)}%`;
}

export function formatRatio(num: number): string {
  if (num === 0) return '0';
  return `1:${(1 / num).toFixed(1)}`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${formatDate(d)} ${hours}:${minutes}`;
}

export function getAlertLevelText(level: number): string {
  const map: Record<number, string> = {
    1: '一级预警',
    2: '二级预警',
    3: '三级预警',
  };
  return map[level] || '未知';
}

export function getAlertLevelColor(level: number): string {
  const map: Record<number, string> = {
    1: 'danger',
    2: 'warning',
    3: 'warning',
  };
  return map[level] || 'neutral';
}

export function getAlertTypeText(type: string): string {
  const map: Record<string, string> = {
    health_abnormal: '健康异常',
    teacher_ratio: '师生比',
    enrollment_shortfall: '招生缺口',
  };
  return map[type] || type;
}

export function getAlertStatusText(status: string): string {
  const map: Record<string, string> = {
    pending: '待处理',
    processing: '处理中',
    resolved: '已解决',
    escalated: '已升级',
  };
  return map[status] || status;
}

export function getAlertStatusColor(status: string): string {
  const map: Record<string, string> = {
    pending: 'danger',
    processing: 'warning',
    resolved: 'success',
    escalated: 'danger',
  };
  return map[status] || 'neutral';
}

export function getInstitutionTypeText(type: string): string {
  const map: Record<string, string> = {
    kindergarten: '幼儿园',
    nursery: '托儿所',
    preschool: '学前班',
    daycare: '托育中心',
  };
  return map[type] || type;
}

export function getInstitutionLevelText(level: string): string {
  const map: Record<string, string> = {
    demo: '示范园',
    first: '一级园',
    second: '二级园',
    third: '三级园',
  };
  return map[level] || level;
}

export function getInstitutionLevelColor(level: string): string {
  const map: Record<string, string> = {
    demo: 'success',
    first: 'info',
    second: 'warning',
    third: 'neutral',
  };
  return map[level] || 'neutral';
}

export function getInstitutionStatusText(status: string): string {
  const map: Record<string, string> = {
    normal: '正常',
    warning: '预警中',
    restricted: '限招中',
    closed: '已关闭',
  };
  return map[status] || status;
}

export function getInstitutionStatusColor(status: string): string {
  const map: Record<string, string> = {
    normal: 'success',
    warning: 'warning',
    restricted: 'danger',
    closed: 'neutral',
  };
  return map[status] || 'neutral';
}

export function getApprovalStatusText(status: string): string {
  const map: Record<string, string> = {
    pending_principal: '待园长确认',
    pending_district: '待区卫健复核',
    pending_city: '待市卫健委批准',
    approved: '已通过',
    rejected: '已驳回',
  };
  return map[status] || status;
}

export function getApprovalTypeText(type: string): string {
  const map: Record<string, string> = {
    class_adjustment: '班额调整',
    enrollment_suspension: '限停招收',
    alert_escalation: '预警升级',
  };
  return map[type] || type;
}

export function getRoleText(role: string): string {
  const map: Record<string, string> = {
    national: '国家级管理员',
    provincial: '省级管理员',
    municipal: '市级管理员',
    principal: '机构园长',
  };
  return map[role] || role;
}

export function getReportPeriodText(period: string): string {
  return period === 'week' ? '周报' : '月报';
}

export function getPriorityText(priority: string): string {
  const map: Record<string, string> = {
    high: '高优先级',
    medium: '中优先级',
    low: '低优先级',
  };
  return map[priority] || priority;
}

export function getPriorityColor(priority: string): string {
  const map: Record<string, string> = {
    high: 'danger',
    medium: 'warning',
    low: 'info',
  };
  return map[priority] || 'neutral';
}

export function getCategoryText(category: string): string {
  const map: Record<string, string> = {
    class_size: '班级规模',
    diet: '膳食方案',
    health: '健康管理',
    staffing: '人员配置',
  };
  return map[category] || category;
}

export function getSemesterText(semester: string): string {
  return semester === 'spring' ? '春季学期' : '秋季学期';
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.substring(0, length) + '...';
}

export function formatChange(value: number, suffix = '%'): { text: string; isPositive: boolean } {
  const isPositive = value >= 0;
  const sign = isPositive ? '+' : '';
  return {
    text: `${sign}${value.toFixed(1)}${suffix}`,
    isPositive,
  };
}
