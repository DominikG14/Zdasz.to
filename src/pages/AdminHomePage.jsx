import React from 'react';
import AdminNav from '../components/AdminNav.jsx';
import { IconUser, IconBookOpen, IconArrowRight, IconShield } from '../components/Icons.jsx';

export default function AdminHomePage({ go }) {
  return (
    <div className="admin-page-container">
      <AdminNav go={go} active="overview" />

      <header className="admin-header-strip">
        <div className="admin-shield-badge">
          <IconShield size={18} />
          <span>Panel Zarządzania</span>
        </div>
        <h1 className="admin-title">Panel administratora Zdasz.to</h1>
        <p className="admin-subtitle">
          Wybierz moduł, którym chcesz zarządzać: konta użytkowników lub katalog zadań maturalnych.
        </p>
      </header>

      <div className="admin-cards-grid">
        <div
          className="admin-feature-card"
          role="button"
          tabIndex={0}
          onClick={() => go('/admin/users')}
          onKeyDown={(e) => { if (e.key === 'Enter') go('/admin/users'); }}
        >
          <div className="admin-feature-top">
            <div className="admin-card-icon-box icon-purple">
              <IconUser size={28} />
            </div>
            <span className="admin-feature-num">01</span>
          </div>

          <div className="admin-feature-body">
            <h2 className="admin-feature-title">Użytkownicy i konta</h2>
            <p className="admin-feature-desc">
              Przeglądaj zarejestrowane konta, sprawdzaj indywidualne postępy uczniów i zarządzaj dostępem.
            </p>
          </div>

          <div className="admin-feature-footer">
            <span className="admin-card-cta">
              <span>Zarządzaj kontami</span>
              <IconArrowRight size={16} />
            </span>
          </div>
        </div>

        <div
          className="admin-feature-card"
          role="button"
          tabIndex={0}
          onClick={() => go('/admin/exercises')}
          onKeyDown={(e) => { if (e.key === 'Enter') go('/admin/exercises'); }}
        >
          <div className="admin-feature-top">
            <div className="admin-card-icon-box icon-emerald">
              <IconBookOpen size={28} />
            </div>
            <span className="admin-feature-num">02</span>
          </div>

          <div className="admin-feature-body">
            <h2 className="admin-feature-title">Katalog zadań maturalnych</h2>
            <p className="admin-feature-desc">
              Dodawaj nowe zadania z arkuszy maturalnych (pliki graficzne), przypisuj działy oraz poprawne odpowiedzi.
            </p>
          </div>

          <div className="admin-feature-footer">
            <span className="admin-card-cta">
              <span>Zarządzaj zadaniami</span>
              <IconArrowRight size={16} />
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
