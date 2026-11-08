import AppError from '../../errors/AppError.js';
import { parseSearch, parseUserId } from './admin.schemas.js';
import { toAdminUserView } from './admin.mapper.js';

export function createAdminService(repository) {
  return {
    async users(search) { return (await repository.findUsers(parseSearch(search))).map(toAdminUserView); },
    async deleteUser(id, currentUserId) {
      const userId = parseUserId(id);
      if (userId === currentUserId) throw new AppError('Nie można usunąć własnego konta', 400);
      await repository.deleteUser(userId);
      return { success: true };
    },
    exerciseCatalog: () => repository.exerciseCatalog(),
  };
}
