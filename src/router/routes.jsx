import React from 'react';

import HomePage from '../pages/HomePage.jsx';
import AuthPage from '../pages/AuthPage.jsx';
import DashboardPage from '../pages/DashboardPage.jsx';
import QuizPage from '../pages/QuizPage.jsx';
import AdminHomePage from '../pages/AdminHomePage.jsx';
import AdminUsersPage from '../pages/AdminUsersPage.jsx';
import AdminProgressPage from '../pages/AdminProgressPage.jsx';
import AdminExercisesPage from '../pages/AdminExercisesPage.jsx';

/**
 * Route definitions.
 *
 * Each entry is checked in order. The first match wins.
 *
 * Shape:
 *   { match: (pathname) => boolean | object,   // return params object or truthy
 *     render: (params, nav) => JSX.Element }
 *
 * `nav` = { go, path, triggerError, triggerSuccess }
 */
const routes = [
  {
    match: (p) => p.startsWith('/exercises/'),
    render: (_params, { path, go, triggerError }) => (
      <QuizPage page={path} go={go} onError={triggerError} />
    ),
  },
  {
    match: (p) => p === '/login',
    render: (_params, { go, triggerError }) => (
      <AuthPage register={false} go={go} onError={triggerError} />
    ),
  },
  {
    match: (p) => p === '/register',
    render: (_params, { go, triggerError }) => (
      <AuthPage register={true} go={go} onError={triggerError} />
    ),
  },
  {
    match: (p) => p === '/dashboard',
    render: (_params, { go, triggerError }) => (
      <DashboardPage go={go} onError={triggerError} />
    ),
  },
  {
    match: (p) => p === '/admin',
    render: (_params, { go }) => <AdminHomePage go={go} />,
  },
  {
    match: (p) => {
      if (!p.startsWith('/admin/users/progress/')) return false;
      const id = p.split('/').at(-1);
      return id ? { id } : false;
    },
    render: ({ id }, { go, triggerError }) => (
      <AdminProgressPage id={id} go={go} onError={triggerError} />
    ),
  },
  {
    match: (p) => p === '/admin/users',
    render: (_params, { go, triggerError, triggerSuccess }) => (
      <AdminUsersPage go={go} onError={triggerError} onSuccess={triggerSuccess} />
    ),
  },
  {
    match: (p) => p === '/admin/exercises',
    render: (_params, { go, triggerError, triggerSuccess }) => (
      <AdminExercisesPage go={go} onError={triggerError} onSuccess={triggerSuccess} />
    ),
  },
  // Fallback — matches everything
  {
    match: () => true,
    render: (_params, { go, triggerError }) => (
      <HomePage go={go} onError={triggerError} />
    ),
  },
];

export default routes;
