import { useState, useCallback, useEffect } from 'react';

/**
 * Lightweight client-side navigation hook.
 * Returns the current pathname + search string and a `go(path)` imperative.
 */
export function useNavigation() {
  const [path, setPath] = useState(location.pathname + location.search);

  const go = useCallback((target) => {
    history.pushState({}, '', target);
    setPath(target);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    const onPopState = () => setPath(location.pathname + location.search);
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  return { path, go };
}
