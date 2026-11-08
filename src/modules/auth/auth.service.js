import bcrypt from 'bcryptjs';
import AppError from '../../errors/AppError.js';
import ConflictError from '../../errors/ConflictError.js';
import { toUserView } from './auth.mapper.js';
import { issueAccessToken } from './auth.jwt.js';

export function createAuthService(repository) {
  return {
    async login(body) {
      const user = await repository.findByEmail(body.email);
      if (!user || !(await bcrypt.compare(body.password, user.password))) throw new AppError('Niepoprawny email lub hasło.', { statusCode: 401, code: 'UNAUTHENTICATED' });
      const view = toUserView(user);
      return { user: view, token: issueAccessToken(view), returnUrl: body.returnUrl };
    },
    async register(body) {
      try {
        const user = await repository.create({ ...body, passwordHash: await bcrypt.hash(body.password, 10) });
        const view = toUserView({ ...user, is_admin: false });
        return { user: view, token: issueAccessToken(view), returnUrl: body.returnUrl };
      } catch (error) {
        if (error.code === '23505') throw new ConflictError('Nazwa lub email jest już zajęty.');
        throw error;
      }
    },
  };
}
