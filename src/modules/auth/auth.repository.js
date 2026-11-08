export function createAuthRepository(query) {
  return {
    async findByEmail(email) {
      const { rows } = await query(`SELECT u.id, u.username, u.email, u.password,
        EXISTS(SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id AND r.name = $2) AS is_admin
        FROM users u WHERE lower(u.email) = lower($1)`, [email, 'ADMIN']);
      return rows[0] || null;
    },
    async create({ username, email, passwordHash }) {
      const { rows } = await query('INSERT INTO users(username, email, password) VALUES($1, $2, $3) RETURNING id, username, email', [username, email, passwordHash]);
      return rows[0];
    },
  };
}
