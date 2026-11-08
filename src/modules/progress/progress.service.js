export const createProgressService = repository => ({ dashboard: id => repository.dashboard(id), userProgress: id => repository.userProgress(id) });
