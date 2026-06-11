export type HealthState = 'healthy' | 'warning' | 'critical';

export type Project = {
  id: string;
  name: string;
  kind: 'app' | 'worker' | 'server' | 'domain';
  status: HealthState;
  summary: string;
  latencyMs: number;
  lastChecked: string;
};

export type Alert = {
  id: string;
  projectName: string;
  severity: Exclude<HealthState, 'healthy'>;
  message: string;
  age: string;
};

export type TimelineEvent = {
  id: string;
  projectName: string;
  eventType: 'deploy' | 'check' | 'alert' | 'certificate';
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

export const projects: Project[] = [
  {
    id: 'api',
    name: 'API Gateway',
    kind: 'app',
    status: 'healthy',
    summary: 'All uptime checks are passing',
    latencyMs: 142,
    lastChecked: '42s ago'
  },
  {
    id: 'jobs',
    name: 'Nightly Jobs',
    kind: 'worker',
    status: 'warning',
    summary: 'Backup heartbeat is late',
    latencyMs: 0,
    lastChecked: '18m ago'
  },
  {
    id: 'vps',
    name: 'Primary VPS',
    kind: 'server',
    status: 'critical',
    summary: 'Disk usage crossed 90%',
    latencyMs: 38,
    lastChecked: '3m ago'
  },
  {
    id: 'site',
    name: 'Personal Site',
    kind: 'domain',
    status: 'healthy',
    summary: 'Certificate expires in 46 days',
    latencyMs: 91,
    lastChecked: '1m ago'
  }
];

export const alerts: Alert[] = [
  {
    id: 'disk',
    projectName: 'Primary VPS',
    severity: 'critical',
    message: 'Disk usage is at 92%',
    age: '3m'
  },
  {
    id: 'heartbeat',
    projectName: 'Nightly Jobs',
    severity: 'warning',
    message: 'Expected heartbeat missed its grace window',
    age: '18m'
  }
];

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'deploy-api',
    projectName: 'API Gateway',
    eventType: 'deploy',
    message: 'Deployed 1.8.4 from main',
    time: '23m ago'
  },
  {
    id: 'late-job',
    projectName: 'Nightly Jobs',
    eventType: 'alert',
    message: 'Backup heartbeat became late',
    time: '18m ago'
  },
  {
    id: 'disk-warning',
    projectName: 'Primary VPS',
    eventType: 'check',
    message: 'Disk usage check reported 92%',
    time: '3m ago'
  },
  {
    id: 'cert-site',
    projectName: 'Personal Site',
    eventType: 'certificate',
    message: 'TLS certificate still outside warning threshold',
    time: '1m ago'
  }
];
