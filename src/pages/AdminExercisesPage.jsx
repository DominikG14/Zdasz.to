import React, { useState, useEffect, useRef } from 'react';
import AdminNav from '../components/AdminNav.jsx';
import { api } from '../api/restClient.js';
import {
  IconUpload,
  IconTrash,
  IconCheck,
  IconX,
  IconSearch,
  IconBookOpen,
} from '../components/Icons.jsx';

export default function AdminExercisesPage({ go, onError, onSuccess }) {
  const [data, setData] = useState({ fields: [], exercises: [] });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedFieldFilter, setSelectedFieldFilter] = useState('');
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [lightboxImg, setLightboxImg] = useState(null);

  // Form states
  const [fieldId, setFieldId] = useState('');
  const [type, setType] = useState('ABCD');
  const [rightAnswer, setRightAnswer] = useState('');
  const fileInputRef = useRef(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const result = await api.admin.getExercises();
      setData(result || { fields: [], exercises: [] });
      if (result?.fields?.length && !fieldId) {
        setFieldId(result.fields[0].id);
      }
    } catch (err) {
      onError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fileInputRef.current?.files?.[0]) {
      onError('Wybierz plik graficzny z treścią zadania.');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('field_id', fieldId);
    formData.append('type', type);
    formData.append('right_answer', rightAnswer.trim().toUpperCase());
    formData.append('image', fileInputRef.current.files[0]);

    try {
      await api.admin.addExercise(formData);
      if (onSuccess) onSuccess('Nowe zadanie zostało pomyślnie dodane.');
      // Reset form
      setRightAnswer('');
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      loadData();
    } catch (err) {
      onError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (exercise) => {
    try {
      await api.admin.deleteExercise(exercise.id);
      setPendingDeleteId(null);
      if (onSuccess) onSuccess(`Zadanie #${exercise.id} zostało usunięte.`);
      loadData();
    } catch (err) {
      onError(err.message);
    }
  };

  const exercises = data?.exercises || [];
  const fields = data?.fields || [];

  const filteredExercises = selectedFieldFilter
    ? exercises.filter((ex) => String(ex.field_id) === String(selectedFieldFilter))
    : exercises;

  return (
    <div className="admin-page-container">
      <AdminNav go={go} active="exercises" />

      <header className="admin-header-strip">
        <h1 className="admin-title">Katalog zadań maturalnych</h1>
        <p className="admin-subtitle">
          Dodawaj nowe arkusze zadań ze zrzutami ekranu CKE oraz zarządzaj istniejącymi pytaniami.
        </p>
      </header>

      {/* New Exercise Form Box */}
      <section className="dashboard-section-box">
        <div className="section-title-strip">
          <div>
            <h2 className="section-h2">Dodaj nowe zadanie</h2>
            <p className="section-p">Wypełnij parametry i wgraj plik graficzny (PNG, JPEG, GIF).</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="admin-form-modern">
          <div className="form-grid-2">
            <div className="form-field-group">
              <label htmlFor="field-select" className="form-label">
                Dział tematyczny CKE:
              </label>
              <select
                id="field-select"
                value={fieldId}
                onChange={(e) => setFieldId(e.target.value)}
                required
                className="select-modern"
              >
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.number}. {f.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field-group">
              <label htmlFor="type-select" className="form-label">
                Typ zadania:
              </label>
              <select
                id="type-select"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setRightAnswer('');
                }}
                className="select-modern"
              >
                <option value="ABCD">Wielokrotny wybór (ABCD)</option>
                <option value="PF">Prawda / Fałsz (PP, PF, FP, FF)</option>
              </select>
            </div>
          </div>

          <div className="form-grid-2">
            <div className="form-field-group">
              <label htmlFor="answer-input" className="form-label">
                Poprawna odpowiedź:
              </label>
              <input
                id="answer-input"
                type="text"
                required
                placeholder={type === 'ABCD' ? 'np. B' : 'np. PF'}
                value={rightAnswer}
                onChange={(e) => setRightAnswer(e.target.value.toUpperCase())}
                className="input-modern"
              />
              <div className="answer-presets-strip">
                <span className="presets-label">Szybki wybór:</span>
                {(type === 'ABCD' ? ['A', 'B', 'C', 'D'] : ['PP', 'PF', 'FP', 'FF']).map((val) => (
                  <button
                    type="button"
                    key={val}
                    className={`preset-btn-chip ${rightAnswer === val ? 'active' : ''}`}
                    onClick={() => setRightAnswer(val)}
                  >
                    {val}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-field-group">
              <label className="form-label">
                Obraz zadania (zrzut z arkusza):
              </label>
              <div className="file-upload-dropzone">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/gif"
                  onChange={handleFileChange}
                  required
                  id="image-file-input"
                  className="file-hidden-input"
                />
                <label htmlFor="image-file-input" className="file-upload-label">
                  <IconUpload size={24} className="upload-icon" />
                  <span className="upload-prompt">
                    {previewUrl ? 'Kliknij, aby zmienić plik' : 'Wybierz lub przeciągnij plik graficzny'}
                  </span>
                  <span className="upload-sub">PNG, JPG lub GIF do 8 MB</span>
                </label>
              </div>
            </div>
          </div>

          {/* Image preview */}
          {previewUrl && (
            <div className="preview-container">
              <span className="preview-label">Podgląd wybranego obrazu:</span>
              <div className="preview-box">
                <img src={previewUrl} alt="Podgląd zadania" className="preview-image" />
              </div>
            </div>
          )}

          <div className="form-actions-bar">
            <button
              type="submit"
              className="btn-primary btn-lg"
              disabled={submitting}
            >
              <IconUpload size={18} />
              <span>{submitting ? 'Zapisywanie zadania...' : 'Zapisz i dodaj zadanie'}</span>
            </button>
          </div>
        </form>
      </section>

      {/* Catalog List Section */}
      <section className="dashboard-section-box">
        <div className="section-title-strip">
          <div>
            <h2 className="section-h2">
              Katalog zadań ({filteredExercises.length})
            </h2>
            <p className="section-p">Przeglądaj wszystkie zadania przypisane do poszczególnych działów.</p>
          </div>

          <div className="filter-select-wrapper">
            <label htmlFor="filter-by-field" className="filter-select-label">Filtruj dział:</label>
            <select
              id="filter-by-field"
              value={selectedFieldFilter}
              onChange={(e) => setSelectedFieldFilter(e.target.value)}
              className="select-modern select-sm"
            >
              <option value="">Wszystkie działy ({exercises.length})</option>
              {fields.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.number}. {f.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="table-responsive-wrapper">
          <table className="table-modern">
            <thead>
              <tr>
                <th style={{ width: '70px' }}>ID</th>
                <th>Dział</th>
                <th>Typ</th>
                <th>Podgląd zadania</th>
                <th>Poprawna</th>
                <th style={{ textAlign: 'right' }}>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="table-loading-cell">
                    <div className="table-spinner"></div>
                    <span>Ładowanie katalogu...</span>
                  </td>
                </tr>
              ) : filteredExercises.length === 0 ? (
                <tr>
                  <td colSpan="6" className="table-empty-cell">
                    Brak zadań w wybranym dziale.
                  </td>
                </tr>
              ) : (
                filteredExercises.map((exercise) => (
                  <tr key={exercise.id}>
                    <td>
                      <span className="badge-id">#{exercise.id}</span>
                    </td>
                    <td className="table-bold-cell">
                      {exercise.field_number}. {exercise.field_name}
                    </td>
                    <td>
                      <span className="badge-type">{exercise.type}</span>
                    </td>
                    <td>
                      <div
                        className="exercise-thumb-wrapper"
                        onClick={() => setLightboxImg(`/${exercise.image_url}`)}
                        role="button"
                        tabIndex={0}
                        title="Kliknij, aby powiększyć"
                      >
                        <img
                          src={`/${exercise.image_url}`}
                          alt={`Zadanie ${exercise.id}`}
                          className="exercise-thumb-img"
                        />
                      </div>
                    </td>
                    <td>
                      <span className="badge-answer">{exercise.right_answer}</span>
                    </td>
                    <td className="table-actions-cell" style={{ textAlign: 'right' }}>
                      {pendingDeleteId === exercise.id ? (
                        <div className="confirm-delete-group">
                          <span className="confirm-prompt">Usunąć?</span>
                          <button
                            type="button"
                            className="btn-danger btn-sm"
                            onClick={() => handleRemove(exercise)}
                          >
                            <IconCheck size={14} />
                            <span>Tak</span>
                          </button>
                          <button
                            type="button"
                            className="btn-ghost btn-sm"
                            onClick={() => setPendingDeleteId(null)}
                          >
                            <IconX size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn-ghost-danger btn-sm"
                          onClick={() => setPendingDeleteId(exercise.id)}
                          title="Usuń zadanie"
                        >
                          <IconTrash size={14} />
                          <span>Usuń</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Lightbox Modal */}
      {lightboxImg && (
        <div
          className="image-lightbox-backdrop"
          onClick={() => setLightboxImg(null)}
          role="presentation"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setLightboxImg(null)}
              aria-label="Zamknij podgląd"
            >
              <IconX size={24} />
            </button>
            <img src={lightboxImg} alt="Powiększone zadanie" className="lightbox-img" />
          </div>
        </div>
      )}
    </div>
  );
}
