export function createAdminRepository(query) {
  return {
    async findUsers(search) {
      const { rows } = await query('SELECT id, username, email FROM users WHERE username ILIKE $1 OR email ILIKE $1 ORDER BY username', [`%${search}%`]);
      return rows;
    },
    async deleteUser(id) {
      const { rowCount } = await query('DELETE FROM users WHERE id = $1', [id]);
      return rowCount > 0;
    },
    async exerciseCatalog() {
      const [{ rows: fields }, { rows: exercises }] = await Promise.all([
        query('SELECT id, number, name FROM fields ORDER BY id'),
        query('SELECT e.id, e.field_id, e.image_url, e.type, e.right_answer, f.number field_number, f.name field_name FROM exercises e LEFT JOIN fields f ON f.id = e.field_id ORDER BY e.id DESC'),
      ]);
      return { fields, exercises };
    },
  };
}
