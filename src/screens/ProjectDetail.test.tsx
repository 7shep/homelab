import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectDetail } from './ProjectDetail';
import { api } from '../api/client';

afterEach(() => vi.restoreAllMocks());

function renderDetail() {
  return render(
    <MemoryRouter initialEntries={['/projects/1']}>
      <Routes>
        <Route path="/projects/:id" element={<ProjectDetail />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProjectDetail', () => {
  it('renders the project, its components, and hub sections', async () => {
    vi.spyOn(api, 'getProject').mockResolvedValue({
      id: '1', name: 'Media Stack', slug: 'media-stack', description: 'Home media',
      status: 'warning', componentCount: 1, createdAt: '', updatedAt: '',
      components: [
        {
          id: 'c1', projectId: '1', name: 'jellyfin', kind: 'service',
          status: 'warning', target: 'http://jelly', notes: null, config: {},
          createdAt: '', updatedAt: ''
        }
      ]
    });
    renderDetail();
    await waitFor(() => expect(screen.getByText('Media Stack')).toBeTruthy());
    expect(screen.getByText('jellyfin')).toBeTruthy();
    // hub placeholder sections
    expect(screen.getByText('Checks')).toBeTruthy();
    expect(screen.getByText('Deploys')).toBeTruthy();
    expect(screen.getByText('Log pointers')).toBeTruthy();
  });
});
