import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

import { createAuthService } from './auth.service.js';
import AppError from '../../errors/AppError.js';
import ConflictError from '../../errors/ConflictError.js';

// bcrypt hash of "Poprawne1" (cost 10)
const HASH_POPRAWNE1 = '$2a$10$Ey3v4XualA.08AEb7oZ0l.fjY6B4.4QPVEuDxrxobsAnIrT3.KPq6';

// --- helpers ---

function makeRepo(overrides = {}) {
  return {
    findByEmail: async () => null,
    create: async () => ({ id: 99, username: 'nowy', email: 'nowy@example.com' }),
    ...overrides,
  };
}

function repoWithUser(hash) {
  return makeRepo({
    findByEmail: async () => ({ id: 2, username: 'student', email: 's@x.pl', password: hash, is_admin: false }),
  });
}

// --- login ---

test('login rzuca 401 gdy użytkownik nie istnieje', async () => {
  const service = createAuthService(makeRepo({ findByEmail: async () => null }));

  const err = await service.login({ email: 'brak@x.pl', password: 'Haslo1' }).catch(e => e);

  assert.ok(err instanceof AppError);
  assert.equal(err.statusCode, 401);
});

test('login rzuca 401 gdy hasło jest błędne', async () => {
  const service = createAuthService(makeRepo({
    findByEmail: async () => ({ id: 1, username: 'u', email: 'u@x.pl', password: HASH_POPRAWNE1, is_admin: false }),
  }));

  const err = await service.login({ email: 'u@x.pl', password: 'BledneHaslo1' }).catch(e => e);

  assert.ok(err instanceof AppError);
  assert.equal(err.statusCode, 401);
});

test('login zwraca token i widok użytkownika przy poprawnych danych', async () => {
  const service = createAuthService(repoWithUser(HASH_POPRAWNE1));

  const result = await service.login({ email: 's@x.pl', password: 'Poprawne1' });

  assert.ok(result.token);
  assert.equal(result.user.username, 'student');
  assert.equal(result.user.isAdmin, false);
  assert.equal('password' in result.user, false);
});

test('login przekazuje returnUrl do wyniku', async () => {
  const repo = makeRepo({
    findByEmail: async () => ({ id: 2, username: 'u', email: 'u@x.pl', password: HASH_POPRAWNE1, is_admin: false }),
  });

  const result = await createAuthService(repo).login({ email: 'u@x.pl', password: 'Poprawne1', returnUrl: '/dashboard' });

  assert.equal(result.returnUrl, '/dashboard');
});

// --- register ---

test('register zwraca token i widok nowego użytkownika', async () => {
  const service = createAuthService(makeRepo());

  const result = await service.register({ username: 'nowy', email: 'nowy@example.com', password: 'Haslo123', password2: 'Haslo123' });

  assert.ok(result.token);
  assert.equal(result.user.username, 'nowy');
  assert.equal(result.user.isAdmin, false);
});

test('register rzuca ConflictError gdy repozytorium sygnalizuje duplikat (kod 23505)', async () => {
  const repo = makeRepo({
    create: async () => { const e = new Error('dup'); e.code = '23505'; throw e; },
  });
  const service = createAuthService(repo);

  const err = await service.register({ username: 'dup', email: 'dup@x.pl', password: 'Haslo123' }).catch(e => e);

  assert.ok(err instanceof ConflictError);
  assert.equal(err.statusCode, 409);
});

// Verify the constant hash is actually valid (self-check)
test('stały hash HASH_POPRAWNE1 odpowiada haśłu "Poprawne1"', async () => {
  assert.ok(await bcrypt.compare('Poprawne1', HASH_POPRAWNE1));
});
