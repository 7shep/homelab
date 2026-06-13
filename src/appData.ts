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

export type ContainerState = 'running' | 'restarting' | 'unhealthy' | 'missing';

export type ContainerRecord = {
  id: string;
  name: string;
  projectName: string;
  serverName: string;
  state: ContainerState;
  restarts: number;
  detail: string;
};

export type ProjectContainerGroup = {
  projectName: string;
  containers: ContainerRecord[];
};

export type ServerContainerGroup = {
  serverName: string;
  containers: ContainerRecord[];
  projects: ProjectContainerGroup[];
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
  kind: 'service' | 'container';
  serverName?: string;
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

export const containers: ContainerRecord[] = [
  {
    id: 'jellyfin',
    name: 'jellyfin',
    projectName: 'media-stack',
    serverName: 'atlas',
    state: 'running',
    restarts: 1,
    detail: 'Healthy after media library rescan'
  },
  {
    id: 'sonarr',
    name: 'sonarr',
    projectName: 'media-stack',
    serverName: 'atlas',
    state: 'restarting',
    restarts: 6,
    detail: 'CrashLoopBackOff during database migration'
  },
  {
    id: 'radarr',
    name: 'radarr',
    projectName: 'media-stack',
    serverName: 'atlas',
    state: 'running',
    restarts: 0,
    detail: 'Running normally'
  },
  {
    id: 'caddy',
    name: 'caddy',
    projectName: 'infrastructure',
    serverName: 'atlas',
    state: 'running',
    restarts: 0,
    detail: 'Serving reverse proxy traffic'
  },
  {
    id: 'prometheus',
    name: 'prometheus',
    projectName: 'monitoring',
    serverName: 'omega',
    state: 'running',
    restarts: 0,
    detail: 'Scrape targets healthy'
  },
  {
    id: 'alertmanager',
    name: 'alertmanager',
    projectName: 'monitoring',
    serverName: 'omega',
    state: 'missing',
    restarts: 0,
    detail: 'Expected container absent from compose'
  },
  {
    id: 'restic',
    name: 'restic',
    projectName: 'backup',
    serverName: 'omega',
    state: 'unhealthy',
    restarts: 3,
    detail: 'Backup job exit code 1 on last run'
  },
  {
    id: 'portainer',
    name: 'portainer',
    projectName: 'infrastructure',
    serverName: 'omega',
    state: 'running',
    restarts: 2,
    detail: 'Stable after redeploy'
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

export function groupContainersByServerAndProject(
  items: ContainerRecord[]
): ServerContainerGroup[] {
  const serverMap = new Map<
    string,
    { containers: ContainerRecord[]; projectMap: Map<string, ContainerRecord[]> }
  >();

  for (const container of items) {
    const existingServer = serverMap.get(container.serverName);

    if (existingServer) {
      existingServer.containers.push(container);
      const existingProject = existingServer.projectMap.get(container.projectName);
      if (existingProject) {
        existingProject.push(container);
      } else {
        existingServer.projectMap.set(container.projectName, [container]);
      }
      continue;
    }

    serverMap.set(container.serverName, {
      containers: [container],
      projectMap: new Map([[container.projectName, [container]]])
    });
  }

  return Array.from(serverMap.entries()).map(([serverName, group]) => ({
    serverName,
    containers: group.containers,
    projects: Array.from(group.projectMap.entries()).map(([projectName, projectContainers]) => ({
      projectName,
      containers: projectContainers
    }))
  }));
}

export const timelineEvents: TimelineEvent[] = [
  {
    id: 'timeline-jellyfin',
    projectName: 'media-stack',
    target: 'jellyfin',
    status: 'critical',
    message: 'Service is down',
    time: '2025-05-24 22:14:18',
    kind: 'service'
  },
  {
    id: 'timeline-node',
    projectName: 'kubernetes',
    target: 'node-02',
    status: 'warning',
    message: 'High CPU usage (87%)',
    time: '2025-05-24 22:11:07',
    kind: 'service'
  },
  {
    id: 'timeline-restic',
    projectName: 'backup',
    target: 'restic',
    status: 'warning',
    message: 'Backup job missed',
    time: '2025-05-24 22:09:32',
    kind: 'service'
  },
  {
    id: 'timeline-router',
    projectName: 'infrastructure',
    target: 'router',
    status: 'healthy',
    message: 'Interface reconnected',
    time: '2025-05-24 22:07:54',
    kind: 'service'
  },
  {
    id: 'timeline-prometheus',
    projectName: 'monitoring',
    target: 'prometheus',
    status: 'healthy',
    message: 'Targets healthy',
    time: '2025-05-24 22:06:41',
    kind: 'service'
  },
  {
    id: 'timeline-sonarr',
    projectName: 'media-stack',
    target: 'sonarr',
    serverName: 'atlas',
    status: 'critical',
    message: 'Container restarted 6 times in 10 minutes',
    time: '2025-05-24 22:05:03',
    kind: 'container'
  },
  {
    id: 'timeline-alertmanager',
    projectName: 'monitoring',
    target: 'alertmanager',
    serverName: 'omega',
    status: 'critical',
    message: 'Expected container missing from compose',
    time: '2025-05-24 22:03:19',
    kind: 'container'
  },
  {
    id: 'timeline-restic-container',
    projectName: 'backup',
    target: 'restic',
    serverName: 'omega',
    status: 'warning',
    message: 'Container reported unhealthy after backup failure',
    time: '2025-05-24 22:01:48',
    kind: 'container'
  }
];
