export function requireUser(req, res, next) {
  if (!req.session.user) return res.status(401).json({ error: 'Zaloguj się' });
  next();
}

export function requireAdmin(req, res, next) {
  if (!req.session.user?.isAdmin) return res.status(403).json({ error: 'Brak uprawnień' });
  next();
}
