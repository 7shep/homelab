import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectsList } from './ProjectsList';
import { api } from '../api/client';

afterEach(() => vi.restoreAllMocks());

function renderList() {
  return render(
    <MemoryRouter>
      <ProjectsList />
    </MemoryRouter>
  );
}

describe('ProjectsList', () => {
  it('shows projects from the api', async () => {
    vi.spyOn(api, 'listProjects').mockResolvedValue([
      {
        id: '1', name: 'Media Stack', slug: 'media-stack', description: null,
        status: 'critical', componentCount: 3, createdAt: '', updatedAt: ''
      }
    ]);
    renderList();
    await waitFor(() => expect(screen.getByText('Media Stack')).toBeTruthy());
  });

  it('shows an empty state when there are no projects', async () => {
    vi.spyOn(api, 'listProjects').mockResolvedValue([]);
    renderList();
    await waitFor(() => expect(screen.getByText(/no projects yet/i)).toBeTruthy());
  });
});
