import test from 'node:test';
import assert from 'node:assert/strict';

import { createProgressRepository } from './progress.repository.knex.js';

test('admin user progress includes recent history and per-field totals', async () => {
  const queries = [];
  const repository = createProgressRepository(async (sql, values) => {
    queries.push({ sql, values });
    if (sql.includes('SELECT username')) return { rows: [{ username: 'student' }] };
    if (sql.includes('LIMIT 10')) return { rows: [{ number: 'I', name: 'Liczby', score: 4, total: 5 }] };
    return { rows: [{ number: 'I', name: 'Liczby', attempts_count: 2, score_sum: 8, total_sum: 10, effectiveness_percent: 80 }] };
  });

  const result = await repository.userProgress(7);

  assert.equal(result.username, 'student');
  assert.equal(result.progress.length, 1);
  assert.equal(result.byField[0].effectiveness_percent, 80);
  assert.equal(queries.length, 3);
  assert.ok(queries.some(({ sql }) => sql.includes('LIMIT 10')));
  assert.ok(queries.every(({ values }) => values[0] === 7));
});
