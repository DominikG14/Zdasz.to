import React from 'react';
import routes from './routes.jsx';

/**
 * Matches the current pathname against the route table and renders
 * the first matching route.
 *
 * Props:
 *   pathname        – current URL pathname (string)
 *   navigationProps – object forwarded to every route render fn
 *                     { path, go, triggerError, triggerSuccess }
 */
export default function Router({ pathname, navigationProps }) {
  for (const route of routes) {
    const match = route.match(pathname);
    if (match) {
      const params = typeof match === 'object' ? match : {};
      return route.render(params, navigationProps);
    }
  }
  // Should never reach here — the fallback route always matches.
  return null;
}
