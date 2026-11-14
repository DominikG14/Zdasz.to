import { z } from 'zod';

export const loginBodySchema = z.object({
  email: z.string().trim().email().max(255),
  password: z.string({ error: 'Hasło jest wymagane.' })
    .min(1, { error: 'Hasło jest wymagane.' })
    .max(128, { error: 'Hasło może mieć maksymalnie 128 znaków.' }),
  returnUrl: z.string().optional(),
}).strict();

export const registrationBodySchema = z.object({
  username: z.string().trim().min(1).max(50),
  email: z.string().trim().email().max(255),
  password: z.string({ error: 'Hasło jest wymagane.' })
    .min(8, { error: 'Hasło musi mieć co najmniej 8 znaków.' })
    .max(128, { error: 'Hasło może mieć maksymalnie 128 znaków.' })
    .regex(/[a-z]/, { error: 'Hasło musi zawierać co najmniej jedną małą literę.' })
    .regex(/[A-Z]/, { error: 'Hasło musi zawierać co najmniej jedną wielką literę.' })
    .regex(/[0-9]/, { error: 'Hasło musi zawierać co najmniej jedną cyfrę.' }),
  password2: z.string({ error: 'Powtórzenie hasła jest wymagane.' }).min(1, { error: 'Powtórzenie hasła jest wymagane.' }),
  returnUrl: z.string().optional(),
}).strict().refine(value => value.password === value.password2, {
  path: ['password2'], message: 'Hasła muszą być takie same',
});

export const safeReturn = value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
