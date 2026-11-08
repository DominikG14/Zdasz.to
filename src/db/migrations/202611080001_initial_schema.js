export async function up(knex) {
  // Adopt a database created by the former docker-entrypoint init script.
  if (await knex.schema.hasTable('users')) {
    await knex.raw('CREATE UNIQUE INDEX IF NOT EXISTS fields_number_seed_unique ON fields(number)');
    await knex.raw('CREATE UNIQUE INDEX IF NOT EXISTS exercises_image_url_seed_unique ON exercises(image_url)');
    return;
  }

  await knex.schema.createTable('users', table => {
    table.increments('id');
    table.string('username', 50).notNullable().unique();
    table.string('email', 255).notNullable().unique();
    table.text('password').notNullable();
    table.timestamp('created_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.timestamp('updated_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
  });

  await knex.schema.createTable('fields', table => {
    table.increments('id');
    table.string('number', 10).notNullable().unique('fields_number_seed_unique');
    table.string('name', 100).notNullable();
  });

  await knex.schema.createTable('roles', table => {
    table.increments('id');
    table.string('name', 30).notNullable().unique();
  });

  await knex.schema.createTable('exercises', table => {
    table.increments('id');
    table.integer('field_id').notNullable().references('id').inTable('fields').onDelete('CASCADE');
    table.text('image_url').unique('exercises_image_url_seed_unique');
    table.string('type', 4).notNullable();
    table.text('right_answer').notNullable();
    table.index(['field_id']);
  });
  await knex.raw("ALTER TABLE exercises ADD CONSTRAINT exercises_type_check CHECK (type IN ('ABCD', 'PF'))");
  await knex.raw("ALTER TABLE exercises ADD CONSTRAINT check_right_answer_format CHECK ((type = 'ABCD' AND right_answer ~ '^[A-D]$') OR (type = 'PF' AND right_answer ~ '^[PF]{2}$'))");

  await knex.schema.createTable('user_roles', table => {
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('role_id').notNullable().references('id').inTable('roles').onDelete('CASCADE');
    table.primary(['user_id', 'role_id']);
  });

  await knex.schema.createTable('user_progress', table => {
    table.increments('id');
    table.integer('user_id').notNullable().references('id').inTable('users').onDelete('CASCADE');
    table.integer('field_id').notNullable().references('id').inTable('fields').onDelete('CASCADE');
    table.integer('score').notNullable();
    table.integer('total').notNullable();
    table.timestamp('solved_at', { useTz: true }).notNullable().defaultTo(knex.fn.now());
    table.index(['user_id', 'solved_at']);
  });
  await knex.raw('ALTER TABLE user_progress ADD CONSTRAINT user_progress_score_check CHECK (score >= 0 AND total > 0 AND score <= total)');

  await knex.raw(`CREATE VIEW v_exercise_catalog AS
    SELECT e.id AS exercise_id, e.image_url, e.type, e.right_answer,
      f.id AS field_id, f.number AS field_number, f.name AS field_name
    FROM exercises e JOIN fields f ON f.id = e.field_id`);
  await knex.raw(`CREATE VIEW v_field_exercise_stats AS
    SELECT f.id AS field_id, f.number AS field_number, f.name AS field_name,
      COUNT(e.id) AS exercises_count,
      COUNT(e.id) FILTER (WHERE e.type = 'ABCD') AS abcd_count,
      COUNT(e.id) FILTER (WHERE e.type = 'PF') AS pf_count
    FROM fields f LEFT JOIN exercises e ON e.field_id = f.id
    GROUP BY f.id, f.number, f.name`);
  await knex.raw(`CREATE VIEW v_user_progress_summary AS
    SELECT u.id AS user_id, u.username, u.email,
      EXISTS (SELECT 1 FROM user_roles ur JOIN roles r ON r.id = ur.role_id WHERE ur.user_id = u.id AND r.name = 'ADMIN') AS is_admin,
      COUNT(up.id) AS attempts_count, COALESCE(SUM(up.score), 0) AS score_sum,
      COALESCE(SUM(up.total), 0) AS total_sum,
      COALESCE(ROUND((SUM(up.score)::numeric / NULLIF(SUM(up.total), 0)) * 100, 2), 0) AS effectiveness_percent,
      MAX(up.solved_at) AS last_solved_at
    FROM users u LEFT JOIN user_progress up ON up.user_id = u.id
    GROUP BY u.id, u.username, u.email`);
  await knex.raw(`CREATE VIEW v_user_field_progress_summary AS
    SELECT u.id AS user_id, u.username, f.id AS field_id, f.number AS field_number, f.name AS field_name,
      COUNT(up.id) AS attempts_count, COALESCE(SUM(up.score), 0) AS score_sum,
      COALESCE(SUM(up.total), 0) AS total_sum,
      COALESCE(ROUND((SUM(up.score)::numeric / NULLIF(SUM(up.total), 0)) * 100, 2), 0) AS effectiveness_percent,
      MAX(up.solved_at) AS last_solved_at
    FROM users u JOIN user_progress up ON up.user_id = u.id JOIN fields f ON f.id = up.field_id
    GROUP BY u.id, u.username, f.id, f.number, f.name`);
}

export async function down(knex) {
  await knex.raw('DROP VIEW IF EXISTS v_user_field_progress_summary');
  await knex.raw('DROP VIEW IF EXISTS v_user_progress_summary');
  await knex.raw('DROP VIEW IF EXISTS v_field_exercise_stats');
  await knex.raw('DROP VIEW IF EXISTS v_exercise_catalog');
  await knex.schema.dropTableIfExists('user_progress');
  await knex.schema.dropTableIfExists('user_roles');
  await knex.schema.dropTableIfExists('exercises');
  await knex.schema.dropTableIfExists('roles');
  await knex.schema.dropTableIfExists('fields');
  await knex.schema.dropTableIfExists('users');
}
