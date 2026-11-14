import { toExerciseView } from './exercises.mapper.js';
import ValidationError from '../../errors/ValidationError.js';
import NotFoundError from '../../errors/NotFoundError.js';

export function createExercisesService(repository, removeImage) {
  return {
    listFields: () => repository.listFields(),
    async byField(id, limit = 100) { return (await repository.listByField(id, limit)).map(toExerciseView); },
    async random(limit) {
      const result = await repository.listRandom(limit ?? 10);
      return { ...result, exercises: result.exercises.map(toExerciseView) };
    },
    saveProgress(userId, body) {
      return repository.createProgress(userId, { fieldId: body.field_id, score: body.score, total: body.total });
    },
    create(body, file) {
      if (!file) throw new ValidationError([{ location: 'body', field: 'image', message: 'Obraz jest wymagany' }]);
      return repository.create({ fieldId: body.field_id, type: body.type, answer: body.right_answer, imageUrl: `public/images/exercises/uploads/${file.filename}` });
    },
    async remove(id) {
      const exercise = await repository.remove(id);
      if (!exercise) throw new NotFoundError('Nie znaleziono zadania');
      if (exercise.image_url?.startsWith('public/images/exercises/uploads/')) await removeImage(exercise.image_url);
      return { success: true };
    },
  };
}
