import test from 'node:test';
import assert from 'node:assert/strict';

import { createProgressRepository } from './progress.repository.knex.js';

// --- dashboard ---

test('dashboard zwraca postępy i podsumowanie per dział dla użytkownika', async () => {
  const queries = [];
  const repo = createProgressRepository(async (sql, values) => {
    queries.push({ sql, values });
    if (sql.includes('p.solved_at DESC') && !sql.includes('LIMIT')) {
      return { rows: [{ field_id: 2, name: 'Liczby', score: 7, total: 10, solved_at: '2026-11-01' }] };
    }
    return { rows: [{ number: 'I', name: 'Liczby', attempts_count: 1, score_sum: 7, total_sum: 10, last_solved_at: '2026-11-01' }] };
  });

  const result = await repo.dashboard(3);

  assert.equal(result.progress.length, 1);
  assert.equal(result.byField[0].score_sum, 7);
  assert.ok(queries.every(({ values }) => values[0] === 3));
});

test('dashboard wyklucza pole number=0 (Mieszane) z zapytań', async () => {
  const sqls = [];
  const repo = createProgressRepository(async (sql) => { sqls.push(sql); return { rows: [] }; });

  await repo.dashboard(1);

  assert.ok(sqls.every(sql => sql.includes("number <> '0'")));
});

// --- userProgress ---

test('userProgress zwraca null gdy użytkownik nie istnieje', async () => {
  const repo = createProgressRepository(async (sql) => {
    if (sql.includes('SELECT username')) return { rows: [] };
    return { rows: [] };
  });

  const result = await repo.userProgress(999);

  assert.equal(result, null);
});

test('userProgress wyklucza pole number=0 (Mieszane) z zapytań historii', async () => {
  const sqls = [];
  const repo = createProgressRepository(async (sql) => {
    sqls.push(sql);
    if (sql.includes('SELECT username')) return { rows: [{ username: 'u' }] };
    return { rows: [] };
  });

  await repo.userProgress(2);

  const historySql = sqls.find(s => s.includes('LIMIT 10'));
  assert.ok(historySql.includes("number <> '0'"));
});
