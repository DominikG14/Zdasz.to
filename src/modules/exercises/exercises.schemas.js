import AppError from '../../errors/AppError.js';

export const parseLimit = (value, fallback, max) => {
  const n = Number(value);
  return Math.max(1, Math.min(max, Number.isFinite(n) && n !== 0 ? n : fallback));
};
export function parseProgress(body = {}) {
  const fieldId = Number(body.field_id), score = Number(body.score), total = Number(body.total);
  if (!Number.isInteger(fieldId) || fieldId <= 0 || !Number.isInteger(score) || !Number.isInteger(total) || total < 1 || score < 0 || score > total) throw new AppError('Niepoprawne dane', 400);
  return { fieldId, score, total };
}
export function parseNewExercise(body = {}, file) {
  const fieldId = Number(body.field_id), type = body.type, answer = String(body.right_answer || '').toUpperCase();
  if (!file || !Number.isInteger(fieldId) || fieldId <= 0 || !['ABCD', 'PF'].includes(type) || !(type === 'ABCD' ? /^[A-D]$/.test(answer) : /^(PP|PF|FP|FF)$/.test(answer))) throw new AppError('Sprawdź typ, odpowiedź i obraz PNG/JPG/GIF', 400);
  return { fieldId, type, answer };
}
