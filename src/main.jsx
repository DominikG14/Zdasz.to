import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import Quiz from './Quiz.jsx';

for (const href of ['/public/styles/main.css', '/public/styles/react-app.css']) {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = href;
  document.head.append(stylesheet);
}

const TOKEN_KEY = 'accessToken';

function formatErrorMessage(errorBody) {
  const details = Array.isArray(errorBody?.details) ? errorBody.details : [];
  const detailText = details
    .map(detail => {
      const field = detail.field && detail.field !== '_root' ? `${detail.field}: ` : '';
      return `${field}${detail.message}`;
    })
    .join('; ');

  if (!detailText) return errorBody?.message || 'Wystąpił błąd';
  return `${errorBody?.message || 'Dane wejściowe są niepoprawne.'} ${detailText}`;
}

async function request(url, options = {}) {
  const headers = { ...(options.headers || {}) };
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (token) headers.Authorization = `Bearer ${token}`;

  const response = await fetch(url, { ...options, headers });
  let data = {};
  try { data = await response.json(); } catch { /* Empty response body. */ }
  if (!response.ok) {
    if (response.status === 401) sessionStorage.removeItem(TOKEN_KEY);
    throw new Error(formatErrorMessage(data.error));
  }
  return data;
}

function App() {
  const [user, setUser] = useState(null);
  const [page, setPage] = useState(location.pathname + location.search);
  const [error, setError] = useState('');
  const pathname = new URL(page, location.origin).pathname;

  const go = path => {
    history.pushState({}, '', path);
    setPage(path);
    setError('');
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    request('/api/me').then(result => setUser(result.user)).catch(() => setUser(null));
    const onPopState = () => setPage(location.pathname + location.search);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const link = (path, label) => <a href={path} onClick={event => { event.preventDefault(); go(path); }}>{label}</a>;
  const act = async action => {
    setError('');
    try { await action(); } catch (err) { setError(err.message); }
  };

  let content;
  if (pathname.startsWith('/exercises/')) {
    content = <Quiz page={page} user={user} go={go} setErr={setError} request={request} />;
  } else if (pathname === '/login' || pathname === '/register') {
    content = <AuthPage register={pathname === '/register'} request={request} onSuccess={result => {
      sessionStorage.setItem(TOKEN_KEY, result.token);
      setUser(result.user);
      const pending = sessionStorage.getItem('pendingQuizResult');
      if (pending) {
        request('/exercises/save', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: pending })
          .then(() => sessionStorage.removeItem('pendingQuizResult'))
          .catch(err => setError(err.message));
      }
      go(result.returnUrl || '/');
    }} />;
  } else if (pathname === '/dashboard') {
    content = <Dashboard request={request} />;
  } else if (pathname.startsWith('/admin/users/progress/')) {
    content = <AdminProgress id={pathname.split('/').at(-1)} request={request} />;
  } else if (pathname === '/admin/users') {
    content = <AdminUsers go={go} request={request} />;
  } else if (pathname === '/admin/exercises') {
    content = <AdminExercises request={request} />;
  } else {
    content = <Home go={go} request={request} />;
  }

  const logout = () => act(async () => {
    await request('/auth/logout', { method: 'POST' });
    sessionStorage.removeItem(TOKEN_KEY);
    setUser(null);
    go('/');
  });

  return <>
    <header className="nav">
      <a href="/" className="logo" onClick={event => { event.preventDefault(); go('/'); }}>Zdasz.to</a>
      <nav>
        {link('/', 'Strona główna')}
        {user && link('/dashboard', 'Postępy')}
        {user?.isAdmin && <>{link('/admin/users', 'Użytkownicy')}{link('/admin/exercises', 'Zadania')}</>}
        {user ? <button type="button" onClick={logout}>Wyloguj</button> : <>{link('/login', 'Logowanie')}{link('/register', 'Rejestracja')}</>}
      </nav>
    </header>
    <main className="page">
      {error && <div className="error-message" role="alert">{error}</div>}
      {content}
    </main>
  </>;
}

function Home({ go, request }) {
  const [fields, setFields] = useState([]);
  const [selection, setSelection] = useState(null);
  const [limit, setLimit] = useState(10);
  const [error, setError] = useState('');

  useEffect(() => { request('/api/fields').then(setFields).catch(err => setError(err.message)); }, [request]);

  const chooseRandom = () => { setSelection({ random: true }); setLimit(10); };
  const chooseField = field => { setSelection({ field }); setLimit(Math.min(5, field.exercises_count)); };
  const start = event => {
    event.preventDefault();
    if (!selection) return;
    const maximum = selection.random ? 50 : selection.field.exercises_count;
    const count = Math.max(1, Math.min(maximum, Number(limit) || 1));
    go(selection.random ? `/exercises/random?limit=${count}` : `/exercises/field/${selection.field.id}?limit=${count}`);
  };

  return <section>
    <h1>Przygotuj się do matury z matematyki</h1>
    <p>Wybierz dział i rozwiąż zestaw zadań.</p>
    <button type="button" onClick={chooseRandom}>Losuj zadania</button>
    {error && <p role="alert">{error}</p>}
    <div className="fields-grid">
      {fields.map(field => <button className="field-card" key={field.id} disabled={!field.exercises_count} onClick={() => chooseField(field)}>
        <strong>{field.number}. {field.name}</strong>
        <span>Dostępne zadania: {field.exercises_count}</span>
      </button>)}
    </div>
    {selection && <div className="dialog-backdrop" role="presentation" onMouseDown={event => { if (event.target === event.currentTarget) setSelection(null); }}>
      <form className="quiz-options" role="dialog" aria-modal="true" aria-labelledby="quiz-options-title" onSubmit={start}>
        <h2 id="quiz-options-title">{selection.random ? 'Losowy zestaw' : `${selection.field.number}. ${selection.field.name}`}</h2>
        <label htmlFor="question-limit">Liczba zadań (maks. {selection.random ? 50 : selection.field.exercises_count})</label>
        <input id="question-limit" type="number" min="1" max={selection.random ? 50 : selection.field.exercises_count} value={limit} onChange={event => setLimit(event.target.value)} required />
        <div className="dialog-actions">
          <button type="submit">Rozpocznij</button>
          <button type="button" className="button-secondary" onClick={() => setSelection(null)}>Anuluj</button>
        </div>
      </form>
    </div>}
  </section>;
}

function AuthPage({ register, request, onSuccess }) {
  const [error, setError] = useState('');
  const submit = async event => {
    event.preventDefault();
    setError('');
    const values = Object.fromEntries(new FormData(event.currentTarget));
    const returnUrl = new URLSearchParams(location.search).get('returnUrl');
    const body = { ...values };
    if (returnUrl !== null) body.returnUrl = returnUrl;
    try {
      const result = await request(`/auth/${register ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      onSuccess(result);
    } catch (err) { setError(err.message); }
  };

  return <form className="auth-form" onSubmit={submit}>
    <h1>{register ? 'Rejestracja' : 'Logowanie'}</h1>
    {error && <div className="error-message" role="alert">{error}</div>}
    {register && <label>Nazwa użytkownika<input name="username" required maxLength="50" autoComplete="username" /></label>}
    <label>Email<input name="email" type="email" required autoComplete="email" /></label>
    <label>Hasło<input name="password" type="password" required minLength={register ? 8 : 1} autoComplete={register ? 'new-password' : 'current-password'} /></label>
    {register && <label>Powtórz hasło<input name="password2" type="password" required autoComplete="new-password" /></label>}
    <button type="submit">{register ? 'Utwórz konto' : 'Zaloguj się'}</button>
  </form>;
}

function Dashboard({ request }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { request('/dashboard').then(setData).catch(err => setError(err.message)); }, [request]);
  return <section>
    <h1>Twoje postępy</h1>
    {error && <p role="alert">{error}</p>}
    {data && <>
      <h2>Wyniki według działu</h2>
      <table><thead><tr><th>Dział</th><th>Podejścia</th><th>Wynik</th></tr></thead>
        <tbody>{data.byField.map((item, index) => <tr key={`${item.number}-${index}`}><td>{item.name}</td><td>{item.attempts_count}</td><td>{item.score_sum}/{item.total_sum}</td></tr>)}</tbody>
      </table>
      <h2>Historia</h2>
      {data.progress.map((item, index) => <p key={`${item.solved_at}-${index}`}>{new Date(item.solved_at).toLocaleString('pl-PL')} · {item.name}: {item.score}/{item.total}</p>)}
    </>}
  </section>;
}

function AdminUsers({ go, request }) {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [error, setError] = useState('');
  const load = () => request(`/admin/users?search=${encodeURIComponent(search)}`).then(setUsers).catch(err => setError(err.message));
  useEffect(() => { load(); }, [search]);
  const removeUser = async user => {
    try {
      await request(`/admin/users/${user.id}`, { method: 'DELETE' });
      setPendingDelete(null);
      load();
    } catch (err) { setError(err.message); }
  };

  return <section>
    <h1>Panel administratora — użytkownicy</h1>
    {error && <p role="alert">{error}</p>}
    <input aria-label="Szukaj użytkowników" placeholder="Szukaj po nazwie lub emailu" value={search} onChange={event => setSearch(event.target.value)} />
    <table><thead><tr><th>ID</th><th>Użytkownik</th><th>Email</th><th>Akcje</th></tr></thead>
      <tbody>{users.map(user => <tr key={user.id}>
        <td>{user.id}</td><td>{user.username}</td><td>{user.email}</td>
        <td>
          <button type="button" onClick={() => go(`/admin/users/progress/${user.id}`)}>Postępy</button>
          {pendingDelete === user.id ? <span className="confirm-actions"><span>Usunąć konto?</span><button type="button" onClick={() => removeUser(user)}>Potwierdź</button><button type="button" className="button-secondary" onClick={() => setPendingDelete(null)}>Anuluj</button></span> : <button type="button" className="button-danger" onClick={() => setPendingDelete(user.id)}>Usuń</button>}
        </td>
      </tr>)}</tbody>
    </table>
  </section>;
}

function AdminProgress({ id, request }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => { request(`/admin/users/${id}/progress`).then(setData).catch(err => setError(err.message)); }, [id, request]);
  return <section><h1>Postępy {data?.username}</h1>{error && <p role="alert">{error}</p>}{data?.progress.map((item, index) => <p key={`${item.solved_at}-${index}`}>{item.name}: {item.score}/{item.total} · {new Date(item.solved_at).toLocaleString('pl-PL')}</p>)}</section>;
}

function AdminExercises({ request }) {
  const [data, setData] = useState({ fields: [], exercises: [] });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const load = () => request('/admin/exercises').then(setData).catch(err => setError(err.message));
  useEffect(() => { load(); }, []);
  const submit = async event => {
    event.preventDefault();
    setMessage(''); setError('');
    const form = event.currentTarget;
    try {
      await request('/admin/exercises', { method: 'POST', body: new FormData(form) });
      setMessage('Zadanie dodane.');
      form.reset();
      load();
    } catch (err) { setError(err.message); }
  };
  const removeExercise = async exercise => {
    setError(''); setMessage('');
    try {
      await request(`/admin/exercises/${exercise.id}`, { method: 'DELETE' });
      setPendingDelete(null);
      setMessage('Zadanie usunięte.');
      load();
    } catch (err) { setError(err.message); }
  };

  return <section>
    <h1>Panel administratora — zadania</h1>
    {error && <p role="alert">{error}</p>}{message && <p role="status">{message}</p>}
    <form className="admin-exercise-form" onSubmit={submit}>
      <label>Dział<select name="field_id" required>{data.fields.map(field => <option value={field.id} key={field.id}>{field.number} — {field.name}</option>)}</select></label>
      <label>Typ<select name="type"><option>ABCD</option><option>PF</option></select></label>
      <label>Poprawna odpowiedź<input name="right_answer" required /></label>
      <label>Obraz zadania<input type="file" name="image" accept="image/png,image/jpeg,image/gif" required /></label>
      <button type="submit">Dodaj zadanie</button>
    </form>
    <h2>Lista zadań</h2>
    {data.exercises.map(exercise => <p className="admin-exercise-row" key={exercise.id}>
      {exercise.field_name} · {exercise.type} · <img width="100" src={`/${exercise.image_url}`} alt="Podgląd zadania" />
      {pendingDelete === exercise.id
        ? <span className="confirm-actions"><span>Usunąć zadanie?</span><button type="button" onClick={() => removeExercise(exercise)}>Potwierdź</button><button type="button" className="button-secondary" onClick={() => setPendingDelete(null)}>Anuluj</button></span>
        : <button type="button" className="button-danger" onClick={() => setPendingDelete(exercise.id)}>Usuń</button>}
    </p>)}
  </section>;
}

createRoot(document.getElementById('root')).render(<App />);
