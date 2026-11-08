import AppError from '../errors/AppError.js';
import NotFoundError from '../errors/NotFoundError.js';
import ValidationError from '../errors/ValidationError.js';
import ConflictError from '../errors/ConflictError.js';

export function notFoundHandler(req, _res, next) {
  next(new NotFoundError(`Nie znaleziono endpointu: ${req.method} ${req.originalUrl}`));
}

export default function errorHandler(error, req, res, _next) {
  let normalized = error;
  if (error instanceof SyntaxError && error.status === 400 && 'body' in error) {
    normalized = new AppError('Niepoprawny JSON w body', { statusCode: 400, code: 'INVALID_JSON' });
  } else if (error?.name === 'MulterError') {
    normalized = new AppError(error.code === 'LIMIT_FILE_SIZE' ? 'Plik przekracza maksymalny rozmiar 8 MB' : 'Niepoprawny upload pliku', { statusCode: 400, code: 'INVALID_UPLOAD' });
  } else if (!(error instanceof AppError)) {
    console.error(JSON.stringify({ requestId: req.requestId, message: error?.message, stack: error?.stack }));
    normalized = new AppError('Wewnętrzny błąd serwera');
  }

  if (res.headersSent) return;
  const response = {
    error: {
      code: normalized.code || (normalized instanceof NotFoundError ? 'NOT_FOUND' : normalized instanceof ValidationError ? 'VALIDATION_ERROR' : normalized instanceof ConflictError ? 'CONFLICT' : 'INTERNAL_ERROR'),
      message: normalized.message,
      requestId: req.requestId,
    },
  };
  if (normalized.details) response.error.details = normalized.details;
  res.status(normalized.statusCode || 500).json(response);
}
