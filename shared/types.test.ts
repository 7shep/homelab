import { describe, expect, it } from 'vitest';
import { deriveStatus } from './types';

describe('deriveStatus', () => {
  it('returns healthy for no statuses', () => {
    expect(deriveStatus([])).toBe('healthy');
  });
  it('returns healthy when all healthy', () => {
    expect(deriveStatus(['healthy', 'healthy'])).toBe('healthy');
  });
  it('returns warning when worst is warning', () => {
    expect(deriveStatus(['healthy', 'warning'])).toBe('warning');
  });
  it('returns critical when any critical', () => {
    expect(deriveStatus(['healthy', 'warning', 'critical'])).toBe('critical');
  });
});
