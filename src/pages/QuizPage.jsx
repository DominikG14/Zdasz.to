import React, { useState, useEffect, useCallback } from 'react';
import { api, request } from '../api/restClient.js';
import { useAuth } from '../context/AuthContext.jsx';
import {
  IconArrowLeft,
  IconTrophy,
  IconCheck,
  IconX,
  IconRefresh,
  IconArrowRight,
  IconLogIn,
  IconSparkles,
} from '../components/Icons.jsx';

export default function QuizPage({ page, go, onError }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [fieldInfo, setFieldInfo] = useState({ id: 0, title: '' });
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imageModalOpen, setImageModalOpen] = useState(false);

  // Load quiz exercises via REST API or restore saved summary after auth
  useEffect(() => {
    let active = true;

    // Check if returning from login/register with a saved finished quiz summary
    const savedSummaryStr = sessionStorage.getItem('savedQuizSummary');
    if (savedSummaryStr) {
      try {
        const saved = JSON.parse(savedSummaryStr);
        if (saved && saved.result) {
          sessionStorage.removeItem('savedQuizSummary');
          setItems(saved.items || []);
          setFieldInfo(saved.fieldInfo || { id: 0, title: '' });
          setAnswers(saved.answers || {});
          setResult(saved.result);
          setLoading(false);
          return;
        }
      } catch {
        sessionStorage.removeItem('savedQuizSummary');
      }
    }

    (async () => {
      setLoading(true);
      setResult(null);
      setCurrentIndex(0);
      setAnswers({});
      try {
        const data = await request(page);
        if (!active) return;
        const url = new URL(page, location.origin);

        if (url.pathname.endsWith('/random')) {
          setItems(data.exercises || []);
          setFieldInfo({
            id: data.fieldId || 0,
            title: 'Losowy zestaw maturalny',
          });
        } else {
          const list = Array.isArray(data) ? data : [];
          setItems(list);
          const fieldId = Number(url.pathname.split('/').at(-1)) || 0;
          const firstExercise = list[0];
          setFieldInfo({
            id: fieldId,
            title: firstExercise
              ? `${firstExercise.field_number}. ${firstExercise.field_name}`
              : `Dział ${fieldId}`,
          });
        }
      } catch (err) {
        if (active) {
          setItems([]);
          onError(err.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [page, onError]);

  // Finish quiz and save result via REST API
  const finishQuiz = useCallback(async (finalAnswers) => {
    const score = items.reduce(
      (sum, item, index) => sum + (finalAnswers[index] === item.right_answer ? 1 : 0),
      0
    );
    const finalResult = { score, total: items.length };
    setResult(finalResult);

    const payload = {
      field_id: fieldInfo.id,
      score,
      total: items.length,
    };

    if (user && fieldInfo.id) {
      try {
        await api.exercises.saveProgress(payload);
      } catch (err) {
        onError(`Błąd zapisu wyniku: ${err.message}`);
      }
    } else if (!user) {
      sessionStorage.setItem('pendingQuizResult', JSON.stringify(payload));
    }
  }, [items, fieldInfo.id, user, onError]);

  // Handle answering
  const chooseAnswer = useCallback((answer) => {
    if (result) return;
    const nextAnswers = { ...answers, [currentIndex]: answer };
    setAnswers(nextAnswers);

    if (currentIndex === items.length - 1) {
      finishQuiz(nextAnswers);
    } else {
      setCurrentIndex((prev) => prev + 1);
    }
  }, [answers, currentIndex, items.length, result, finishQuiz]);

  // Keyboard shortcut support (A, B, C, D / 1, 2, 3, 4)
  useEffect(() => {
    if (loading || result || !items.length) return;

    const currentExercise = items[currentIndex];
    if (!currentExercise) return;

    const options = currentExercise.type === 'ABCD'
      ? ['A', 'B', 'C', 'D']
      : ['PP', 'PF', 'FP', 'FF'];

    const handleKeyDown = (e) => {
      // Ignore if user is inside an input
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;

      const key = e.key.toUpperCase();
      if (options.includes(key)) {
        chooseAnswer(key);
      } else if (currentExercise.type === 'ABCD') {
        const numMap = { '1': 'A', '2': 'B', '3': 'C', '4': 'D' };
        if (numMap[key]) {
          chooseAnswer(numMap[key]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [loading, result, items, currentIndex, chooseAnswer]);

  if (loading) {
    return (
      <div className="quiz-loading-container">
        <div className="spinner-large"></div>
        <h2>Przygotowywanie zadań maturalnych...</h2>
        <p>Pobieranie arkuszy i weryfikacja odpowiedzi z CKE</p>
      </div>
    );
  }

  if (!items.length) {
    return (
      <div className="quiz-empty-container">
        <div className="empty-icon-box">
          <IconX size={32} />
        </div>
        <h2>Brak zadań w wybranym dziale</h2>
        <p>Nie odnaleziono dostępnych zadań dla tego zapytania.</p>
        <button
          type="button"
          className="btn-primary"
          onClick={() => go('/')}
        >
          <IconArrowLeft size={18} />
          <span>Wróć do listy działów</span>
        </button>
      </div>
    );
  }

  // --- RESULT VIEW ---
  if (result) {
    const percentage = result.total ? Math.round((result.score / result.total) * 100) : 0;

    let feedbackTitle = 'Świetna robota!';
    let feedbackSubtitle = 'Twoje przygotowanie do matury idzie znakomicie.';
    if (percentage === 100) {
      feedbackTitle = 'Mistrzowski wynik! 100%';
      feedbackSubtitle = 'Bezbłędnie rozwiązałeś cały zestaw zadań.';
    } else if (percentage >= 70) {
      feedbackTitle = 'Bardzo dobry rezultat!';
      feedbackSubtitle = 'Zdecydowana większość zadań rozwiązana poprawnie.';
    } else if (percentage >= 40) {
      feedbackTitle = 'Dobra próba!';
      feedbackSubtitle = 'Przejrzyj poniższe błędy i powtórz ten dział, a wynik szybko wzrośnie.';
    } else {
      feedbackTitle = 'Nie poddawaj się!';
      feedbackSubtitle = 'Matematyka wymaga ćwiczeń — przeanalizuj materiał i spróbuj ponownie.';
    }

    const continueWithAuth = (path) => {
      // Save pending score for database synchronization upon login/register
      sessionStorage.setItem(
        'pendingQuizResult',
        JSON.stringify({
          field_id: fieldInfo.id,
          score: result.score,
          total: result.total,
        })
      );
      // Save full summary state so user returns to this summary screen, not a new test
      sessionStorage.setItem(
        'savedQuizSummary',
        JSON.stringify({
          items,
          fieldInfo,
          answers,
          result,
        })
      );
      go(`${path}?returnUrl=${encodeURIComponent(page)}`);
    };

    return (
      <section className="quiz-result-container">
        <div className="result-card-modern">
          <div className="result-badge-icon">
            <IconTrophy size={48} className="trophy-gold" />
          </div>

          <span className="result-topic-tag">{fieldInfo.title}</span>
          <h1 className="result-headline">{feedbackTitle}</h1>
          <p className="result-subheadline">{feedbackSubtitle}</p>

          <div className="score-radial-wrapper">
            <div className="score-main-number">
              <span className="score-achieved">{result.score}</span>
              <span className="score-divider">/</span>
              <span className="score-total">{result.total}</span>
            </div>
            <div className={`score-percent-pill ${percentage >= 70 ? 'pill-success' : percentage >= 40 ? 'pill-warning' : 'pill-danger'}`}>
              Skuteczność: <strong>{percentage}%</strong>
            </div>
          </div>

          {/* User persistence status & guest call-to-action */}
          {user ? (
            <div className="result-saved-alert">
              <IconCheck size={18} />
              <span>Wynik został automatycznie zapisany na Twoim koncie.</span>
            </div>
          ) : (
            <div className="result-guest-save-box">
              <div className="guest-save-text">
                <IconSparkles size={20} className="sparkle-amber" />
                <div>
                  <strong>Zapisz ten wynik i zobacz poprawne odpowiedzi</strong>
                  <p>Zaloguj się lub utwórz bezpłatne konto, aby odblokować pełne podsumowanie z analizą błędów.</p>
                </div>
              </div>
              <div className="guest-save-actions">
                <button
                  type="button"
                  className="btn-primary btn-sm"
                  onClick={() => continueWithAuth('/login')}
                >
                  <IconLogIn size={16} />
                  <span>Zaloguj się</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => continueWithAuth('/register')}
                >
                  <span>Utwórz konto</span>
                </button>
              </div>
            </div>
          )}

          {/* Review of answers: ONLY shown if user has an account */}
          {user && (
            <div className="answers-review-section">
              <h3 className="review-title">Podsumowanie odpowiedzi</h3>
              <div className="review-list">
                {items.map((item, idx) => {
                  const userChoice = answers[idx];
                  const isCorrect = userChoice === item.right_answer;
                  return (
                    <div key={item.id || idx} className={`review-item ${isCorrect ? 'review-correct' : 'review-wrong'}`}>
                      <div className="review-item-number">Zadanie {idx + 1}</div>
                      <div className="review-item-answers">
                        <span className="review-user-ans">
                          Twoja odpowiedź: <strong>{userChoice || '—'}</strong>
                        </span>
                        {!isCorrect && (
                          <span className="review-correct-ans">
                            Poprawna: <strong>{item.right_answer}</strong>
                          </span>
                        )}
                      </div>
                      <div className="review-item-icon">
                        {isCorrect ? <IconCheck size={16} /> : <IconX size={16} />}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="result-actions-strip">
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                setResult(null);
                setCurrentIndex(0);
                setAnswers({});
              }}
            >
              <IconRefresh size={18} />
              <span>Rozwiąż ponownie ten zestaw</span>
            </button>

            <button
              type="button"
              className="btn-secondary"
              onClick={() => go('/')}
            >
              <span>Wróć do listy działów</span>
              <IconArrowRight size={18} />
            </button>

            {user && (
              <button
                type="button"
                className="btn-ghost"
                onClick={() => go('/dashboard')}
              >
                <span>Zobacz statystyki</span>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  // --- ACTIVE QUIZ QUESTION VIEW ---
  const exercise = items[currentIndex];
  const options = exercise.type === 'ABCD'
    ? ['A', 'B', 'C', 'D']
    : ['PP', 'PF', 'FP', 'FF'];

  const progressPercent = Math.round(((currentIndex) / items.length) * 100);

  return (
    <section className="quiz-active-container">
      {/* Quiz Top Navigation Bar */}
      <div className="quiz-top-bar">
        <button
          type="button"
          className="btn-ghost btn-sm quiz-exit-btn"
          onClick={() => {
            if (window.confirm('Czy na pewno chcesz przerwać rozwiązywanie tego zestawu? Postęp nie zostanie zapisany.')) {
              go('/');
            }
          }}
        >
          <IconArrowLeft size={16} />
          <span>Przerwij test</span>
        </button>

        <div className="quiz-topic-display">
          <span className="quiz-topic-name">{fieldInfo.title}</span>
        </div>

        <div className="quiz-counter-pill">
          Pytanie <strong>{currentIndex + 1}</strong> z {items.length}
        </div>
      </div>

      {/* Animated Smooth Progress Bar */}
      <div className="quiz-progress-track" role="progressbar" aria-valuenow={progressPercent} aria-valuemin="0" aria-valuemax="100">
        <div
          className="quiz-progress-fill"
          style={{ width: `${Math.max(5, progressPercent)}%` }}
        ></div>
      </div>

      {/* Main Question Card */}
      <div className="quiz-question-card">
        <div className="question-header">
          {/* Numer zadania bez typu */}
          <div className="question-badge">
            <span>Zadanie {currentIndex + 1}</span>
          </div>
          <button
            type="button"
            className="btn-ghost btn-sm question-zoom-btn"
            onClick={() => setImageModalOpen(true)}
            title="Kliknij, aby powiększyć arkusz z zadaniem"
          >
            <span>🔍 Powiększ</span>
          </button>
        </div>

        {/* Task Image Canvas */}
        <div
          className="exercise-image-canvas"
          onClick={() => setImageModalOpen(true)}
          role="button"
          tabIndex={0}
          title="Kliknij, aby otworzyć w pełnym oknie"
          onKeyDown={(e) => {
            if (e.key === 'Enter') setImageModalOpen(true);
          }}
        >
          <img
            src={`/${exercise.image_url}`}
            alt={`Treść zadania ${currentIndex + 1}`}
            className="exercise-sheet-img"
          />
        </div>

        {/* Answer Buttons: Proste kwadraty z samymi literami A, B, C, D */}
        <div className="answer-squares-container">
          {options.map((option) => (
            <button
              type="button"
              key={option}
              className="answer-square-button"
              onClick={() => chooseAnswer(option)}
              aria-label={`Wybierz odpowiedź ${option}`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      {/* Fullscreen Image Lightbox Modal */}
      {imageModalOpen && (
        <div
          className="image-lightbox-backdrop"
          onClick={() => setImageModalOpen(false)}
          role="presentation"
        >
          <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className="lightbox-close-btn"
              onClick={() => setImageModalOpen(false)}
              aria-label="Zamknij podgląd"
            >
              <IconX size={24} />
            </button>
            <img
              src={`/${exercise.image_url}`}
              alt={`Pełny podgląd zadania ${currentIndex + 1}`}
              className="lightbox-img"
            />
          </div>
        </div>
      )}
    </section>
  );
}
