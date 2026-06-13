import { afterEach, describe, expect, it, vi } from 'vitest';
import { api } from './client';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('api client', () => {
  it('returns parsed JSON on success', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify([{ id: '1' }]), {
          status: 200,
          headers: { 'content-type': 'application/json' }
        })
      )
    );
    const result = await api.listProjects();
    expect(result).toEqual([{ id: '1' }]);
  });

  it('throws the API error message on failure', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue(
        new Response(JSON.stringify({ error: { message: 'nope' } }), {
          status: 409,
          headers: { 'content-type': 'application/json' }
        })
      )
    );
    await expect(api.createProject({ name: 'x', description: null })).rejects.toThrow('nope');
  });
});
