export function createExercisesRepository(query) {
  return {
    async listFields() {
      const { rows } = await query("SELECT f.id, f.number, f.name, COUNT(e.id)::int exercises_count FROM fields f LEFT JOIN exercises e ON e.field_id = f.id WHERE f.number <> '0' GROUP BY f.id ORDER BY f.id");
      return rows;
    },
    async listByField(fieldId, limit) {
      const { rows } = await query('SELECT id, image_url, type, right_answer FROM exercises WHERE field_id = $1 ORDER BY RANDOM() LIMIT $2', [fieldId, limit]);
      return rows;
    },
    async listRandom(limit) {
      const [{ rows: exercises }, { rows: fields }] = await Promise.all([query('SELECT id, image_url, type, right_answer FROM exercises ORDER BY RANDOM() LIMIT $1', [limit]), query("SELECT id FROM fields WHERE number = '0'")]);
      return { exercises, fieldId: fields[0]?.id || 0 };
    },
    async createProgress(userId, progress) {
      await query('INSERT INTO user_progress(user_id, field_id, score, total) VALUES($1, $2, $3, $4)', [userId, progress.fieldId, progress.score, progress.total]);
    },
    async create({ fieldId, imageUrl, type, answer }) {
      await query('INSERT INTO exercises(field_id, image_url, type, right_answer) VALUES($1, $2, $3, $4)', [fieldId, imageUrl, type, answer]);
    },
    async remove(id) {
      const { rows } = await query('DELETE FROM exercises WHERE id = $1 RETURNING image_url', [id]);
      return rows[0] || null;
    },
  };
}
