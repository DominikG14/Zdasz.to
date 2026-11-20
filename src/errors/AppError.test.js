import test from 'node:test';
import assert from 'node:assert/strict';

import AppError from './AppError.js';

test('AppError przechowuje wiadomość, statusCode i code', () => {
  const err = new AppError('coś poszło nie tak', { statusCode: 400, code: 'BAD_REQUEST' });

  assert.equal(err.message, 'coś poszło nie tak');
  assert.equal(err.statusCode, 400);
  assert.equal(err.code, 'BAD_REQUEST');
  assert.equal(err.name, 'AppError');
  assert.ok(err instanceof Error);
});

test('AppError używa domyślnych wartości gdy opcje pominięte', () => {
  const err = new AppError('błąd');

  assert.equal(err.statusCode, 500);
  assert.equal(err.code, 'INTERNAL_ERROR');
  assert.equal(err.details, undefined);
});
