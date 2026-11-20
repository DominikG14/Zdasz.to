import test from 'node:test';
import assert from 'node:assert/strict';

import { createExercisesService } from './exercises.service.js';
import ValidationError from '../../errors/ValidationError.js';
import NotFoundError from '../../errors/NotFoundError.js';

// --- helpers ---

function makeRepo(overrides = {}) {
  return {
    listFields: async () => [],
    listByField: async () => [],
    listRandom: async () => ({ exercises: [], fieldId: 1 }),
    createProgress: async () => {},
    create: async () => {},
    remove: async () => null,
    ...overrides,
  };
}

// --- listFields ---

test('listFields przekazuje wynik z repozytorium', async () => {
  const fields = [{ id: 2, number: 'I', name: 'Liczby rzeczywiste', exercises_count: 8 }];
  const service = createExercisesService(makeRepo({ listFields: async () => fields }), async () => {});

  assert.deepEqual(await service.listFields(), fields);
});

// --- byField ---

test('byField mapuje ćwiczenia na widok', async () => {
  const rows = [{ id: 1, image_url: 'x.png', type: 'ABCD', right_answer: 'A', field_id: 2 }];
  const service = createExercisesService(makeRepo({ listByField: async () => rows }), async () => {});

  const result = await service.byField(2, 10);

  assert.equal(result.length, 1);
  assert.equal(result[0].id, 1);
  assert.equal('field_id' in result[0], false);
});

test('byField używa domyślnego limitu 100 gdy limit pominięty', async () => {
  const calls = [];
  const service = createExercisesService(
    makeRepo({ listByField: async (id, limit) => { calls.push({ id, limit }); return []; } }),
    async () => {},
  );

  await service.byField(3);

  assert.equal(calls[0].limit, 100);
});

// --- random ---

test('random mapuje ćwiczenia i zwraca fieldId', async () => {
  const rows = [{ id: 5, image_url: 'y.png', type: 'PF', right_answer: 'PF' }];
  const service = createExercisesService(
    makeRepo({ listRandom: async () => ({ exercises: rows, fieldId: 1 }) }),
    async () => {},
  );

  const result = await service.random(5);

  assert.equal(result.fieldId, 1);
  assert.equal(result.exercises[0].id, 5);
});

test('random używa domyślnego limitu 10 gdy limit pominięty', async () => {
  const calls = [];
  const service = createExercisesService(
    makeRepo({ listRandom: async (limit) => { calls.push(limit); return { exercises: [], fieldId: 1 }; } }),
    async () => {},
  );

  await service.random(undefined);

  assert.equal(calls[0], 10);
});

// --- create ---

test('create rzuca ValidationError gdy plik jest null', () => {
  const service = createExercisesService(makeRepo(), async () => {});

  assert.throws(
    () => service.create({ field_id: 2, type: 'ABCD', right_answer: 'A' }, null),
    ValidationError,
  );
});

test('create zapisuje ćwiczenie z poprawną ścieżką obrazu', async () => {
  const created = [];
  const service = createExercisesService(
    makeRepo({ create: async (data) => { created.push(data); } }),
    async () => {},
  );

  await service.create({ field_id: 2, type: 'ABCD', right_answer: 'B' }, { filename: 'abc.png' });

  assert.equal(created[0].imageUrl, 'public/images/exercises/uploads/abc.png');
  assert.equal(created[0].answer, 'B');
});

// --- remove ---

test('remove usuwa obraz tylko dla zadań z folderu uploads', async () => {
  const removed = [];
  const service = createExercisesService(
    makeRepo({ remove: async () => ({ image_url: 'public/images/exercises/uploads/u.png' }) }),
    async (url) => removed.push(url),
  );

  await service.remove(99);

  assert.deepEqual(removed, ['public/images/exercises/uploads/u.png']);
});

test('remove NIE usuwa obrazu dla zadań seed (spoza uploads)', async () => {
  const removed = [];
  const service = createExercisesService(
    makeRepo({ remove: async () => ({ image_url: 'public/images/exercises/I/1.png' }) }),
    async (url) => removed.push(url),
  );

  await service.remove(1);

  assert.deepEqual(removed, []);
});

test('remove rzuca NotFoundError gdy repozytorium zwraca null', async () => {
  const service = createExercisesService(makeRepo({ remove: async () => null }), async () => {});

  await assert.rejects(service.remove(0), NotFoundError);
});
