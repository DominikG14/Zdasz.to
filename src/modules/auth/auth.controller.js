import { safeReturn } from './auth.schemas.js';

export function createAuthController(service) {
  return {
    me: (req, res) => res.json({ user: req.session.user || null }),
    login: async (req, res, next) => {
      const result = await service.login(req.validated.body);
      req.session.regenerate(error => {
        if (error) return next(error);
        req.session.user = result.user;
        res.json({ user: result.user, returnUrl: safeReturn(result.returnUrl) });
      });
    },
    register: async (req, res) => {
      const result = await service.register(req.validated.body);
      req.session.user = result.user;
      res.json({ user: result.user, returnUrl: safeReturn(result.returnUrl) });
    },
    logout: (req, res, next) => req.session.destroy(error => error ? next(error) : res.json({ success: true })),
  };
}
