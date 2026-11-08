import { z } from 'zod';

export const fieldParamsSchema = z.object({ id: z.coerce.number().int().positive() }).strict();
export const fieldQuerySchema = z.object({ limit: z.coerce.number().int().min(1).max(100).optional() }).strict();
export const randomQuerySchema = z.object({ limit: z.coerce.number().int().min(1).max(50).optional() }).strict();
export const emptyParamsSchema = z.object({}).strict();
export const emptyQuerySchema = z.object({}).strict();

export const progressBodySchema = z.object({
  field_id: z.coerce.number().int().positive(),
  score: z.coerce.number().int().nonnegative(),
  total: z.coerce.number().int().positive(),
}).strict().refine(value => value.score <= value.total, {
  path: ['score'], message: 'Wynik nie może być większy niż liczba zadań',
});

export const newExerciseBodySchema = z.object({
  field_id: z.coerce.number().int().positive(),
  type: z.enum(['ABCD', 'PF']),
  right_answer: z.string().trim().toUpperCase(),
}).strict().refine(value => value.type === 'ABCD' ? /^[A-D]$/.test(value.right_answer) : /^(PP|PF|FP|FF)$/.test(value.right_answer), {
  path: ['right_answer'], message: 'Niepoprawny format odpowiedzi dla wybranego typu',
});
