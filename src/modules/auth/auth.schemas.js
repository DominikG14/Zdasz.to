import AppError from '../../errors/AppError.js';

export function parseLogin(body = {}) {
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  if (email.length > 255 || password.length > 128) throw new AppError('Niepoprawne dane logowania.', 400);
  return { email, password, returnUrl: body.returnUrl };
}

export function parseRegistration(body = {}) {
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim();
  const password = String(body.password || '');
  if (!username || username.length > 50 || email.length > 255 || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8 || password.length > 128 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password) || password !== body.password2) {
    throw new AppError('Sprawdź dane. Hasło musi mieć 8 znaków, małą i wielką literę oraz cyfrę.', 400);
  }
  return { username, email, password, returnUrl: body.returnUrl };
}

export const safeReturn = value => typeof value === 'string' && value.startsWith('/') && !value.startsWith('//') ? value : '/';
