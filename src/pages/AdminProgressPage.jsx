import React, { useState, useEffect } from 'react';
import AdminNav from '../components/AdminNav.jsx';
import { api } from '../api/restClient.js';
import { IconArrowLeft, IconUser, IconChart } from '../components/Icons.jsx';

export default function AdminProgressPage({ id, go, onError }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    const loadProgress = async () => {
      try {
        setLoading(true);
        const result = await api.admin.getUserProgress(id);
        if (active) setData(result);
      } catch (err) {
        if (active) onError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadProgress();
    return () => { active = false; };
  }, [id, onError]);

  if (loading) {
    return (
      <div className="admin-page-container">
        <AdminNav go={go} active="users" />
        <div className="table-loading-container">
          <div className="spinner"></div>
          <p>Ładowanie postępów użytkownika...</p>
        </div>
      </div>
    );
  }

  const byField = data?.byField || [];
  const progressList = data?.progress || [];

  return (
    <div className="admin-page-container">
      <AdminNav go={go} active="users" />

      <div className="admin-subnav-bar">
        <button
          type="button"
          className="btn-ghost btn-sm"
          onClick={() => go('/admin/users')}
        >
          <IconArrowLeft size={16} />
          <span>Powrót do listy użytkowników</span>
        </button>
      </div>

      <header className="admin-header-strip">
        <div className="user-profile-badge">
          <IconUser size={18} />
          <span>Profil ucznia</span>
        </div>
        <h1 className="admin-title">
          Postępy: <strong>{data?.username || `ID ${id}`}</strong>
        </h1>
        <p className="admin-subtitle">
          Szczegółowa analityka rozwiązywania arkuszy przez tego użytkownika.
        </p>
      </header>

      {/* Per-field Section */}
      <section className="dashboard-section-box">
        <h2 className="section-h2">Postępy według działów CKE</h2>
        <div className="table-responsive-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Dział</th>
                <th>Liczba podejść</th>
                <th>Wynik punktowy</th>
                <th>Skuteczność</th>
                <th>Ostatnia aktywność</th>
              </tr>
            </thead>
            <tbody>
              {byField.length === 0 ? (
                <tr>
                  <td colSpan="5" className="table-empty-cell">
                    Użytkownik nie rozwiązał jeszcze żadnych zadań.
                  </td>
                </tr>
              ) : (
                byField.map((item) => (
                  <tr key={item.number}>
                    <td className="table-bold-cell">{item.number}. {item.name}</td>
                    <td>{item.attempts_count}</td>
                    <td>{item.score_sum} / {item.total_sum}</td>
                    <td>
                      <span className={`badge-status ${item.effectiveness_percent >= 70 ? 'badge-success' : item.effectiveness_percent >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                        {item.effectiveness_percent}%
                      </span>
                    </td>
                    <td className="table-date-cell">
                      {item.last_solved_at
                        ? new Date(item.last_solved_at).toLocaleString('pl-PL')
                        : '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent attempts */}
      <section className="dashboard-section-box">
        <h2 className="section-h2">Ostatnie podejścia do testów</h2>
        <div className="table-responsive-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th>Data</th>
                <th>Dział</th>
                <th>Punkty</th>
                <th>Skuteczność</th>
              </tr>
            </thead>
            <tbody>
              {progressList.length === 0 ? (
                <tr>
                  <td colSpan="4" className="table-empty-cell">
                    Brak historii podejść.
                  </td>
                </tr>
              ) : (
                progressList.map((item, index) => {
                  const eff = item.total ? Math.round((item.score / item.total) * 100) : 0;
                  return (
                    <tr key={`${item.solved_at}-${index}`}>
                      <td className="table-date-cell">
                        {new Date(item.solved_at).toLocaleString('pl-PL')}
                      </td>
                      <td className="table-bold-cell">{item.number}. {item.name}</td>
                      <td>{item.score} / {item.total}</td>
                      <td>
                        <span className={`badge-status ${eff >= 70 ? 'badge-success' : eff >= 40 ? 'badge-warning' : 'badge-danger'}`}>
                          {eff}%
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
