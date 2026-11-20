import test from 'node:test';
import assert from 'node:assert/strict';

import ConflictError from './ConflictError.js';
import NotFoundError from './NotFoundError.js';
import AppError from './AppError.js';

test('ConflictError ma statusCode 409 i code CONFLICT', () => {
  const err = new ConflictError('email zajęty');

  assert.equal(err.statusCode, 409);
  assert.equal(err.code, 'CONFLICT');
  assert.equal(err.message, 'email zajęty');
  assert.ok(err instanceof AppError);
});

test('NotFoundError ma statusCode 404 i code NOT_FOUND', () => {
  const err = new NotFoundError('nie znaleziono zadania');

  assert.equal(err.statusCode, 404);
  assert.equal(err.code, 'NOT_FOUND');
  assert.equal(err.message, 'nie znaleziono zadania');
  assert.ok(err instanceof AppError);
});

test('NotFoundError używa domyślnej wiadomości gdy brak argumentu', () => {
  const err = new NotFoundError();

  assert.equal(err.message, 'Nie znaleziono zasobu');
});
