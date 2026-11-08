import jwt from 'jsonwebtoken';
import AppError from '../../errors/AppError.js';

const secret = () => {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32 || value.startsWith('replace-this-')) {
    if (process.env.NODE_ENV === 'production') throw new Error('JWT_SECRET must contain at least 32 characters in production');
    return value || 'development-only-zdasz-to-jwt-secret';
  }
  return value;
};

export function assertJwtConfiguration() {
  secret();
}

export function issueAccessToken(user) {
  return jwt.sign({
    username: user.username,
    email: user.email,
    isAdmin: Boolean(user.isAdmin),
  }, secret(), {
    algorithm: 'HS256',
    subject: String(user.id),
    issuer: 'zdasz.to',
    expiresIn: '7d',
  });
}

export function verifyAccessToken(token) {
  try {
    const payload = jwt.verify(token, secret(), { algorithms: ['HS256'], issuer: 'zdasz.to' });
    const id = Number(payload.sub);
    if (!Number.isInteger(id) || id <= 0 || typeof payload.username !== 'string' || typeof payload.email !== 'string' || typeof payload.isAdmin !== 'boolean') {
      throw new Error('Invalid JWT claims');
    }
    return { id, username: payload.username, email: payload.email, isAdmin: payload.isAdmin };
  } catch {
    throw new AppError('Token jest nieprawidłowy lub wygasł', { statusCode: 401, code: 'UNAUTHENTICATED' });
  }
}
