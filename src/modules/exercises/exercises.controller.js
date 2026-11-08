export function createExercisesController(service) {
  return {
    fields: async (_req, res, next) => { try { res.json(await service.listFields()); } catch (e) { next(e); } },
    byField: async (req, res, next) => { try { res.json(await service.byField(req.params.id, req.query.limit)); } catch (e) { next(e); } },
    random: async (req, res, next) => { try { res.json(await service.random(req.query.limit)); } catch (e) { next(e); } },
    saveProgress: async (req, res, next) => { try { await service.saveProgress(req.session.user.id, req.body); res.json({ success: true }); } catch (e) { next(e); } },
    create: async (req, res, next) => { try { await service.create(req.body, req.file); res.json({ success: true }); } catch (e) { next(e); } },
  };
}
