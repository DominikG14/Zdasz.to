import test from 'node:test';
import assert from 'node:assert/strict';

import ValidationError from './ValidationError.js';

test('ValidationError exposes a readable message and preserves field details', () => {
  const details = [
    { location: 'body', field: 'email', message: 'Niepoprawny format adresu e-mail' },
    { location: 'body', field: 'password', message: 'Hasło jest wymagane' },
  ];

  const error = new ValidationError(details);

  assert.equal(error.message, 'Dane wejściowe są niepoprawne.');
  assert.deepEqual(error.details, details);
});
