import type { HealthState } from '../shared/types';

export const colors = {
  app: '#071017',
  sidebar: '#070B10',
  panel: '#0B1821',
  panelRaised: '#101D28',
  border: '#243746',
  borderSoft: '#182B38',
  divider: '#1A2A36',
  text: '#E6EDF3',
  muted: '#9AA8B6',
  faint: '#718190',
  accent: '#2ED9FF',
  success: '#28E39A',
  warning: '#FFC21A',
  critical: '#FF4D52'
};

export const monoStack =
  '"IBM Plex Mono", ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace';
export const sansStack = monoStack;
export const brandStack = monoStack;

export const statusStyles: Record<
  HealthState,
  { label: string; color: string; backgroundColor: string; borderColor: string }
> = {
  healthy: {
    label: 'Healthy',
    color: colors.success,
    backgroundColor: '#0B3325',
    borderColor: '#158858'
  },
  warning: {
    label: 'Warning',
    color: colors.warning,
    backgroundColor: '#332A0B',
    borderColor: '#7B640F'
  },
  critical: {
    label: 'Critical',
    color: colors.critical,
    backgroundColor: '#351319',
    borderColor: '#A2373F'
  }
};
