import React, { useEffect, useState } from 'react';

import { AuthProvider } from './context/AuthContext.jsx';
import Navbar from './components/Navbar.jsx';
import Toast from './components/Toast.jsx';
import Router from './router/Router.jsx';
import { useNavigation } from './router/useNavigation.js';

import './styles/modern-app.css';

export default function App() {
  const { path, go } = useNavigation();
  const [toast, setToast] = useState(null);

  const pathname = new URL(path, location.origin).pathname;

  // Dark theme as default
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const triggerError = (msg) => {
    if (msg) setToast({ message: msg, type: 'error' });
  };

  const triggerSuccess = (msg) => {
    if (msg) setToast({ message: msg, type: 'success' });
  };

  return (
    <AuthProvider onNavigate={go}>
      <div className="app-container">
        <Navbar currentPath={pathname} go={go} />

        <main className="main-content">
          <Router
            pathname={pathname}
            navigationProps={{ path, go, triggerError, triggerSuccess }}
          />
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
