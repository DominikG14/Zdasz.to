import { useEffect, useState } from 'react';

export default function Quiz({ page, user, go, setErr, request }) {
  const [items, setItems] = useState([]);
  const [field, setField] = useState(0);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setErr('');
      setResult(null);
      setCurrentIndex(0);
      setAnswers({});
      try {
        const data = await request(page);
        if (!active) return;
        const url = new URL(page, location.origin);
        if (url.pathname.endsWith('/random')) {
          setItems(data.exercises || []);
          setField(data.fieldId || 0);
        } else {
          setItems(Array.isArray(data) ? data : []);
          setField(Number(url.pathname.split('/').at(-1)) || 0);
        }
      } catch (error) {
        if (active) {
          setItems([]);
          setErr(error.message);
        }
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, [page, request, setErr]);

  const finish = finalAnswers => {
    const score = items.reduce((sum, item, index) => sum + (finalAnswers[index] === item.right_answer ? 1 : 0), 0);
    const finalResult = { score, total: items.length };
    setResult(finalResult);
    if (user && field) {
      request('/exercises/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ field_id: field, ...finalResult }),
      }).catch(error => setErr(error.message));
    }
  };

  const chooseAnswer = answer => {
    const nextAnswers = { ...answers, [currentIndex]: answer };
    setAnswers(nextAnswers);
    if (currentIndex === items.length - 1) finish(nextAnswers);
    else setCurrentIndex(index => index + 1);
  };

  if (loading) return <section><h1>Ładowanie zadań</h1><p>Trwa pobieranie zadań…</p></section>;
  if (!items.length) return <section><h1>Brak zadań</h1><p>Nie znaleziono zadań dla wybranego działu.</p><button onClick={() => go('/')}>Wróć do działów</button></section>;
  if (result) return <section><h1>Podsumowanie</h1><h2>{result.score} / {result.total}</h2>{user ? <p>Wynik zapisany na Twoim koncie.</p> : <p>Zaloguj się lub zarejestruj, aby zapisać postęp.</p>}<button onClick={() => go('/')}>Wróć</button></section>;

  const exercise = items[currentIndex];
  const options = exercise.type === 'ABCD' ? ['A', 'B', 'C', 'D'] : ['PP', 'PF', 'FP', 'FF'];

  return <section>
    <h1>Rozwiąż zadania</h1>
    <p>Zadanie {currentIndex + 1} z {items.length}</p>
    <article className="exercise-card">
      <h2>Zadanie {currentIndex + 1}</h2>
      <img src={`/${exercise.image_url}`} alt={`Zadanie ${currentIndex + 1}`} />
      <div>{options.map(option => <button key={option} onClick={() => chooseAnswer(option)}>{option}</button>)}</div>
    </article>
  </section>;
}
