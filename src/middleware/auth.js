import AppError from '../errors/AppError.js';
import { verifyAccessToken } from '../modules/auth/auth.jwt.js';

function getBearerToken(req) {
  const authorization = req.get('Authorization');
  if (!authorization) return null;
  const match = /^Bearer\s+(.+)$/i.exec(authorization);
  if (!match) throw new AppError('Wymagany token Bearer', { statusCode: 401, code: 'UNAUTHENTICATED' });
  return match[1];
}

export function optionalAuth(req, _res, next) {
  try {
    const token = getBearerToken(req);
    req.user = token ? verifyAccessToken(token) : null;
    next();
  } catch (error) {
    next(error);
  }
}

export function requireUser(req, res, next) {
  try {
    const token = getBearerToken(req);
    if (!token) throw new AppError('Zaloguj się', { statusCode: 401, code: 'UNAUTHENTICATED' });
    req.user = verifyAccessToken(token);
  } catch (error) {
    return next(error);
  }
  next();
}

export function requireAdmin(req, res, next) {
  requireUser(req, res, error => {
    if (error) return next(error);
    if (!req.user?.isAdmin) return next(new AppError('Brak uprawnień', { statusCode: 403, code: 'FORBIDDEN' }));
    next();
  });
}
