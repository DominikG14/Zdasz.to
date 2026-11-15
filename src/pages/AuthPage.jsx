import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconLogIn,
  IconUser,
  IconCheck,
  IconEye,
  IconEyeOff,
  IconSparkles,
} from '../components/Icons.jsx';

export default function AuthPage({ register: isRegisterMode, go, onError }) {
  const { login, register } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form states
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState('');
  const [localError, setLocalError] = useState('');

  const returnUrl = new URLSearchParams(location.search).get('returnUrl') || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');

    if (isRegisterMode) {
      if (password !== password2) {
        setLocalError('Hasła nie są identyczne.');
        return;
      }
      if (password.length < 8) {
        setLocalError('Hasło musi mieć co najmniej 8 znaków.');
        return;
      }
      if (!/[a-z]/.test(password)) {
        setLocalError('Hasło musi zawierać co najmniej jedną małą literę.');
        return;
      }
      if (!/\d/.test(password)) {
        setLocalError('Hasło musi zawierać co najmniej jedną cyfrę.');
        return;
      }
    }

    setLoading(true);
    try {
      if (isRegisterMode) {
        await register({ username, email, password, password2, returnUrl });
      } else {
        await login({ email, password, returnUrl });
      }
    } catch (err) {
      setLocalError(err.message);
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Quick fill demo administrator account
  const fillAdminCredentials = () => {
    setEmail('admin@example.com');
    setPassword('admin');
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card-modern">
        {/* Card Header & Switcher */}
        <div className="auth-card-header">
          <div className="auth-tabs-pill">
            <button
              type="button"
              className={`auth-tab-btn ${!isRegisterMode ? 'active' : ''}`}
              onClick={() => {
                setLocalError('');
                go(`/login${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
              }}
            >
              Logowanie
            </button>
            <button
              type="button"
              className={`auth-tab-btn ${isRegisterMode ? 'active' : ''}`}
              onClick={() => {
                setLocalError('');
                go(`/register${returnUrl !== '/' ? `?returnUrl=${encodeURIComponent(returnUrl)}` : ''}`);
              }}
            >
              Rejestracja
            </button>
          </div>

          <h1 className="auth-title">
            {isRegisterMode ? 'Utwórz bezpłatne konto' : 'Witaj z powrotem!'}
          </h1>
          <p className="auth-subtitle">
            {isRegisterMode
              ? 'Dołącz do społeczności maturzystów i śledź swoje wyniki.'
              : 'Zaloguj się, aby kontynuować przygotowania do matury.'}
          </p>
        </div>

        {/* Error notification */}
        {localError && (
          <div className="auth-error-banner" role="alert">
            <span>{localError}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="auth-form-modern">
          {isRegisterMode && (
            <div className="form-field-group">
              <label htmlFor="reg-username" className="form-label">
                Nazwa użytkownika
              </label>
              <div className="input-with-icon">
                <input
                  id="reg-username"
                  type="text"
                  required
                  maxLength={50}
                  autoComplete="username"
                  placeholder="np. Michal_2026"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-modern"
                />
              </div>
            </div>
          )}

          <div className="form-field-group">
            <label htmlFor="auth-email" className="form-label">
              Adres e-mail
            </label>
            <div className="input-with-icon">
              <input
                id="auth-email"
                type="email"
                required
                autoComplete="email"
                placeholder="twoj@email.pl"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-modern"
              />
            </div>
          </div>

          <div className="form-field-group">
            <div className="label-with-hint">
              <label htmlFor="auth-password" className="form-label">
                Hasło
              </label>
            </div>
            <div className="input-with-icon-right">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={isRegisterMode ? 8 : 1}
                autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-modern"
              />
              <button
                type="button"
                className="password-toggle-btn"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Ukryj hasło' : 'Pokaż hasło'}
              >
                {showPassword ? <IconEyeOff size={18} /> : <IconEye size={18} />}
              </button>
            </div>
          </div>

          {isRegisterMode && (
            <div className="form-field-group">
              <label htmlFor="auth-password-confirm" className="form-label">
                Powtórz hasło
              </label>
              <div className="input-with-icon-right">
                <input
                  id="auth-password-confirm"
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  value={password2}
                  onChange={(e) => setPassword2(e.target.value)}
                  className="input-modern"
                />
              </div>

              {/* Password criteria checklist */}
              <div className="password-requirements-box">
                <span className={`requirement-item ${password.length >= 8 ? 'valid' : ''}`}>
                  <IconCheck size={12} /> Min. 8 znaków
                </span>
                <span className={`requirement-item ${/\d/.test(password) ? 'valid' : ''}`}>
                  <IconCheck size={12} /> Co najmniej jedna cyfra
                </span>
                <span className={`requirement-item ${/[a-z]/.test(password) ? 'valid' : ''}`}>
                  <IconCheck size={12} /> Przynajmniej jedna mała litera
                </span>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary btn-full btn-lg auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="button-loading-text">Przetwarzanie...</span>
            ) : isRegisterMode ? (
              <>
                <IconUser size={18} />
                <span>Utwórz bezpłatne konto</span>
              </>
            ) : (
              <>
                <IconLogIn size={18} />
                <span>Zaloguj się do platformy</span>
              </>
            )}
          </button>
        </form>

        {/* Demo credentials helper for quick testing */}
        {!isRegisterMode && (
          <div className="demo-credentials-box">
            <div className="demo-credentials-top">
              <IconSparkles size={16} />
              <span>Szybkie logowanie testowe:</span>
            </div>
            <button
              type="button"
              className="btn-ghost btn-sm demo-fill-btn"
              onClick={fillAdminCredentials}
            >
              Wypełnij dane administratora (admin@example.com)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
