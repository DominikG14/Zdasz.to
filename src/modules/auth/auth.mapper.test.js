import test from 'node:test';
import assert from 'node:assert/strict';

import { toUserView } from './auth.mapper.js';

test('toUserView mapuje wiersz z bazy na widok użytkownika', () => {
  const row = { id: 5, username: 'student', email: 'student@example.com', is_admin: false };
  const view = toUserView(row);

  assert.deepEqual(view, { id: 5, username: 'student', email: 'student@example.com', isAdmin: false });
});

test('toUserView rzutuje is_admin 1 na boolean true', () => {
  const view = toUserView({ id: 1, username: 'admin', email: 'admin@example.com', is_admin: 1 });

  assert.equal(view.isAdmin, true);
});

test('toUserView nie ujawnia pola password', () => {
  const view = toUserView({ id: 1, username: 'x', email: 'x@x.pl', password: 'sekret', is_admin: false });

  assert.equal('password' in view, false);
});
