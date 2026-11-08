export function createProgressController(service) {
  return {
    dashboard: async (req, res, next) => { try { res.json(await service.dashboard(req.session.user.id)); } catch (e) { next(e); } },
    userProgress: async (req, res, next) => {
      try {
        const result = await service.userProgress(req.params.id);
        if (!result) return res.status(404).json({ error: 'Nie znaleziono użytkownika' });
        res.json(result);
      } catch (e) { next(e); }
    },
  };
}
