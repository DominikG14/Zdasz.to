import { z } from 'zod';

export const emptySchema = z.object({}).strict();
export const idParamsSchema = z.object({ id: z.coerce.number().int().positive() }).strict();
export const emptyParamsSchema = emptySchema;
export const emptyQuerySchema = emptySchema;
