export function createAdminController(service) {
  return {
    users: async (req, res, next) => { try { res.json(await service.users(req.query.search)); } catch (e) { next(e); } },
    removeUser: async (req, res, next) => { try { res.json(await service.deleteUser(req.params.id, req.session.user.id)); } catch (e) { next(e); } },
    exercises: async (_req, res, next) => { try { res.json(await service.exerciseCatalog()); } catch (e) { next(e); } },
  };
}
