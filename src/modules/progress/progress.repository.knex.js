export function createProgressRepository(query) {
  return {
    async dashboard(userId) {
      const [{ rows: progress }, { rows: byField }] = await Promise.all([
        query("SELECT p.field_id, COALESCE(f.name, 'Mieszane') name, p.score, p.total, p.solved_at FROM user_progress p LEFT JOIN fields f ON f.id = p.field_id WHERE p.user_id = $1 ORDER BY p.solved_at DESC", [userId]),
        query('SELECT f.number, f.name, COUNT(*)::int attempts_count, SUM(p.score)::int score_sum, SUM(p.total)::int total_sum, MAX(p.solved_at) last_solved_at FROM user_progress p JOIN fields f ON f.id = p.field_id WHERE p.user_id = $1 GROUP BY f.id ORDER BY f.id', [userId]),
      ]);
      return { progress, byField };
    },
    async userProgress(userId) {
      const [{ rows: users }, { rows: progress }, { rows: byField }] = await Promise.all([
        query('SELECT username FROM users WHERE id = $1', [userId]),
        query("SELECT f.number, f.name, p.score, p.total, p.solved_at FROM user_progress p JOIN fields f ON f.id = p.field_id WHERE p.user_id = $1 ORDER BY p.solved_at DESC LIMIT 10", [userId]),
        query('SELECT f.number, f.name, COUNT(*)::int attempts_count, SUM(p.score)::int score_sum, SUM(p.total)::int total_sum, ROUND((SUM(p.score)::numeric / NULLIF(SUM(p.total), 0)) * 100, 1)::float effectiveness_percent, MAX(p.solved_at) last_solved_at FROM user_progress p JOIN fields f ON f.id = p.field_id WHERE p.user_id = $1 GROUP BY f.id ORDER BY f.id', [userId]),
      ]);
      return users[0] ? { username: users[0].username, progress, byField } : null;
    },
  };
}
