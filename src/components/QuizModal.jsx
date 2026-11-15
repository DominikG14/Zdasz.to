import React, { useState, useEffect } from 'react';
import { IconX, IconDice, IconBookOpen, IconArrowRight } from './Icons.jsx';

export default function QuizModal({ selection, onClose, onStart }) {
  const isRandom = selection?.random;
  const field = selection?.field;
  const maxExercises = isRandom ? 50 : (field?.exercises_count || 10);

  const initialLimit = Math.min(10, Math.max(1, maxExercises));
  const [limit, setLimit] = useState(initialLimit);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const parsedLimit = Math.max(1, Math.min(maxExercises, Number(limit) || 1));
    onStart(parsedLimit);
  };

  const presets = [5, 10, 15, 20].filter(n => n <= maxExercises);
  if (!presets.includes(maxExercises) && maxExercises > 1) {
    presets.push(maxExercises);
  }

  return (
    <div
      className="modal-backdrop"
      role="presentation"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="modal-card"
        role="dialog"
        aria-modal="true"
        aria-labelledby="quiz-modal-title"
      >
        <button
          type="button"
          className="modal-close-btn"
          onClick={onClose}
          aria-label="Zamknij okno"
        >
          <IconX size={18} />
        </button>

        <div className="modal-header">
          <div className="modal-icon-badge">
            {isRandom ? <IconDice size={24} /> : <IconBookOpen size={24} />}
          </div>
          <div>
            <span className="modal-caption">
              {isRandom ? 'Zestaw przekrojowy' : `Dział ${field?.number}`}
            </span>
            <h2 id="quiz-modal-title" className="modal-title">
              {isRandom ? 'Losuj zadania ze wszystkich działów' : field?.name}
            </h2>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          <div className="modal-form-group">
            <div className="limit-header">
              <label htmlFor="question-limit-input" className="form-label">
                Liczba zadań w zestawie:
              </label>
              <span className="limit-current-display">
                <strong>{limit}</strong> / {maxExercises}
              </span>
            </div>

            <div className="preset-chips">
              {presets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  className={`preset-chip ${limit === preset ? 'preset-active' : ''}`}
                  onClick={() => setLimit(preset)}
                >
                  {preset === maxExercises && maxExercises > 20 ? `Wszystkie (${maxExercises})` : preset}
                </button>
              ))}
            </div>

            <input
              id="question-limit-range"
              type="range"
              min="1"
              max={maxExercises}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="range-slider"
            />
          </div>

          <div className="modal-info-box">
            <p>
              💡 Po rozwiązaniu każdego zadania automatycznie przejdziesz do następnego.
              Twój wynik zostanie podsumowany na końcu.
            </p>
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
            >
              Anuluj
            </button>
            <button
              type="submit"
              className="btn-primary"
            >
              <span>Rozpocznij quiz</span>
              <IconArrowRight size={18} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
