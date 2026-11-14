import test from 'node:test';
import assert from 'node:assert/strict';

import { loginBodySchema, registrationBodySchema } from './auth.schemas.js';

const registration = {
  username: 'student',
  email: 'student@example.com',
  password2: '',
};

test('registration gives a friendly message when the password has no digit', () => {
  const result = registrationBodySchema.safeParse({ ...registration, password: 'Password', password2: 'Password' });

  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.path[0] === 'password' && issue.message === 'Hasło musi zawierać co najmniej jedną cyfrę.'));
});

test('registration gives a friendly message when the password is too short', () => {
  const result = registrationBodySchema.safeParse({ ...registration, password: 'Pass1', password2: 'Pass1' });

  assert.equal(result.success, false);
  assert.ok(result.error.issues.some(issue => issue.path[0] === 'password' && issue.message === 'Hasło musi mieć co najmniej 8 znaków.'));
});

test('login gives a friendly message when the password is empty', () => {
  const result = loginBodySchema.safeParse({ email: 'student@example.com', password: '' });

  assert.equal(result.success, false);
  assert.equal(result.error.issues[0].message, 'Hasło jest wymagane.');
});
