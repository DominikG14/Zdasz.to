import AppError from '../errors/AppError.js';

export function requireUser(req, res, next) {
  if (!req.session.user) return next(new AppError('Zaloguj się', { statusCode: 401, code: 'UNAUTHENTICATED' }));
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session.user?.isAdmin) return next(new AppError('Brak uprawnień', { statusCode: 403, code: 'FORBIDDEN' }));
  next();
}
