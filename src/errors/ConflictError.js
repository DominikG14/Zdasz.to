import AppError from './AppError.js';

export default class ConflictError extends AppError {
  constructor(message) {
    super(message, { statusCode: 409, code: 'CONFLICT' });
    this.name = 'ConflictError';
  }
}
