import bcrypt from 'bcryptjs';
import AppError from '../../errors/AppError.js';
import { parseLogin, parseRegistration } from './auth.schemas.js';
import { toUserView } from './auth.mapper.js';

export function createAuthService(repository) {
  return {
    async login(body) {
      const input = parseLogin(body);
      const user = await repository.findByEmail(input.email);
      if (!user || !(await bcrypt.compare(input.password, user.password))) throw new AppError('Niepoprawny email lub hasło.', 401);
      return { user: toUserView(user), returnUrl: input.returnUrl };
    },
    async register(body) {
      const input = parseRegistration(body);
      try {
        const user = await repository.create({ ...input, passwordHash: await bcrypt.hash(input.password, 10) });
        return { user: toUserView({ ...user, is_admin: false }), returnUrl: input.returnUrl };
      } catch (error) {
        if (error.code === '23505') throw new AppError('Nazwa lub email jest już zajęty.', 409);
        throw error;
      }
    },
  };
}
