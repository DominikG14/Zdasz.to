import AppError from '../../errors/AppError.js';

export function parseUserId(value) {
  const id = Number(value);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('Niepoprawne ID użytkownika', 400);
  return id;
}
export const parseSearch = value => String(value || '').trim().slice(0, 100);
