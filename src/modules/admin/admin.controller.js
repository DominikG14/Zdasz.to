export function createAdminController(service) {
  return {
    users: async (req, res) => res.json(await service.users(req.validated.query.search)),
    removeUser: async (req, res) => res.json(await service.deleteUser(req.validated.params.id, req.user.id)),
    exercises: async (_req, res) => res.json(await service.exerciseCatalog()),
  };
}
