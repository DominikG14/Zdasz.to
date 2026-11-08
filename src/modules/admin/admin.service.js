import AppError from '../../errors/AppError.js';
import { toAdminUserView } from './admin.mapper.js';

export function createAdminService(repository) {
  return {
    async users(search = '') { return (await repository.findUsers(search.trim())).map(toAdminUserView); },
    async deleteUser(id, currentUserId) {
      if (id === currentUserId) throw new AppError('Nie można usunąć własnego konta', { statusCode: 400, code: 'BAD_REQUEST' });
      await repository.deleteUser(id);
      return { success: true };
    },
    exerciseCatalog: () => repository.exerciseCatalog(),
  };
}
