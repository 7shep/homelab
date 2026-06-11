import type {
  Component,
  ComponentKind,
  HealthState,
  ProjectDetail,
  ProjectSummary
} from '../../shared/types';

export type ProjectInput = { name: string; description: string | null };
export type ComponentInput = {
  name: string;
  kind: ComponentKind;
  status: HealthState;
  target: string | null;
  notes: string | null;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'content-type': 'application/json' },
    ...init
  });
  if (res.status === 204) return undefined as T;
  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const message = body?.error?.message ?? `Request failed (${res.status})`;
    throw new Error(message);
  }
  return body as T;
}

export const api = {
  listProjects: () => request<ProjectSummary[]>('/projects'),
  getProject: (id: string) => request<ProjectDetail>(`/projects/${id}`),
  createProject: (input: ProjectInput) =>
    request<ProjectSummary>('/projects', { method: 'POST', body: JSON.stringify(input) }),
  updateProject: (id: string, input: ProjectInput) =>
    request<ProjectDetail>(`/projects/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteProject: (id: string) =>
    request<void>(`/projects/${id}`, { method: 'DELETE' }),
  createComponent: (projectId: string, input: ComponentInput) =>
    request<Component>(`/projects/${projectId}/components`, {
      method: 'POST',
      body: JSON.stringify(input)
    }),
  updateComponent: (id: string, input: ComponentInput) =>
    request<Component>(`/components/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
  deleteComponent: (id: string) =>
    request<void>(`/components/${id}`, { method: 'DELETE' })
};
