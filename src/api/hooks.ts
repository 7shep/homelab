import { useCallback, useEffect, useState } from 'react';
import type { ProjectDetail, ProjectSummary } from '../../shared/types';
import { api } from './client';

type AsyncState<T> = { data: T | null; loading: boolean; error: string | null };

export function useProjects() {
  const [state, setState] = useState<AsyncState<ProjectSummary[]>>({
    data: null,
    loading: true,
    error: null
  });

  const reload = useCallback(() => {
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .listProjects()
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: err.message }));
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}

export function useProject(id: string | undefined) {
  const [state, setState] = useState<AsyncState<ProjectDetail>>({
    data: null,
    loading: true,
    error: null
  });

  const reload = useCallback(() => {
    if (!id) return;
    setState((s) => ({ ...s, loading: true, error: null }));
    api
      .getProject(id)
      .then((data) => setState({ data, loading: false, error: null }))
      .catch((err) => setState({ data: null, loading: false, error: err.message }));
  }, [id]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { ...state, reload };
}
