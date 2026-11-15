import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconChart,
  IconShield,
  IconLogIn,
  IconLogOut,
  IconUser,
  IconSparkles,
} from './Icons.jsx';

export default function Navbar({ currentPath, go }) {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigate = (path) => {
    go(path);
    setMobileMenuOpen(false);
  };

  const isActive = (path) => {
    if (path === '/') return currentPath === '/';
    return currentPath.startsWith(path);
  };

  return (
    <header className="navbar-header">
      <div className="navbar-container">
        {/* Brand: Samo "Zdasz.to" z podpisem "Matura z matematyki" */}
        <a
          href="/"
          className="brand-logo"
          onClick={(e) => {
            e.preventDefault();
            navigate('/');
          }}
        >
          <div className="brand-text-group">
            <span className="brand-title">Zdasz<span className="brand-accent">.to</span></span>
            <span className="brand-badge">Matura z matematyki</span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="desktop-nav" aria-label="Główna nawigacja">
          <a
            href="/"
            className={`nav-link ${isActive('/') && currentPath === '/' ? 'active' : ''}`}
            onClick={(e) => {
              e.preventDefault();
              navigate('/');
            }}
          >
            <IconSparkles size={16} />
            <span>Zadania</span>
          </a>

          {user && (
            <a
              href="/dashboard"
              className={`nav-link ${isActive('/dashboard') ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard');
              }}
            >
              <IconChart size={16} />
              <span>Twoje postępy</span>
            </a>
          )}

          {user?.isAdmin && (
            <a
              href="/admin"
              className={`nav-link admin-nav-link ${isActive('/admin') ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigate('/admin');
              }}
            >
              <IconShield size={16} />
              <span>Panel administratora</span>
            </a>
          )}
        </nav>

        {/* Action Controls & User Status */}
        <div className="navbar-actions">
          {user ? (
            <div className="user-profile-menu">
              <div className="user-pill" title={`Zalogowany jako ${user.username}`}>
                <div className="user-avatar">
                  {user.username.charAt(0).toUpperCase()}
                </div>
                <div className="user-info">
                  <span className="user-name">{user.username}</span>
                  {user.isAdmin && <span className="user-role-badge">Admin</span>}
                </div>
              </div>
              <button
                type="button"
                className="btn-ghost btn-sm logout-btn"
                onClick={logout}
                title="Wyloguj się"
              >
                <IconLogOut size={16} />
                <span className="hide-on-mobile">Wyloguj</span>
              </button>
            </div>
          ) : (
            <div className="guest-actions">
              <a
                href="/login"
                className="btn-ghost btn-sm"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/login');
                }}
              >
                <IconLogIn size={16} />
                <span>Logowanie</span>
              </a>
              <a
                href="/register"
                className="btn-primary btn-sm register-highlight-btn"
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
              >
                <span>Rejestracja</span>
              </a>
            </div>
          )}

          {/* Mobile hamburger button */}
          <button
            type="button"
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Otwórz menu nawigacji"
            aria-expanded={mobileMenuOpen}
          >
            <span className={`hamburger-bar ${mobileMenuOpen ? 'open' : ''}`}></span>
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="mobile-drawer">
          <nav className="mobile-nav-links">
            <a
              href="/"
              className={`mobile-nav-link ${isActive('/') && currentPath === '/' ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                navigate('/');
              }}
            >
              <IconSparkles size={18} />
              <span>Zadania i działy</span>
            </a>

            {user && (
              <a
                href="/dashboard"
                className={`mobile-nav-link ${isActive('/dashboard') ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/dashboard');
                }}
              >
                <IconChart size={18} />
                <span>Twoje postępy</span>
              </a>
            )}

            {user?.isAdmin && (
              <a
                href="/admin"
                className={`mobile-nav-link ${isActive('/admin') ? 'active' : ''}`}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/admin');
                }}
              >
                <IconShield size={18} />
                <span>Panel administratora</span>
              </a>
            )}

            {!user ? (
              <div className="mobile-guest-links">
                <a
                  href="/login"
                  className="btn-secondary btn-full"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/login');
                  }}
                >
                  <IconLogIn size={18} />
                  <span>Logowanie</span>
                </a>
                <a
                  href="/register"
                  className="btn-primary btn-full"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate('/register');
                  }}
                >
                  <span>Utwórz darmowe konto</span>
                </a>
              </div>
            ) : (
              <div className="mobile-user-actions">
                <button
                  type="button"
                  className="btn-secondary btn-full"
                  onClick={logout}
                >
                  <IconLogOut size={18} />
                  <span>Wyloguj się ({user.username})</span>
                </button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
