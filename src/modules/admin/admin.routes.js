import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth.js';
import { validate } from '../../middleware/validate.js';
import { emptyBodySchema, emptyParamsSchema, emptyQuerySchema, userIdParamsSchema, usersQuerySchema } from './admin.schemas.js';

export function createAdminRouter(controller) {
  const router = Router();
  router.use(requireAdmin);
  router.get('/users', validate({ params: emptyParamsSchema, query: usersQuerySchema, body: emptyBodySchema }), controller.users);
  router.delete('/users/:id', validate({ params: userIdParamsSchema, query: emptyQuerySchema, body: emptyBodySchema }), controller.removeUser);
  router.get('/exercises', validate({ params: emptyParamsSchema, query: emptyQuerySchema, body: emptyBodySchema }), controller.exercises);
  return router;
}
