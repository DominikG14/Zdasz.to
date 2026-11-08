import { safeReturn } from './auth.schemas.js';

export function createAuthController(service) {
  return {
    me: (req, res) => res.json({ user: req.user || null }),
    login: async (req, res) => {
      const result = await service.login(req.validated.body);
      res.json({ user: result.user, token: result.token, returnUrl: safeReturn(result.returnUrl) });
    },
    register: async (req, res) => {
      const result = await service.register(req.validated.body);
      res.json({ user: result.user, token: result.token, returnUrl: safeReturn(result.returnUrl) });
    },
    logout: (_req, res) => res.json({ success: true }),
  };
}
