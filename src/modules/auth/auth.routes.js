import { Router } from 'express';

export function createAuthRouter(controller) {
  const router = Router();
  router.get('/me', controller.me);
  router.post('/login', controller.login);
  router.post('/register', controller.register);
  router.post('/logout', controller.logout);
  return router;
}
