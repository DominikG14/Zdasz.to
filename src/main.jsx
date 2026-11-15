import React, { useEffect, useState, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/modern-app.css';

import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';

import HomePage from './pages/HomePage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import AuthPage from './pages/AuthPage.jsx';
import AdminHomePage from './pages/AdminHomePage.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import AdminProgressPage from './pages/AdminProgressPage.jsx';
import AdminExercisesPage from './pages/AdminExercisesPage.jsx';

function App() {
  const [page, setPage] = useState(location.pathname + location.search);
  const [toast, setToast] = useState(null);

  const pathname = new URL(page, location.origin).pathname;

  // Set dark theme as the default primary theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Navigation handler
  const go = useCallback((path) => {
    history.pushState({}, '', path);
    setPage(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Listen to browser back/forward buttons
  useEffect(() => {
    const onPopState = () => setPage(location.pathname + location.search);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const triggerError = (msg) => {
    if (msg) setToast({ message: msg, type: 'error' });
  };

  const triggerSuccess = (msg) => {
    if (msg) setToast({ message: msg, type: 'success' });
  };

  // Route routing logic
  let content;
  if (pathname.startsWith('/exercises/')) {
    content = <QuizPage page={page} go={go} onError={triggerError} />;
  } else if (pathname === '/login' || pathname === '/register') {
    content = <AuthPage register={pathname === '/register'} go={go} onError={triggerError} />;
  } else if (pathname === '/dashboard') {
    content = <DashboardPage go={go} onError={triggerError} />;
  } else if (pathname === '/admin') {
    content = <AdminHomePage go={go} />;
  } else if (pathname.startsWith('/admin/users/progress/')) {
    const id = pathname.split('/').at(-1);
    content = <AdminProgressPage id={id} go={go} onError={triggerError} />;
  } else if (pathname === '/admin/users') {
    content = <AdminUsersPage go={go} onError={triggerError} onSuccess={triggerSuccess} />;
  } else if (pathname === '/admin/exercises') {
    content = <AdminExercisesPage go={go} onError={triggerError} onSuccess={triggerSuccess} />;
  } else {
    content = <HomePage go={go} onError={triggerError} />;
  }

  return (
    <AuthProvider onNavigate={go}>
      <div className="app-container">
        <Navbar
          currentPath={pathname}
          go={go}
        />

        <main className="main-content">
          {content}
        </main>

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </div>
    </AuthProvider>
  );
}

createRoot(document.getElementById('root')).render(<App />);
