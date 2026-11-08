import 'dotenv/config';
import knexFactory from 'knex';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { assertJwtConfiguration } from './modules/auth/auth.jwt.js';
import knexConfig from '../knexfile.js';
import { createKnexQuery } from './db/knexQuery.js';
import { createAuthRepository } from './modules/auth/auth.repository.knex.js';
import { createExercisesRepository } from './modules/exercises/exercises.repository.knex.js';
import { createProgressRepository } from './modules/progress/progress.repository.knex.js';
import { createAdminRepository } from './modules/admin/admin.repository.knex.js';

assertJwtConfiguration();
const knex = knexFactory(knexConfig[process.env.NODE_ENV === 'production' ? 'production' : 'development']);
const query = createKnexQuery(knex);
const repositories = {
  auth: createAuthRepository(query),
  exercises: createExercisesRepository(query),
  progress: createProgressRepository(query),
  admin: createAdminRepository(query),
};

const here = path.dirname(fileURLToPath(import.meta.url));
const uploadDirectory = path.resolve(here, '../public/images/exercises/uploads');
mkdirSync(uploadDirectory, { recursive: true });
const upload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, callback) => callback(null, uploadDirectory),
    filename: (_req, file, callback) => callback(null, `${Date.now()}_${crypto.randomBytes(5).toString('hex')}${path.extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter: (_req, file, callback) => callback(null, /^image\/(png|jpeg|gif)$/.test(file.mimetype)),
});

const app = createApp({ repositories, upload });
app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Zdasz.to server listening'));
