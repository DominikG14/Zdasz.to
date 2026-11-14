import { Router } from 'express';
import { requireAdmin, requireUser } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { emptyParamsSchema, emptyQuerySchema, exerciseIdParamsSchema, fieldParamsSchema, fieldQuerySchema, newExerciseBodySchema, progressBodySchema, randomQuerySchema } from './exercises.schemas.js';

export function createExercisesRouter(controller, upload) {
  const router = Router();
  router.get('/fields', validate({ params: emptyParamsSchema, query: emptyQuerySchema, body: emptyQuerySchema }), controller.fields);
  router.get('/exercises/field/:id', validate({ params: fieldParamsSchema, query: fieldQuerySchema, body: emptyQuerySchema }), controller.byField);
  router.get('/exercises/random', validate({ params: emptyParamsSchema, query: randomQuerySchema, body: emptyQuerySchema }), controller.random);
  router.post('/exercises/save', validate({ params: emptyParamsSchema, query: emptyQuerySchema, body: progressBodySchema }), requireUser, controller.saveProgress);
  router.post('/admin/exercises', requireAdmin, upload.single('image'), validate({ params: emptyParamsSchema, query: emptyQuerySchema, body: newExerciseBodySchema }), controller.create);
  router.delete('/admin/exercises/:id', requireAdmin, validate({ params: exerciseIdParamsSchema, query: emptyQuerySchema, body: emptyQuerySchema }), controller.remove);
  return router;
}
