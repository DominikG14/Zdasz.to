import test from 'node:test';
import assert from 'node:assert/strict';

import { toAdminUserView } from './admin.mapper.js';

test('toAdminUserView mapuje wiersz na widok admina', () => {
  const row = { id: 3, username: 'student', email: 'student@x.pl' };

  assert.deepEqual(toAdminUserView(row), { id: 3, username: 'student', email: 'student@x.pl' });
});

test('toAdminUserView nie ujawnia pola password', () => {
  const view = toAdminUserView({ id: 1, username: 'u', email: 'u@x.pl', password: 'sekret' });

  assert.equal('password' in view, false);
});
