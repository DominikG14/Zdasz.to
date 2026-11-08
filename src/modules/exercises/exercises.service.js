import { parseLimit, parseNewExercise, parseProgress } from './exercises.schemas.js';
import { toExerciseView } from './exercises.mapper.js';

export function createExercisesService(repository) {
  return {
    listFields: () => repository.listFields(),
    async byField(id, limit) { return (await repository.listByField(id, parseLimit(limit, 100, 100))).map(toExerciseView); },
    async random(limit) {
      const result = await repository.listRandom(parseLimit(limit, 10, 50));
      return { ...result, exercises: result.exercises.map(toExerciseView) };
    },
    saveProgress(userId, body) { return repository.createProgress(userId, parseProgress(body)); },
    create(body, file) { return repository.create({ ...parseNewExercise(body, file), imageUrl: `public/images/exercises/uploads/${file.filename}` }); },
  };
}
