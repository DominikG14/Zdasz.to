// Keeps the repository Promise<{ rows, rowCount }> interface while executing
// parameterized SQL through Knex's PostgreSQL client.
export function createKnexQuery(knex) {
  return (sql, values = []) => {
    const bindings = {};
    const knexSql = sql.replace(/\$(\d+)/g, (_match, index) => {
      const name = `value${index}`;
      bindings[name] = values[Number(index) - 1];
      return `:${name}`;
    });
    return knex.raw(knexSql, bindings);
  };
}
