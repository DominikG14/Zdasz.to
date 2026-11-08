import AppError from './AppError.js';

export default class NotFoundError extends AppError {
  constructor(message = 'Nie znaleziono zasobu') {
    super(message, { statusCode: 404, code: 'NOT_FOUND' });
    this.name = 'NotFoundError';
  }
}
