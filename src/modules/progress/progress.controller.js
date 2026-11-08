import NotFoundError from '../../errors/NotFoundError.js';

export function createProgressController(service) {
  return {
    dashboard: async (req, res) => res.json(await service.dashboard(req.session.user.id)),
    userProgress: async (req, res) => {
      const result = await service.userProgress(req.validated.params.id);
      if (!result) throw new NotFoundError('Nie znaleziono użytkownika');
      res.json(result);
    },
  };
}
