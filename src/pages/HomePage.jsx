import React, { useState, useEffect, useMemo } from 'react';
import Hero from '../components/Hero.jsx';
import FieldCard from '../components/FieldCard.jsx';
import QuizModal from '../components/QuizModal.jsx';
import { IconSparkles } from '../components/Icons.jsx';
import { api } from '../api/restClient.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function HomePage({ go, onError }) {
  const { user } = useAuth();
  const [fields, setFields] = useState([]);
  const [userProgressMap, setUserProgressMap] = useState({});
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch fields from REST API
  useEffect(() => {
    let active = true;
    const loadFields = async () => {
      try {
        const data = await api.fields.getAll();
        if (active) {
          setFields(data || []);
        }
      } catch (err) {
        if (active) onError(err.message);
      } finally {
        if (active) setLoading(false);
      }
    };
    loadFields();
    return () => { active = false; };
  }, [onError]);

  // If user is logged in, fetch dashboard progress to enrich cards
  useEffect(() => {
    let active = true;
    if (!user) {
      setUserProgressMap({});
      return;
    }
    const loadProgress = async () => {
      try {
        const data = await api.progress.getDashboard();
        if (active && data?.byField) {
          const map = {};
          for (const item of data.byField) {
            const eff = item.total_sum ? Math.round((item.score_sum / item.total_sum) * 100) : 0;
            map[item.number] = {
              effectiveness: eff,
              attempts: item.attempts_count,
            };
          }
          setUserProgressMap(map);
        }
      } catch {
        // Silently ignore progress enrichment failures
      }
    };
    loadProgress();
    return () => { active = false; };
  }, [user]);

  const totalExercises = useMemo(() => {
    return fields.reduce((sum, f) => sum + (Number(f.exercises_count) || 0), 0);
  }, [fields]);

  const handleStartQuiz = (limit) => {
    if (!selection) return;
    if (selection.random) {
      go(`/exercises/random?limit=${limit}`);
    } else if (selection.field) {
      go(`/exercises/field/${selection.field.id}?limit=${limit}`);
    }
    setSelection(null);
  };

  const scrollToGrid = () => {
    const el = document.getElementById('fields-section');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="home-page-container">
      <Hero
        onRandomClick={() => setSelection({ random: true })}
        onExploreClick={scrollToGrid}
        totalExercises={totalExercises}
      />

      <section id="fields-section" className="fields-section">
        <div className="section-header-modern">
          <div>
            <div className="section-tag">
              <IconSparkles size={14} />
              <span>Działy tematyczne</span>
            </div>
            <h2 className="section-title">Wybierz materiał do powtórki</h2>
            <p className="section-subtitle">
              Kliknij w wybrany dział, aby określić liczbę zadań i rozpocząć interaktywny trening.
            </p>
          </div>
        </div>

        {loading ? (
          <div className="loading-state-card">
            <div className="spinner"></div>
            <p>Ładowanie katalogu działów...</p>
          </div>
        ) : fields.length === 0 ? (
          <div className="empty-state-card">
            <p>Brak dostępnych działów.</p>
          </div>
        ) : (
          <div className="fields-grid-modern">
            {fields.map((field) => (
              <FieldCard
                key={field.id}
                field={field}
                progress={userProgressMap[field.number]}
                onSelect={(f) => setSelection({ field: f })}
              />
            ))}
          </div>
        )}
      </section>

      {selection && (
        <QuizModal
          selection={selection}
          onClose={() => setSelection(null)}
          onStart={handleStartQuiz}
        />
      )}
    </div>
  );
}
