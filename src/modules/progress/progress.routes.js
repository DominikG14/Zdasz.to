import { Router } from 'express';
import { requireAdmin, requireUser } from '../../middleware/auth.js';

export function createProgressRouter(controller) {
  const router = Router();
  router.get('/dashboard', requireUser, controller.dashboard);
  router.get('/admin/users/:id/progress', requireAdmin, controller.userProgress);
  return router;
}
