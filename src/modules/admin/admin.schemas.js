import { z } from 'zod';

export const userIdParamsSchema = z.object({ id: z.coerce.number().int().positive() }).strict();
export const emptyParamsSchema = z.object({}).strict();
export const usersQuerySchema = z.object({ search: z.string().max(100).optional() }).strict();
export const emptyQuerySchema = z.object({}).strict();
export const emptyBodySchema = z.object({}).strict();
