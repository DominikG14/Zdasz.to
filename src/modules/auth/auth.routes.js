import { Router } from 'express';
import { validate } from '../../middleware/validate.js';
import { optionalAuth } from '../../middleware/auth.js';
import { emptySchema } from '../../schemas/common.schemas.js';
import { loginBodySchema, registrationBodySchema } from './auth.schemas.js';

export function createAuthRouter(controller) {
  const router = Router();
  router.get('/me', validate({ params: emptySchema, query: emptySchema, body: emptySchema }), optionalAuth, controller.me);
  router.post('/login', validate({ params: emptySchema, query: emptySchema, body: loginBodySchema }), controller.login);
  router.post('/register', validate({ params: emptySchema, query: emptySchema, body: registrationBodySchema }), controller.register);
  router.post('/logout', validate({ params: emptySchema, query: emptySchema, body: emptySchema }), controller.logout);
  return router;
}
