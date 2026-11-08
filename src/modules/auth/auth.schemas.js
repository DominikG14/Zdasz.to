import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string().min(1).max(128),
  returnUrl: z.string().optional(),
}).strict();

export const registrationBodySchema = z.object({
  username: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(255),
  password: z.string().min(8).max(128).regex(/[a-z]/).regex(/[A-Z]/).regex(/[0-9]/),
  password2: z.string(),
  returnUrl: z.string().optional(),
}).strict().refine(value => value.password === value.password2, {
  path: ['password2'], message: 'Hasła muszą być takie same',
});

export const safeReturn = value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
