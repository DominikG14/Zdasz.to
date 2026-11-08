import { Router } from 'express';
import { requireAdmin, requireUser } from '../../middleware/auth.js';

export function createExercisesRouter(controller, upload) {
  const router = Router();
  router.get('/fields', controller.fields);
  router.get('/exercises/field/:id', controller.byField);
  router.get('/exercises/random', controller.random);
  router.post('/exercises/save', requireUser, controller.saveProgress);
  router.post('/admin/exercises', requireAdmin, upload.single('image'), controller.create);
  return router;
}
