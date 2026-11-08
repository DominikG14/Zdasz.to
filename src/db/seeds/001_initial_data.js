import { readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const imageRoot = path.resolve(here, '../../../public/images/exercises');

const fields = [
  { number: '0', name: 'Mieszane zadania' },
  { number: 'I', name: 'Liczby rzeczywiste' },
  { number: 'II', name: 'Wyrażenia algebraiczne' },
  { number: 'III', name: 'Równania i nierówności' },
  { number: 'IV', name: 'Układy równań' },
  { number: 'V', name: 'Funkcje' },
  { number: 'VI', name: 'Ciągi' },
  { number: 'VII', name: 'Trygonometria' },
  { number: 'VIII', name: 'Planimetria' },
  { number: 'IX', name: 'Geometria analityczna' },
  { number: 'X', name: 'Stereometria' },
  { number: 'XI', name: 'Kombinatoryka' },
  { number: 'XII', name: 'Prawdopodobieństwo' },
  { number: 'XIII', name: 'Statystyka' },
  { number: 'XIV', name: 'Optymalizacja' },
];

// Answer keys for the images currently in public/images/exercises.
const answers = {
  'I/1.png': 'C', 'I/2.png': 'C', 'I/3.png': 'B', 'I/4.png': 'B', 'I/5.png': 'B', 'I/6.png': 'C', 'I/7.png': 'B', 'I/8.png': 'PP',
  'II/1.png': 'A', 'II/2.png': 'A', 'II/3.png': 'A',
  'III/1.png': 'B', 'III/2.png': 'C', 'III/3.png': 'D',
  'IV/1.png': 'D',
  'V/1.png': 'PF', 'V/2.png': 'C', 'V/3.png': 'A', 'V/4.png': 'D', 'V/5.png': 'FF', 'V/6.png': 'A', 'V/7.png': 'D',
  'VI/1.png': 'C', 'VI/2.png': 'PP', 'VI/3.png': 'C', 'VI/4.png': 'B',
  'VII/1.png': 'B', 'VII/2.png': 'A', 'VII/3.png': 'C', 'VII/4.png': 'D',
  'VIII/1.png': 'C', 'VIII/2.png': 'B', 'VIII/3.png': 'C', 'VIII/4.png': 'B',
  'IX/1.png': 'B', 'IX/2.png': 'D', 'IX/3.png': 'B', 'IX/4.png': 'D', 'IX/5.png': 'PF',
  'X/1.png': 'D', 'X/2.png': 'PP',
  'XI/1.png': 'A', 'XI/2.png': 'A',
  'XIII/1.png': 'A', 'XIII/2.png': 'C', 'XIII/3.png': 'PP', 'XIII/4.png': 'C',
  'XIV/1.png': 'D', 'XIV/2.png': 'A',
};

const demoPassword = '$2y$10$AQorn7STxT67uCWbD55O7OQYPMcWPJt8CXOzhpXVYV7pZWJ0TgHXm';
const users = [
  ['MatmaMistrz', 'mistrz@example.com', demoPassword],
  ['AnkaSkakanka', 'anna.nowak@example.com', demoPassword],
  ['Kowal99', 'kowal99@example.com', demoPassword],
  ['KrólowaNauk', 'krolowa@example.com', demoPassword],
  ['PiotrekPolujeNa100', 'piotr.mat@example.com', demoPassword],
  ['ZdysiekX', 'zdysiek@example.com', demoPassword],
  ['SzybkiZmienna', 'x.y.z@example.com', demoPassword],
  ['DeltaUjemna', 'brak_rozwiazan@example.com', demoPassword],
  ['Calka_z_Kawy', 'student2026@example.com', demoPassword],
  ['PlanimetriaFan', 'trojkaty@example.com', demoPassword],
  ['AsKombinatoryki', 'prawdopodobienstwo@example.com', demoPassword],
  ['MaturzystaNaKrawedzi', 'ostatnia.szansa@example.com', demoPassword],
  ['admin', 'admin@example.com', '$2y$10$Iuzxt9Zlcj3.5oC9tGmpYO/tCh5Yv/Ykqnc6KIyKTD0YFM73jI8o.'],
];

async function listImages(directory, relative = '') {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name, 'en'))) {
    const rel = path.join(relative, entry.name);
    if (entry.isDirectory()) files.push(...await listImages(path.join(directory, entry.name), rel));
    else if (/\.(png|jpe?g|gif)$/i.test(entry.name)) files.push(rel.split(path.sep).join('/'));
  }
  return files;
}

export async function seed(knex) {
  const fieldNumbers = new Set(fields.map(field => field.number));
  const imagePaths = (await listImages(imageRoot)).filter(imagePath => fieldNumbers.has(imagePath.split('/')[0]));
  const missingAnswers = imagePaths.filter(imagePath => !(imagePath in answers));
  const absentImages = Object.keys(answers).filter(imagePath => !imagePaths.includes(imagePath));
  if (missingAnswers.length || absentImages.length) {
    throw new Error(`Seed exercise catalog mismatch. Missing answer keys: ${missingAnswers.join(', ') || 'none'}; missing images: ${absentImages.join(', ') || 'none'}`);
  }
  const expectedImageUrls = imagePaths.map(imagePath => `public/images/exercises/${imagePath}`);

  await knex.transaction(async trx => {
    await trx('roles').insert({ name: 'ADMIN' }).onConflict('name').ignore();
    await trx('fields').insert(fields).onConflict('number').merge(['name']);
    await trx('users').insert(users.map(([username, email, password]) => ({ username, email, password }))).onConflict('username').ignore();
    const fieldRows = await trx('fields').select(['id', 'number']);
    const userRows = await trx('users').select(['id', 'username']).where({ username: 'admin' });
    const roleRows = await trx('roles').select(['id']).where({ name: 'ADMIN' });
    const fieldIds = new Map(fieldRows.map(field => [field.number, field.id]));
    await trx('exercises')
      .where('image_url', 'like', 'public/images/exercises/%')
      .whereNotLike('image_url', 'public/images/exercises/uploads/%')
      .whereNotIn('image_url', expectedImageUrls)
      .del();
    await trx('user_roles').insert({ user_id: userRows[0].id, role_id: roleRows[0].id }).onConflict(['user_id', 'role_id']).ignore();
    const exercises = imagePaths.map(imagePath => {
      const [fieldNumber] = imagePath.split('/');
      const answer = answers[imagePath];
      return {
        field_id: fieldIds.get(fieldNumber),
        image_url: `public/images/exercises/${imagePath}`,
        type: answer.length === 1 ? 'ABCD' : 'PF',
        right_answer: answer,
      };
    });
    await trx('exercises').insert(exercises).onConflict('image_url').merge(['field_id', 'type', 'right_answer']);
    for (const table of ['roles', 'fields', 'users', 'exercises']) {
      await trx.raw("SELECT setval(pg_get_serial_sequence(?, 'id'), COALESCE(MAX(id), 1), MAX(id) IS NOT NULL) FROM ??", [table, table]);
    }
  });
  console.info(`Seeded ${exercises.length} exercises from public/images/exercises.`);
}
