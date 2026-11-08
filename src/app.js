import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import errorHandler from './middleware/errorHandler.js';
import { notFoundHandler } from './middleware/errorHandler.js';
import requestContext from './middleware/requestContext.js';
import { validate } from './middleware/validate.js';
import { emptySchema } from './schemas/common.schemas.js';
import { createAuthService } from './modules/auth/auth.service.js';
import { createAuthController } from './modules/auth/auth.controller.js';
import { createAuthRouter } from './modules/auth/auth.routes.js';
import { createExercisesService } from './modules/exercises/exercises.service.js';
import { createExercisesController } from './modules/exercises/exercises.controller.js';
import { createExercisesRouter } from './modules/exercises/exercises.routes.js';
import { createProgressService } from './modules/progress/progress.service.js';
import { createProgressController } from './modules/progress/progress.controller.js';
import { createProgressRouter } from './modules/progress/progress.routes.js';
import { createAdminService } from './modules/admin/admin.service.js';
import { createAdminController } from './modules/admin/admin.controller.js';
import { createAdminRouter } from './modules/admin/admin.routes.js';

const here = path.dirname(fileURLToPath(import.meta.url));

export function createApp({ repositories, upload }) {
  const app = express();

  app.set('trust proxy', 1);
  app.use(requestContext);
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use('/public', express.static(path.resolve(here, '../public')));

  const authController = createAuthController(createAuthService(repositories.auth));
  const exerciseController = createExercisesController(createExercisesService(repositories.exercises));
  const progressController = createProgressController(createProgressService(repositories.progress));
  const adminController = createAdminController(createAdminService(repositories.admin));

  app.use('/api', createAuthRouter(authController));
  app.use('/api', createExercisesRouter(exerciseController, upload));
  app.use('/auth', createAuthRouter(authController));
  app.use('/', createExercisesRouter(exerciseController, upload));
  app.use('/', createProgressRouter(progressController));
  app.use('/admin', createAdminRouter(adminController));
  app.get('/api/debug/crash', validate({ params: emptySchema, query: emptySchema, body: emptySchema }), (_req, _res, next) => next(new Error('boom')));
  app.use('/api', notFoundHandler);

  const dist = path.resolve(here, '../dist');
  app.use(express.static(dist));
  app.get(/.*/, (_req, res) => res.sendFile(path.join(dist, 'index.html')));
  app.use(errorHandler);
  return app;
}
