import React from 'react';
import { IconDice, IconArrowRight, IconBookOpen, IconSparkles, IconChart } from './Icons.jsx';

export default function Hero({ onRandomClick, onExploreClick, totalExercises = 0 }) {
  return (
    <section className="hero-banner">
      <div className="hero-glow-element hero-glow-1" aria-hidden="true"></div>
      <div className="hero-glow-element hero-glow-2" aria-hidden="true"></div>

      <div className="hero-content">
        <div className="hero-pill-badge">
          <IconSparkles size={14} className="hero-badge-sparkle" />
          <span>Matura z matematyki 2026 • Oficjalne wymagania CKE</span>
        </div>

        <h1 className="hero-title">
          Ćwicz zadania maturalne,{' '}
          <span className="text-gradient">analizuj wyniki</span> i zdaj na 100%!
        </h1>

        <p className="hero-description">
          Interaktywna platforma do systematycznej powtórki. Rozwiązuj zadania podzielone
          na oficjalne działy maturalne lub sprawdź się w ekspresowym losowym teście.
        </p>

        <div className="hero-cta-group">
          <button
            type="button"
            className="btn-primary btn-lg hero-primary-cta"
            onClick={onRandomClick}
          >
            <IconDice size={20} />
            <span>Losuj szybki zestaw</span>
          </button>

          <button
            type="button"
            className="btn-secondary btn-lg"
            onClick={onExploreClick}
          >
            <span>Wybierz dział z listy</span>
            <IconArrowRight size={18} />
          </button>
        </div>

        <div className="hero-stats-strip">
          <div className="hero-stat-item">
            <div className="stat-icon-box">
              <IconBookOpen size={18} />
            </div>
            <div className="stat-text-box">
              <strong className="stat-number">14</strong>
              <span className="stat-label">działów tematycznych</span>
            </div>
          </div>

          <div className="hero-stat-divider" aria-hidden="true"></div>

          <div className="hero-stat-item">
            <div className="stat-icon-box">
              <IconSparkles size={18} />
            </div>
            <div className="stat-text-box">
              <strong className="stat-number">{totalExercises > 0 ? totalExercises : 'Setki'}</strong>
              <span className="stat-label">oryginalnych zadań CKE</span>
            </div>
          </div>

          <div className="hero-stat-divider" aria-hidden="true"></div>

          <div className="hero-stat-item">
            <div className="stat-icon-box">
              <IconChart size={18} />
            </div>
            <div className="stat-text-box">
              <strong className="stat-number">100%</strong>
              <span className="stat-label">darmowe przygotowanie</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
