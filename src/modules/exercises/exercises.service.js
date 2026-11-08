import { toExerciseView } from './exercises.mapper.js';
import ValidationError from '../../errors/ValidationError.js';

export function createExercisesService(repository) {
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
  };
}
