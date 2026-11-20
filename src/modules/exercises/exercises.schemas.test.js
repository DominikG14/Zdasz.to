import test from 'node:test';
import assert from 'node:assert/strict';

import { exerciseIdParamsSchema, fieldParamsSchema, fieldQuerySchema, progressBodySchema, newExerciseBodySchema, randomQuerySchema } from './exercises.schemas.js';

// --- fieldParamsSchema ---

test('fieldParamsSchema akceptuje dodatnią liczbę całkowitą', () => {
  assert.ok(fieldParamsSchema.safeParse({ id: 5 }).success);
});

test('fieldParamsSchema odrzuca id = 0', () => {
  assert.equal(fieldParamsSchema.safeParse({ id: 0 }).success, false);
});

test('fieldParamsSchema rzutuje string "3" na liczbę', () => {
  const result = fieldParamsSchema.safeParse({ id: '3' });
  assert.ok(result.success);
  assert.equal(result.data.id, 3);
});

// --- fieldQuerySchema ---

test('fieldQuerySchema akceptuje limit 1–100', () => {
  assert.ok(fieldQuerySchema.safeParse({ limit: 50 }).success);
});

test('fieldQuerySchema odrzuca limit > 100', () => {
  assert.equal(fieldQuerySchema.safeParse({ limit: 101 }).success, false);
});

test('fieldQuerySchema akceptuje brak limitu', () => {
  assert.ok(fieldQuerySchema.safeParse({}).success);
});

// --- randomQuerySchema ---

test('randomQuerySchema odrzuca limit > 50', () => {
  assert.equal(randomQuerySchema.safeParse({ limit: 51 }).success, false);
});

// --- progressBodySchema ---

test('progressBodySchema akceptuje score <= total', () => {
  assert.ok(progressBodySchema.safeParse({ field_id: 1, score: 5, total: 10 }).success);
});

test('progressBodySchema odrzuca score > total', () => {
  assert.equal(progressBodySchema.safeParse({ field_id: 1, score: 11, total: 10 }).success, false);
});

test('progressBodySchema odrzuca ujemny score', () => {
  assert.equal(progressBodySchema.safeParse({ field_id: 1, score: -1, total: 10 }).success, false);
});

test('progressBodySchema odrzuca total = 0', () => {
  assert.equal(progressBodySchema.safeParse({ field_id: 1, score: 0, total: 0 }).success, false);
});

// --- newExerciseBodySchema ---

test('newExerciseBodySchema akceptuje poprawny format ABCD', () => {
  const r = newExerciseBodySchema.safeParse({ field_id: 1, type: 'ABCD', right_answer: 'B' });
  assert.ok(r.success);
});

test('newExerciseBodySchema odrzuca odpowiedź E dla ABCD', () => {
  assert.equal(newExerciseBodySchema.safeParse({ field_id: 1, type: 'ABCD', right_answer: 'E' }).success, false);
});

test('newExerciseBodySchema akceptuje poprawny format PF (PP, PF, FP, FF)', () => {
  for (const ans of ['PP', 'PF', 'FP', 'FF']) {
    assert.ok(newExerciseBodySchema.safeParse({ field_id: 1, type: 'PF', right_answer: ans }).success, `${ans} powinno być poprawne`);
  }
});

test('newExerciseBodySchema odrzuca niepoprawną odpowiedź dla PF', () => {
  assert.equal(newExerciseBodySchema.safeParse({ field_id: 1, type: 'PF', right_answer: 'AB' }).success, false);
});

test('newExerciseBodySchema normalizuje right_answer do wielkich liter', () => {
  const r = newExerciseBodySchema.safeParse({ field_id: 1, type: 'ABCD', right_answer: 'b' });
  assert.ok(r.success);
  assert.equal(r.data.right_answer, 'B');
});
