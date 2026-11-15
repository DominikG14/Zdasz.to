import React from 'react';
import { IconArrowRight } from './Icons.jsx';

export default function FieldCard({ field, progress, onSelect }) {
  const isAvailable = field.exercises_count > 0;

  return (
    <div
      role="button"
      tabIndex={isAvailable ? 0 : -1}
      aria-disabled={!isAvailable}
      className={`field-card-modern ${!isAvailable ? 'field-card-disabled' : ''}`}
      onClick={() => {
        if (isAvailable) onSelect(field);
      }}
      onKeyDown={(e) => {
        if (isAvailable && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onSelect(field);
        }
      }}
    >
      <div className="field-card-top">
        <span className="field-number-badge">{field.number}</span>
        {progress ? (
          <span className={`field-progress-pill ${progress.effectiveness >= 70 ? 'pill-success' : progress.effectiveness >= 40 ? 'pill-warning' : 'pill-info'}`}>
            {progress.effectiveness}% opanowane
          </span>
        ) : (
          <span className="field-count-pill">
            {field.exercises_count} {field.exercises_count === 1 ? 'zadanie' : field.exercises_count < 5 ? 'zadania' : 'zadań'}
          </span>
        )}
      </div>

      <div className="field-card-body">
        <h3 className="field-name">{field.name}</h3>
      </div>

      <div className="field-card-footer">
        {isAvailable ? (
          <span className="field-cta-link">
            <span>Rozpocznij test</span>
            <IconArrowRight size={16} className="field-cta-arrow" />
          </span>
        ) : (
          <span className="field-unavailable-text">Wkrótce dostępne</span>
        )}
      </div>
    </div>
  );
}
