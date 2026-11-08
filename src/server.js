import pg from 'pg';
import multer from 'multer';
import path from 'node:path';
import crypto from 'node:crypto';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { createApp } from './app.js';
import { createAuthRepository } from './modules/auth/auth.repository.js';
import { createExercisesRepository } from './modules/exercises/exercises.repository.js';
import { createProgressRepository } from './modules/progress/progress.repository.js';
import { createAdminRepository } from './modules/admin/admin.repository.js';

const { Pool } = pg;
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  port: Number(process.env.DB_PORT || 5432),
  database: process.env.DB_NAME || 'db',
  user: process.env.DB_USERNAME || 'docker',
  password: process.env.DB_PASSWORD || 'docker',
});
const query = (sql, values = []) => pool.query(sql, values);
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

const app = createApp({ pool, repositories, upload });
app.listen(Number(process.env.PORT || 3000), '0.0.0.0', () => console.log('Zdasz.to server listening'));
