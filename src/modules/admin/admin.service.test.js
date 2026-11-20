import test from 'node:test';
import assert from 'node:assert/strict';

import { createAdminService } from './admin.service.js';
import AppError from '../../errors/AppError.js';

function makeRepo(overrides = {}) {
  return {
    findUsers: async () => [],
    deleteUser: async () => true,
    exerciseCatalog: async () => ({ fields: [], exercises: [] }),
    ...overrides,
  };
}

// --- users ---

test('users mapuje wyniki repozytorium na widok admina', async () => {
  const rows = [{ id: 1, username: 'admin', email: 'admin@x.pl' }];
  const service = createAdminService(makeRepo({ findUsers: async () => rows }));

  const result = await service.users();

  assert.deepEqual(result, [{ id: 1, username: 'admin', email: 'admin@x.pl' }]);
});

test('users przekazuje przyciętą frazę wyszukiwania do repozytorium', async () => {
  const queries = [];
  const service = createAdminService(makeRepo({ findUsers: async (q) => { queries.push(q); return []; } }));

  await service.users('  student  ');

  assert.equal(queries[0], 'student');
});

test('users używa pustego stringa gdy brak argumentu', async () => {
  const queries = [];
  const service = createAdminService(makeRepo({ findUsers: async (q) => { queries.push(q); return []; } }));

  await service.users();

  assert.equal(queries[0], '');
});

// --- deleteUser ---

test('deleteUser rzuca AppError 400 gdy admin próbuje usunąć własne konto', async () => {
  const service = createAdminService(makeRepo());

  const err = await service.deleteUser(5, 5).catch(e => e);

  assert.ok(err instanceof AppError);
  assert.equal(err.statusCode, 400);
  assert.equal(err.code, 'BAD_REQUEST');
});

test('deleteUser usuwa inne konto bez błędu', async () => {
  const deleted = [];
  const service = createAdminService(makeRepo({ deleteUser: async (id) => deleted.push(id) }));

  const result = await service.deleteUser(3, 1);

  assert.deepEqual(result, { success: true });
  assert.deepEqual(deleted, [3]);
});

// --- exerciseCatalog ---

test('exerciseCatalog zwraca katalog z repozytorium', async () => {
  const catalog = {
    fields: [{ id: 2, number: 'I', name: 'Liczby' }],
    exercises: [{ id: 1, field_id: 2, type: 'ABCD', right_answer: 'A' }],
  };
  const service = createAdminService(makeRepo({ exerciseCatalog: async () => catalog }));

  const result = await service.exerciseCatalog();

  assert.deepEqual(result, catalog);
});
