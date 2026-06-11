export type HealthState = 'healthy' | 'warning' | 'critical';

export type Metric = {
  id: string;
  label: string;
  value: number;
  detail: string;
  status: HealthState | 'total';
  trend: number[];
};

export type Project = {
  id: string;
  name: string;
  serviceCount: number;
  status: HealthState;
  unhealthy: number;
};

export type Alert = {
  id: string;
  projectName: string;
  target: string;
  severity: HealthState;
  message: string;
  age: string;
};

export type TimelineEvent = {
  id: string;
  projectName: string;
  target: string;
  status: HealthState;
  message: string;
  time: string;
};

export const navigationItems = [
  'Dashboard',
  'Projects',
  'Timeline',
  'Alerts',
  'Servers',
  'Config',
  'Settings'
];

export const metrics: Metric[] = [
  {
    id: 'healthy',
    label: 'Healthy',
    value: 12,
    detail: '80% of 15',
    status: 'healthy',
    trend: [26, 22, 20, 15, 13, 8, 11, 6, 10, 14, 11, 9, 12, 8, 6, 9]
  },
  {
    id: 'warnings',
    label: 'Warnings',
    value: 2,
    detail: '13% of 15',
    status: 'warning',
    trend: [10, 8, 9, 15, 6, 7, 10, 8, 8, 7, 15, 9, 11, 7, 9, 10]
  },
  {
    id: 'critical',
    label: 'Critical',
    value: 1,
    detail: '7% of 15',
    status: 'critical',
    trend: [11, 11, 10, 16, 8, 14, 10, 12, 8, 8, 9, 9, 8, 13, 9, 8]
  },
  {
    id: 'total',
    label: 'Total',
    value: 15,
    detail: 'All systems',
    status: 'total',
    trend: [12, 10, 11, 15, 9, 14, 17, 13, 19, 10, 21, 12, 15, 10, 13, 14]
  }
];

export const projects: Project[] = [
  {
    id: 'media-stack',
    name: 'media-stack',
    serviceCount: 5,
    status: 'critical',
    unhealthy: 1
  },
  {
    id: 'kubernetes',
    name: 'kubernetes',
    serviceCount: 6,
    status: 'warning',
    unhealthy: 2
  },
  {
    id: 'backup',
    name: 'backup',
    serviceCount: 2,
    status: 'warning',
    unhealthy: 1
  },
  {
    id: 'infrastructure',
    name: 'infrastructure',
    serviceCount: 3,
    status: 'healthy',
    unhealthy: 0
  },
  {
    id: 'monitoring',
    name: 'monitoring',
    serviceCount: 3,
    status: 'healthy',
    unhealthy: 0
  }
];

export const alerts: Alert[] = [
  {
    id: 'jellyfin',
    projectName: 'media-stack',
    target: 'jellyfin',
    severity: 'critical',
    message: 'Service is down',
    age: '42s ago'
  },
  {
    id: 'node-02',
    projectName: 'kubernetes',
    target: 'node-02',
    severity: 'warning',
    message: 'High CPU usage (87%)',
    age: '3m ago'
  },
  {
    id: 'restic',
    projectName: 'backup',
    target: 'restic',
    severity: 'warning',
    message: 'Backup job missed',
    age: '12m ago'
  },
  {
    id: 'router',
    projectName: 'infrastructure',
    target: 'router',
    severity: 'healthy',
    message: 'Interface reconnected',
    age: '18m ago'
  },
  {
    id: 'prometheus',
    projectName: 'monitoring',
    target: 'prometheus',
    severity: 'healthy',
    message: 'Targets healthy',
    age: '21m ago'
  }
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'timeline-jellyfin',
    projectName: 'media-stack',
    target: 'jellyfin',
    status: 'critical',
    message: 'Service is down',
    time: '2025-05-24 22:14:18'
  },
  {
    id: 'timeline-node',
    projectName: 'kubernetes',
    target: 'node-02',
    status: 'warning',
    message: 'High CPU usage (87%)',
    time: '2025-05-24 22:11:07'
  },
  {
    id: 'timeline-restic',
    projectName: 'backup',
    target: 'restic',
    status: 'warning',
    message: 'Backup job missed',
    time: '2025-05-24 22:09:32'
  },
  {
    id: 'timeline-router',
    projectName: 'infrastructure',
    target: 'router',
    status: 'healthy',
    message: 'Interface reconnected',
    time: '2025-05-24 22:07:54'
  },
  {
    id: 'timeline-prometheus',
    projectName: 'monitoring',
    target: 'prometheus',
    status: 'healthy',
    message: 'Targets healthy',
    time: '2025-05-24 22:06:41'
  }
];
