import React, { useEffect } from 'react';
import { IconCheck, IconX } from './Icons.jsx';

export default function Toast({ message, type = 'error', onClose, duration = 5000 }) {
  useEffect(() => {
    if (!message || !duration) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === 'success';

  return (
    <div className={`toast-container toast-${type}`} role="alert">
      <div className="toast-icon">
        {isSuccess ? <IconCheck size={18} /> : <IconX size={18} />}
      </div>
      <div className="toast-message">{message}</div>
      <button type="button" className="toast-close" onClick={onClose} aria-label="Zamknij powiadomienie">
        <IconX size={14} />
      </button>
    </div>
  );
}
