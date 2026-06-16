import type {
  User,
  Institution,
  RealtimeData,
  AggregatedMetrics,
  Alert,
  Approval,
  EnrollmentPlan,
  OperationReport,
  HeatmapPoint,
  AlertConfig,
  RegionOption,
} from '@/types';

export const mockUsers: User[] = [
  {
    id: 'u001',
    username: 'admin_national',
    name: '国家卫健管理员',
    role: 'national',
    region: {},
    permissions: ['dashboard:view', 'alerts:view', 'approvals:view', 'reports:view', 'settings:manage'],
  },
  {
    id: 'u002',
    username: 'admin_province',
    name: '广东省卫健管理员',
    role: 'provincial',
    region: { province: '广东省' },
    permissions: ['dashboard:view', 'alerts:view', 'approvals:view', 'reports:view'],
  },
  {
    id: 'u003',
    username: 'admin_city',
    name: '深圳市卫健管理员',
    role: 'municipal',
    region: { province: '广东省', city: '深圳市' },
    permissions: ['dashboard:view', 'alerts:view', 'alerts:process', 'approvals:view', 'approvals:approve', 'reports:view'],
  },
  {
    id: 'u004',
    username: 'principal01',
    name: '阳光幼儿园张园长',
    role: 'principal',
    region: { province: '广东省', city: '深圳市', institutionId: 'inst001' },
    permissions: ['dashboard:view', 'alerts:view', 'alerts:process', 'approvals:view', 'reports:view', 'enrollment:manage'],
  },
];

const provinces = [
  { name: '北京市', cities: ['北京市'] },
  { name: '上海市', cities: ['上海市'] },
  { name: '广东省', cities: ['广州市', '深圳市', '东莞市', '佛山市', '珠海市'] },
  { name: '江苏省', cities: ['南京市', '苏州市', '无锡市', '常州市', '南通市'] },
  { name: '浙江省', cities: ['杭州市', '宁波市', '温州市', '绍兴市', '嘉兴市'] },
  { name: '山东省', cities: ['济南市', '青岛市', '烟台市', '潍坊市', '淄博市'] },
  { name: '四川省', cities: ['成都市', '绵阳市', '德阳市', '宜宾市', '泸州市'] },
  { name: '湖北省', cities: ['武汉市', '宜昌市', '襄阳市', '荆州市', '黄冈市'] },
  { name: '湖南省', cities: ['长沙市', '株洲市', '湘潭市', '衡阳市', '岳阳市'] },
  { name: '河南省', cities: ['郑州市', '洛阳市', '开封市', '新乡市', '焦作市'] },
  { name: '河北省', cities: ['石家庄市', '唐山市', '秦皇岛市', '邯郸市', '保定市'] },
  { name: '辽宁省', cities: ['沈阳市', '大连市', '鞍山市', '抚顺市', '本溪市'] },
  { name: '陕西省', cities: ['西安市', '咸阳市', '宝鸡市', '渭南市', '铜川市'] },
  { name: '福建省', cities: ['福州市', '厦门市', '泉州市', '漳州市', '莆田市'] },
  { name: '安徽省', cities: ['合肥市', '芜湖市', '蚌埠市', '淮南市', '马鞍山市'] },
];

const institutionLevels: Array<{ label: string; value: Institution['level'] }> = [
  { label: '示范园', value: 'demo' },
  { label: '一级园', value: 'first' },
  { label: '二级园', value: 'second' },
  { label: '三级园', value: 'third' },
];

const institutionTypes: Array<{ label: string; value: Institution['type'] }> = [
  { label: '幼儿园', value: 'kindergarten' },
  { label: '托儿所', value: 'nursery' },
  { label: '学前班', value: 'preschool' },
  { label: '托育中心', value: 'daycare' },
];

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 2): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomItem<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateId(prefix: string, index: number): string {
  return `${prefix}${String(index).padStart(3, '0')}`;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDateTime(date: Date): string {
  return date.toISOString().replace('T', ' ').substring(0, 19);
}

export const regionOptions: RegionOption[] = provinces.map((p) => ({
  code: p.name,
  name: p.name,
  children: p.cities.map((c) => ({
    code: c,
    name: c,
  })),
}));

export function generateInstitutions(count = 50): Institution[] {
  const institutions: Institution[] = [];
  let index = 1;

  for (const prov of provinces) {
    for (const city of prov.cities) {
      const cityCount = Math.floor(count / provinces.length / prov.cities.length) + randomInt(1, 3);
      
      for (let i = 0; i < cityCount && index <= count; i++) {
        const level = randomItem(institutionLevels);
        const capacity = level.value === 'demo' ? randomInt(300, 500) :
                        level.value === 'first' ? randomInt(200, 350) :
                        level.value === 'second' ? randomInt(100, 200) :
                        randomInt(50, 120);
        
        const studentCount = Math.floor(capacity * randomFloat(0.7, 0.95));
        const teacherCount = Math.floor(studentCount / randomFloat(5, 8));

        const type = randomItem(institutionTypes);
        institutions.push({
          id: generateId('inst', index),
          name: `${city}${['阳光', '星星', '智慧树', '小天使', '快乐童年', '金宝贝', '爱婴', '新苗'][randomInt(0, 7)]}${type.label}`,
          type: type.value,
          level: level.value,
          address: {
            province: prov.name,
            city,
            district: ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'][randomInt(0, 4)],
            detail: `${['中山路', '人民路', '建设路', '解放路', '文化路'][randomInt(0, 4)]}${randomInt(1, 999)}号`,
          },
          location: {
            lng: randomFloat(100, 122, 4),
            lat: randomFloat(22, 40, 4),
          },
          capacity,
          teacherCount,
          studentCount,
          establishedDate: `${randomInt(2000, 2023)}-${String(randomInt(1, 12)).padStart(2, '0')}-${String(randomInt(1, 28)).padStart(2, '0')}`,
          status: Math.random() > 0.85 ? 'warning' : 'normal',
          contactPerson: ['王老师', '李主任', '张园长', '刘老师', '陈老师'][randomInt(0, 4)],
          contactPhone: `138${String(randomInt(10000000, 99999999))}`,
        });
        index++;
      }
    }
  }

  return institutions;
}

export const mockInstitutions = generateInstitutions(100);

export function generateRealtimeData(institutions: Institution[]): RealtimeData[] {
  return institutions.map((inst) => {
    const attendanceRate = randomFloat(85, 99);
    const total = inst.studentCount;
    const present = Math.floor(total * attendanceRate / 100);
    const abnormalRate = randomFloat(1, 8);
    const abnormalCount = Math.floor(present * abnormalRate / 100);

    return {
      institutionId: inst.id,
      institutionName: inst.name,
      timestamp: formatDateTime(new Date()),
      attendance: {
        total,
        present,
        absent: total - present,
        rate: parseFloat(attendanceRate.toFixed(2)),
      },
      health: {
        totalChecked: present,
        abnormalCount,
        abnormalRate: parseFloat(abnormalRate.toFixed(2)),
        abnormalDetails: {
          fever: Math.floor(abnormalCount * 0.3),
          cough: Math.floor(abnormalCount * 0.4),
          diarrhea: Math.floor(abnormalCount * 0.15),
          other: Math.ceil(abnormalCount * 0.15),
        },
      },
      diet: {
        breakfastRemaining: randomFloat(5, 15),
        lunchRemaining: randomFloat(3, 12),
        dinnerRemaining: randomFloat(4, 14),
        avgRemainingRate: randomFloat(4, 14),
        nutritionComplianceRate: randomFloat(85, 98),
      },
      sleep: {
        avgDuration: randomFloat(1.5, 3),
        complianceRate: randomFloat(80, 95),
      },
      activity: {
        avgSteps: randomInt(3000, 8000),
        activityLevel: randomItem(['low', 'medium', 'high']),
      },
    };
  });
}

export const mockRealtimeData = generateRealtimeData(mockInstitutions);

export function generateNationalMetrics(): AggregatedMetrics {
  const totalStudents = mockInstitutions.reduce((sum, inst) => sum + inst.studentCount, 0);
  const totalTeachers = mockInstitutions.reduce((sum, inst) => sum + inst.teacherCount, 0);

  return {
    regionCode: 'national',
    regionName: '全国',
    period: 'day',
    periodStart: formatDate(new Date()),
    periodEnd: formatDate(new Date()),
    attendanceRate: randomFloat(90, 96),
    healthAbnormalRate: randomFloat(2, 5),
    nutritionComplianceRate: randomFloat(88, 95),
    teacherStudentRatio: parseFloat((totalTeachers / totalStudents).toFixed(3)),
    attendanceStabilityIndex: randomFloat(92, 98),
    institutionCount: mockInstitutions.length,
    totalStudents,
    totalTeachers,
  };
}

export function generateProvinceMetrics(): AggregatedMetrics[] {
  return provinces.map((prov) => {
    const provInstitutions = mockInstitutions.filter((i) => i.address.province === prov.name);
    const totalStudents = provInstitutions.reduce((sum, inst) => sum + inst.studentCount, 0);
    const totalTeachers = provInstitutions.reduce((sum, inst) => sum + inst.teacherCount, 0);

    return {
      regionCode: prov.name,
      regionName: prov.name,
      period: 'day',
      periodStart: formatDate(new Date()),
      periodEnd: formatDate(new Date()),
      attendanceRate: randomFloat(88, 97),
      healthAbnormalRate: randomFloat(1.5, 6),
      nutritionComplianceRate: randomFloat(85, 97),
      teacherStudentRatio: totalStudents > 0 ? parseFloat((totalTeachers / totalStudents).toFixed(3)) : 0.125,
      attendanceStabilityIndex: randomFloat(90, 98),
      institutionCount: provInstitutions.length,
      totalStudents,
      totalTeachers,
    };
  });
}

export function generateHeatmapData(): HeatmapPoint[] {
  return provinces.map((prov) => ({
    name: prov.name,
    value: randomInt(60, 98),
    geo: [
      randomFloat(100, 122, 2),
      randomFloat(22, 40, 2),
    ],
  }));
}

export const mockHeatmapData = generateHeatmapData();

const alertTypes = [
  { type: 'health_abnormal', label: '健康异常率超标' },
  { type: 'teacher_ratio', label: '师生比不达标' },
  { type: 'enrollment_shortfall', label: '入托率低于计划' },
] as const;

export function generateAlerts(count = 25): Alert[] {
  const alerts: Alert[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const inst = randomItem(mockInstitutions);
    const alertType = randomItem(alertTypes);
    const level = randomInt(1, 3) as 1 | 2 | 3;
    const status = randomItem(['pending', 'processing', 'resolved', 'escalated']) as Alert['status'];
    const daysAgo = randomInt(0, 30);
    const triggeredAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);

    alerts.push({
      id: generateId('alert', i + 1),
      institutionId: inst.id,
      institutionName: inst.name,
      type: alertType.type,
      level,
      status,
      triggeredAt: formatDateTime(triggeredAt),
      threshold: alertType.type === 'health_abnormal' ? 5 :
                 alertType.type === 'teacher_ratio' ? 0.125 : 80,
      actualValue: alertType.type === 'health_abnormal' ? randomFloat(5.1, 10) :
                   alertType.type === 'teacher_ratio' ? randomFloat(0.08, 0.12) :
                   randomFloat(50, 78),
      consecutiveDays: randomInt(3, 15),
      handlerId: status !== 'pending' ? `u00${randomInt(2, 4)}` : undefined,
      handlerName: status !== 'pending' ? ['深圳市卫健局', '南山区卫健局', '张园长'][randomInt(0, 2)] : undefined,
      resolvedAt: status === 'resolved' ? formatDateTime(new Date(triggeredAt.getTime() + randomInt(1, 7) * 24 * 60 * 60 * 1000)) : undefined,
      resolution: status === 'resolved' ? '已采取相应措施并整改到位' : undefined,
      description: `${inst.name}${alertType.label}，已连续${randomInt(3, 15)}天超过规定阈值`,
    });
  }

  return alerts.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
}

export const mockAlerts = generateAlerts(30);

export function generateApprovals(count = 15): Approval[] {
  const approvals: Approval[] = [];
  const now = new Date();

  for (let i = 0; i < count; i++) {
    const inst = randomItem(mockInstitutions);
    const type = randomItem(['class_adjustment', 'enrollment_suspension']) as Approval['type'];
    const stage = randomInt(1, 3);
    const statuses: Approval['status'][] = ['pending_principal', 'pending_district', 'pending_city', 'approved', 'rejected'];
    const statusIndex = randomInt(0, 4);
    const status = statuses[statusIndex];

    const stages: Approval['stages'] = [
      { stage: 1, role: '园长确认', status: 'approved', handlerName: '张园长', handledAt: formatDateTime(new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000)), comment: '情况属实，同意上报' },
      { stage: 2, role: '区卫健复核', status: 'approved', handlerName: '南山区卫健局', handledAt: formatDateTime(new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000)), comment: '复核通过，同意上报市卫健委' },
      { stage: 3, role: '市卫健委批准', status: 'pending' },
    ];

    for (let s = 0; s < 3; s++) {
      if (s < stage - 1) {
        stages[s].status = 'approved';
      } else if (s === stage - 1) {
        stages[s].status = status === 'rejected' ? 'rejected' : 'pending';
      } else {
        stages[s].status = 'pending';
        stages[s].handlerName = undefined;
        stages[s].handledAt = undefined;
      }
    }

    approvals.push({
      id: generateId('appr', i + 1),
      alertId: generateId('alert', randomInt(1, 20)),
      institutionId: inst.id,
      institutionName: inst.name,
      type: type as Approval['type'],
      status: status as Approval['status'],
      currentStage: status === 'approved' || status === 'rejected' ? 3 : stage,
      stages,
      createdAt: formatDateTime(new Date(now.getTime() - randomInt(3, 15) * 24 * 60 * 60 * 1000)),
      proposedAction: type === 'class_adjustment' ? 
        `建议将班级规模从${randomInt(25, 35)}人/班调整为${randomInt(18, 22)}人/班，新增${randomInt(2, 4)}个班级` :
        '建议暂停招收新生1个月，进行师资补充与整改',
      expectedEffect: '预计调整后师生比将达到1:7的标准，健康异常率有望下降30%',
    });
  }

  return approvals;
}

export const mockApprovals = generateApprovals(20);

export function generateEnrollmentPlans(): EnrollmentPlan[] {
  return mockInstitutions.slice(0, 20).map((inst, index) => {
    const planned = inst.capacity;
    const actual = Math.floor(planned * randomFloat(0.65, 0.95));
    const forecast: EnrollmentPlan['forecast'] = [];
    const today = new Date();

    for (let i = 0; i < 90; i++) {
      const date = new Date(today.getTime() + i * 24 * 60 * 60 * 1000);
      const growth = randomFloat(0.95, 1.05);
      const demand = Math.floor(planned * randomFloat(0.8, 1.1) * growth);
      const supply = Math.floor(planned * randomFloat(0.85, 0.95));

      forecast.push({
        date: formatDate(date),
        projectedDemand: demand,
        projectedSupply: supply,
        projectedGap: demand - supply,
      });
    }

    return {
      id: generateId('plan', index + 1),
      institutionId: inst.id,
      institutionName: inst.name,
      year: new Date().getFullYear(),
      semester: randomItem(['spring', 'autumn']),
      plannedCapacity: planned,
      actualEnrollment: actual,
      enrollmentRate: parseFloat(((actual / planned) * 100).toFixed(1)),
      forecast,
    };
  });
}

export const mockEnrollmentPlans = generateEnrollmentPlans();

function generateSingleReport(
  id: string,
  regionCode: string,
  regionName: string,
  weeksAgo: number,
  period: 'week' | 'month' = 'week'
): OperationReport {
  const now = new Date();
  const daysInPeriod = period === 'week' ? 7 : 30;
  const startDate = new Date(now.getTime() - (weeksAgo * daysInPeriod + daysInPeriod) * 24 * 60 * 60 * 1000);
  const endDate = new Date(startDate.getTime() + (daysInPeriod - 1) * 24 * 60 * 60 * 1000);

  const recommendations = [
    {
      id: 'rec1',
      priority: 'high' as const,
      category: 'class_size' as const,
      content: '建议将大班额班级拆分为小班，每班人数控制在25人以内',
      expectedImpact: '预计可降低健康异常率约25%，提升师生比达标率',
    },
    {
      id: 'rec2',
      priority: 'medium' as const,
      category: 'diet' as const,
      content: '优化膳食结构，增加蔬菜和水果种类，减少高糖食物',
      expectedImpact: '预计营养达标率可提升5-8个百分点',
    },
    {
      id: 'rec3',
      priority: 'high' as const,
      category: 'staffing' as const,
      content: '建议补充3-5名专业教师，确保师生比达到1:7标准',
      expectedImpact: '可有效降低师生比预警，提升教学质量',
    },
    {
      id: 'rec4',
      priority: 'low' as const,
      category: 'health' as const,
      content: '加强晨检制度，增加每日健康巡检频次',
      expectedImpact: '有助于早期发现健康问题，降低传染风险',
    },
  ];

  const attendanceTrend = [];
  const trendDays = period === 'week' ? 7 : 30;
  for (let d = 0; d < trendDays; d++) {
    attendanceTrend.push({
      date: formatDate(new Date(startDate.getTime() + d * 24 * 60 * 60 * 1000)),
      rate: randomFloat(88, 96),
    });
  }

  const regionInstitutions = regionCode === 'national'
    ? mockInstitutions
    : mockInstitutions.filter((i) =>
        i.address.province === regionName || i.address.city === regionName
      );
  const rankingInstitutions = regionInstitutions.length > 0
    ? regionInstitutions.slice(0, 10)
    : mockInstitutions.slice(0, 10);

  return {
    id,
    regionCode,
    regionName,
    period,
    periodStart: formatDate(startDate),
    periodEnd: formatDate(endDate),
    metrics: {
      attendanceRate: { value: randomFloat(90, 95), yoy: randomFloat(-2, 3), mom: randomFloat(-1, 2) },
      healthAbnormalRate: { value: randomFloat(2, 5), yoy: randomFloat(-1, 2), mom: randomFloat(-0.5, 1) },
      teacherStudentRatio: { value: randomFloat(0.1, 0.15), yoy: randomFloat(-0.02, 0.02), mom: randomFloat(-0.01, 0.01) },
      nutritionComplianceRate: { value: randomFloat(85, 95), yoy: randomFloat(-3, 5), mom: randomFloat(-2, 3) },
    },
    analysis: {
      healthAbnormalReasons: [
        { reason: '感冒发烧', count: randomInt(50, 200), percentage: randomFloat(35, 45) },
        { reason: '咳嗽', count: randomInt(40, 150), percentage: randomFloat(25, 35) },
        { reason: '腹泻', count: randomInt(20, 60), percentage: randomFloat(10, 15) },
        { reason: '其他', count: randomInt(10, 40), percentage: randomFloat(8, 15) },
      ],
      teacherRatioRanking: rankingInstitutions.map((inst, idx) => ({
        rank: idx + 1,
        institutionName: inst.name,
        ratio: parseFloat((inst.teacherCount / inst.studentCount).toFixed(3)),
        level: inst.level,
      })),
      attendanceTrend,
    },
    recommendations: recommendations.slice(0, randomInt(2, 4)),
    generatedAt: formatDateTime(new Date(endDate.getTime() + 12 * 60 * 60 * 1000)),
  };
}

export function generateReports(): OperationReport[] {
  const reports: OperationReport[] = [];
  let reportIndex = 1;

  for (let i = 0; i < 4; i++) {
    reports.push(generateSingleReport(
      generateId('report', reportIndex++),
      'national',
      '全国',
      i,
      i === 0 ? 'month' : 'week'
    ));
  }

  for (const prov of provinces) {
    for (let i = 0; i < 2; i++) {
      reports.push(generateSingleReport(
        generateId('report', reportIndex++),
        prov.name,
        prov.name,
        i,
        i === 0 ? 'month' : 'week'
      ));
    }
    for (const city of prov.cities) {
      for (let i = 0; i < 2; i++) {
        reports.push(generateSingleReport(
          generateId('report', reportIndex++),
          city,
          city,
          i,
          i === 0 ? 'month' : 'week'
        ));
      }
    }
  }

  return reports;
}

export const mockReports = generateReports();

export const mockAlertConfig: AlertConfig = {
  healthAbnormalThreshold: 5,
  healthAbnormalConsecutiveDays: 3,
  teacherRatioStandard: 0.125,
  enrollmentShortfallThreshold: 20,
  escalationDays: 7,
};

export function generateHistoricalRealtimeData(institutionId: string, days = 30): RealtimeData[] {
  const data: RealtimeData[] = [];
  const inst = mockInstitutions.find((i) => i.id === institutionId) || mockInstitutions[0];
  const today = new Date();

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(today.getTime() - i * 24 * 60 * 60 * 1000);
    const attendanceRate = randomFloat(85, 98);
    const total = inst.studentCount;
    const present = Math.floor(total * attendanceRate / 100);
    const abnormalRate = randomFloat(1, 7);
    const abnormalCount = Math.floor(present * abnormalRate / 100);

    data.push({
      institutionId: inst.id,
      institutionName: inst.name,
      timestamp: formatDate(date),
      attendance: {
        total,
        present,
        absent: total - present,
        rate: parseFloat(attendanceRate.toFixed(2)),
      },
      health: {
        totalChecked: present,
        abnormalCount,
        abnormalRate: parseFloat(abnormalRate.toFixed(2)),
        abnormalDetails: {
          fever: Math.floor(abnormalCount * 0.3),
          cough: Math.floor(abnormalCount * 0.4),
          diarrhea: Math.floor(abnormalCount * 0.15),
          other: Math.ceil(abnormalCount * 0.15),
        },
      },
      diet: {
        breakfastRemaining: randomFloat(5, 15),
        lunchRemaining: randomFloat(3, 12),
        dinnerRemaining: randomFloat(4, 14),
        avgRemainingRate: randomFloat(4, 14),
        nutritionComplianceRate: randomFloat(85, 98),
      },
      sleep: {
        avgDuration: randomFloat(1.5, 3),
        complianceRate: randomFloat(80, 95),
      },
      activity: {
        avgSteps: randomInt(3000, 8000),
        activityLevel: randomItem(['low', 'medium', 'high']),
      },
    });
  }

  return data;
}
