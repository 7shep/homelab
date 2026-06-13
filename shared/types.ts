export type HealthState = 'healthy' | 'warning' | 'critical';

export const COMPONENT_KINDS = [
  'app',
  'service',
  'worker',
  'cron',
  'server',
  'domain'
] as const;

export type ComponentKind = (typeof COMPONENT_KINDS)[number];

export type Component = {
  id: string;
  projectId: string;
  name: string;
  kind: ComponentKind;
  status: HealthState;
  target: string | null;
  notes: string | null;
  config: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

/** A project as returned in list responses (no components, derived status). */
export type ProjectSummary = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  status: HealthState;
  componentCount: number;
  createdAt: string;
  updatedAt: string;
};

/** A project as returned in the detail response (with components). */
export type ProjectDetail = ProjectSummary & {
  components: Component[];
};

/** Worst-of reducer for deriving project status from component statuses. */
export function deriveStatus(statuses: HealthState[]): HealthState {
  if (statuses.includes('critical')) return 'critical';
  if (statuses.includes('warning')) return 'warning';
  return 'healthy';
}
