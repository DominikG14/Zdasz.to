import test from 'node:test';
import assert from 'node:assert/strict';

import { toExerciseView } from './exercises.mapper.js';

test('toExerciseView mapuje wiersz z bazy na widok zadania', () => {
  const row = { id: 7, image_url: 'public/images/exercises/I/1.png', type: 'ABCD', right_answer: 'C' };

  assert.deepEqual(toExerciseView(row), {
    id: 7,
    image_url: 'public/images/exercises/I/1.png',
    type: 'ABCD',
    right_answer: 'C',
  });
});

test('toExerciseView nie ujawnia pola field_id', () => {
  const view = toExerciseView({ id: 1, field_id: 3, image_url: 'x.png', type: 'PF', right_answer: 'PP' });

  assert.equal('field_id' in view, false);
});
