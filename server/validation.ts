import { z } from 'zod';
import { COMPONENT_KINDS } from '../shared/types';

export const projectInput = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  description: z.string().max(2000).nullish().transform((v) => v ?? null)
});

export const componentInput = z.object({
  name: z.string().min(1, 'Name is required').max(120),
  kind: z.enum(COMPONENT_KINDS),
  status: z.enum(['healthy', 'warning', 'critical']).default('healthy'),
  target: z.string().max(500).nullish().transform((v) => v ?? null),
  notes: z.string().max(2000).nullish().transform((v) => v ?? null)
});
