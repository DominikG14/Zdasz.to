export function createExercisesController(service) {
  return {
    fields: async (_req, res) => res.json(await service.listFields()),
    byField: async (req, res) => res.json(await service.byField(req.validated.params.id, req.validated.query.limit)),
    random: async (req, res) => res.json(await service.random(req.validated.query.limit)),
    saveProgress: async (req, res) => { await service.saveProgress(req.session.user.id, req.validated.body); res.json({ success: true }); },
    create: async (req, res) => { await service.create(req.validated.body, req.file); res.json({ success: true }); },
  };
}
