import React, { useState, useEffect } from 'react';
import { api } from '../api/restClient.js';
import {
  IconChart,
  IconTrophy,
  IconCheck,
  IconBookOpen,
  IconArrowRight,
  IconSparkles,
} from '../components/Icons.jsx';

export default function DashboardPage({ go, onError }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadDashboard = async () => {
      try {
        const result = await api.progress.getDashboard();
        if (active) setData(result);
      } catch (err) {
        if (active) onError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadDashboard();
    return () => { active = false; };
  }, [onError]);

  if (loading) {
    return (
      <div className="dashboard-loading-container">
        <div className="spinner-large"></div>
        <h2>Ładowanie Twoich statystyk...</h2>
      </div>
    );
  }

  const byField = data?.byField || [];
  const progressList = data?.progress || [];

  // Calculate high-level summary metrics
  const totalScore = byField.reduce((acc, f) => acc + (Number(f.score_sum) || 0), 0);
  const totalQuestions = byField.reduce((acc, f) => acc + (Number(f.total_sum) || 0), 0);
  const totalAttempts = byField.reduce((acc, f) => acc + (Number(f.attempts_count) || 0), 0);
  const overallEffectiveness = totalQuestions > 0
    ? Math.round((totalScore / totalQuestions) * 100)
    : 0;

  // Best field
  const sortedFields = [...byField].filter(f => f.total_sum > 0).sort((a, b) => {
    const rateA = a.score_sum / a.total_sum;
    const rateB = b.score_sum / b.total_sum;
    return rateB - rateA;
  });
  const bestField = sortedFields[0];

  return (
    <div className="dashboard-page-container">
      {/* Dashboard Header */}
      <header className="dashboard-header-modern">
        <div className="dashboard-badge-tag">
          <IconChart size={16} />
          <span>Panel ucznia</span>
        </div>
        <h1 className="dashboard-title">Twoje postępy w nauce</h1>
        <p className="dashboard-subtitle">
          Śledź skuteczność rozwiązywania zadań z poszczególnych działów i przygotuj się do egzaminu.
        </p>
      </header>

      {/* Overview Stat Cards Grid */}
      <div className="stats-overview-grid">
        <div className="stat-card-modern">
          <div className="stat-card-icon-box icon-purple">
            <IconTrophy size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Łączny wynik</span>
            <div className="stat-card-value">
              {totalScore} <span className="stat-card-sub">/ {totalQuestions} pkt</span>
            </div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-card-icon-box icon-blue">
            <IconChart size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Średnia skuteczność</span>
            <div className="stat-card-value">
              <span className={overallEffectiveness >= 70 ? 'text-success' : overallEffectiveness >= 40 ? 'text-warning' : 'text-danger'}>
                {overallEffectiveness}%
              </span>
            </div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-card-icon-box icon-emerald">
            <IconCheck size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Rozwiązane testy</span>
            <div className="stat-card-value">{totalAttempts}</div>
          </div>
        </div>

        <div className="stat-card-modern">
          <div className="stat-card-icon-box icon-amber">
            <IconSparkles size={24} />
          </div>
          <div className="stat-card-info">
            <span className="stat-card-label">Najlepszy dział</span>
            <div className="stat-card-value stat-best-name">
              {bestField ? `${bestField.number}. ${bestField.name}` : 'Brak danych'}
            </div>
          </div>
        </div>
      </div>

      {/* Per-field Progress Section */}
      <section className="dashboard-section-box">
        <div className="section-title-strip">
          <div>
            <h2 className="section-h2">Wyniki według działów CKE</h2>
            <p className="section-p">Przegląd opanowania materiału w każdym z działów tematycznych.</p>
          </div>
          <button
            type="button"
            className="btn-primary btn-sm"
            onClick={() => go('/')}
          >
            <span>Ćwicz dalej</span>
            <IconArrowRight size={14} />
          </button>
        </div>

        {byField.length === 0 ? (
          <div className="empty-state-box">
            <IconBookOpen size={32} />
            <p>Nie masz jeszcze zapisanych wyników. Rozwiąż swój pierwszy zestaw zadań!</p>
            <button type="button" className="btn-primary" onClick={() => go('/')}>
              Przejdź do zadań
            </button>
          </div>
        ) : (
          <div className="field-progress-list">
            {byField.map((item, idx) => {
              const eff = item.total_sum ? Math.round((item.score_sum / item.total_sum) * 100) : 0;
              return (
                <div key={`${item.number}-${idx}`} className="field-progress-row">
                  <div className="field-row-header">
                    <div className="field-row-title-group">
                      <span className="field-row-num">{item.number}</span>
                      <strong className="field-row-name">{item.name}</strong>
                    </div>
                    <div className="field-row-stats">
                      <span className="field-row-attempts">
                        {item.attempts_count} {item.attempts_count === 1 ? 'podejście' : 'podejść'}
                      </span>
                      <span className="field-row-score">
                        {item.score_sum} / {item.total_sum} pkt
                      </span>
                      <span className={`field-row-percent ${eff >= 70 ? 'pill-success' : eff >= 40 ? 'pill-warning' : 'pill-danger'}`}>
                        {eff}%
                      </span>
                    </div>
                  </div>

                  <div className="field-progress-track">
                    <div
                      className={`field-progress-bar ${eff >= 70 ? 'bar-success' : eff >= 40 ? 'bar-warning' : 'bar-danger'}`}
                      style={{ width: `${Math.max(2, eff)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* History of Attempts Section */}
      <section className="dashboard-section-box">
        <div className="section-title-strip">
          <div>
            <h2 className="section-h2">Historia ostatnich podejść</h2>
            <p className="section-p">Chronologiczna lista rozwiązanych zestawów zadań.</p>
          </div>
        </div>

        {progressList.length === 0 ? (
          <div className="empty-state-box">
            <p>Historia podejść pojawi się tutaj po rozwiązaniu pierwszego zestawu.</p>
          </div>
        ) : (
          <div className="table-responsive-wrapper">
            <table className="table-modern">
              <thead>
                <tr>
                  <th>Data i godzina</th>
                  <th>Dział</th>
                  <th>Wynik punktowy</th>
                  <th>Skuteczność</th>
                </tr>
              </thead>
              <tbody>
                {progressList.map((item, index) => {
                  const eff = item.total ? Math.round((item.score / item.total) * 100) : 0;
                  return (
                    <tr key={`${item.solved_at}-${index}`}>
                      <td className="table-date-cell">
                        {new Date(item.solved_at).toLocaleString('pl-PL', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="table-bold-cell">{item.name}</td>
                      <td>
                        <span className="table-score-pill">
                          {item.score} / {item.total}
                        </span>
                      </td>
                      <td>
                        <span className={`badge-status ${eff >= 70 ? 'badge-success' : eff >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                          {eff}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
