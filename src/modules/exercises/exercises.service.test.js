import test from 'node:test';
import assert from 'node:assert/strict';

import NotFoundError from '../../errors/NotFoundError.js';
import { createExercisesService } from './exercises.service.js';

test('removing an uploaded exercise also removes its image', async () => {
  const removedImages = [];
  const service = createExercisesService({
    remove: async id => ({ image_url: `public/images/exercises/uploads/${id}.png` }),
  }, async imageUrl => removedImages.push(imageUrl));

  assert.deepEqual(await service.remove(12), { success: true });
  assert.deepEqual(removedImages, ['public/images/exercises/uploads/12.png']);
});

test('removing an unknown exercise reports not found', async () => {
  const service = createExercisesService({ remove: async () => null }, async () => {});

  await assert.rejects(service.remove(12), NotFoundError);
});
