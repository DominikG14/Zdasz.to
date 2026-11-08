import AppError from './AppError.js';

export default class ValidationError extends AppError {
  constructor(details) {
    super('validation failed', { statusCode: 400, code: 'VALIDATION_ERROR', details });
    this.name = 'ValidationError';
  }
}
