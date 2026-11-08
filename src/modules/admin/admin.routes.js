import { Router } from 'express';
import { requireAdmin } from '../../middleware/auth.js';

export function createAdminRouter(controller) {
  const router = Router();
  router.use(requireAdmin);
  router.get('/users', controller.users);
  router.delete('/users/:id', controller.removeUser);
  router.get('/exercises', controller.exercises);
  return router;
}
