import { Router } from 'express';
import { requireAdmin, requireUser } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { emptyBodySchema, emptyParamsSchema, emptyQuerySchema, userIdParamsSchema } from '../admin/admin.schemas.js';

export function createProgressRouter(controller) {
  const router = Router();
  router.get('/dashboard', validate({ params: emptyParamsSchema, query: emptyQuerySchema, body: emptyBodySchema }), requireUser, controller.dashboard);
  router.get('/admin/users/:id/progress', validate({ params: userIdParamsSchema, query: emptyQuerySchema, body: emptyBodySchema }), requireAdmin, controller.userProgress);
  return router;
}
