import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ProjectForm } from './ProjectForm';
import { api } from '../api/client';

afterEach(() => vi.restoreAllMocks());

describe('ProjectForm (create)', () => {
  it('submits a new project', async () => {
    const spy = vi.spyOn(api, 'createProject').mockResolvedValue({
      id: '1', name: 'New', slug: 'new', description: null,
      status: 'healthy', componentCount: 0, createdAt: '', updatedAt: ''
    });
    render(
      <MemoryRouter initialEntries={['/projects/new']}>
        <Routes>
          <Route path="/projects/new" element={<ProjectForm mode="create" />} />
          <Route path="/projects/:id" element={<div>detail</div>} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.change(screen.getByPlaceholderText(/project name/i), {
      target: { value: 'New' }
    });
    fireEvent.click(screen.getByText(/create project/i));
    await waitFor(() => expect(spy).toHaveBeenCalledWith({ name: 'New', description: null }));
  });

  it('shows an error when the name is empty', async () => {
    render(
      <MemoryRouter initialEntries={['/projects/new']}>
        <Routes>
          <Route path="/projects/new" element={<ProjectForm mode="create" />} />
        </Routes>
      </MemoryRouter>
    );
    fireEvent.click(screen.getByText(/create project/i));
    await waitFor(() => expect(screen.getByText(/name is required/i)).toBeTruthy());
  });
});
