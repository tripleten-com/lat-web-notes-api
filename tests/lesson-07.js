// Variables de entorno
// Ejecutar con: node tests/lesson-07.js

import { existsSync, readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (file) =>
  existsSync(join(root, file)) ? readFileSync(join(root, file), 'utf8') : null;

// Leemos el .env sin dotenv, para que la prueba funcione aunque falte el paquete
function parseEnv(text) {
  const vars = {};
  for (const line of text.split('\n')) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (match) vars[match[1]] = match[2].replace(/^['"]|['"]$/g, '').trim();
  }
  return vars;
}

const title = 'Variables de entorno';
console.log(`\n${title}\n`);

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`✅ ${name}`);
    passed++;
  } catch (err) {
    console.log(`❌ ${name} — ${err.message}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const envText = read('.env');
const env = envText ? parseEnv(envText) : {};
const indexTs = read('src/index.ts');

test('El archivo .env existe y define MONGO_URI, PORT y JWT_SECRET', () => {
  assert(envText !== null, 'no se encontró el archivo .env en la raíz del proyecto');
  assert(env.MONGO_URI, 'falta la variable MONGO_URI en .env');
  assert(env.PORT, 'falta la variable PORT en .env');
  assert(env.JWT_SECRET, 'falta la variable JWT_SECRET en .env');
});

test('JWT_SECRET es una clave generada, no un texto de ejemplo', () => {
  assert(env.JWT_SECRET, 'falta la variable JWT_SECRET en .env');
  assert(
    !/super-strong-secret|replace-this|your-|secret-key|dev-secret/i.test(env.JWT_SECRET),
    'JWT_SECRET todavía tiene un valor de ejemplo: genera uno con crypto.randomBytes',
  );
  assert(
    env.JWT_SECRET.length >= 32,
    `JWT_SECRET es demasiado corta (${env.JWT_SECRET.length} caracteres): se esperaban al menos 32`,
  );
});

test('dotenv está instalado como dependencia', () => {
  const pkg = JSON.parse(read('package.json'));
  assert(
    pkg.dependencies && pkg.dependencies.dotenv,
    'no se encontró dotenv en las dependencias de package.json',
  );
});

test('src/index.ts carga el archivo .env con dotenv', () => {
  assert(indexTs !== null, 'no se encontró src/index.ts');
  assert(/dotenv/.test(indexTs), 'no se importa dotenv en src/index.ts');
  assert(/\.config\s*\(/.test(indexTs), 'falta la llamada a dotenv.config() en src/index.ts');
});

test('src/index.ts lee MONGO_URI y PORT desde process.env', () => {
  assert(indexTs !== null, 'no se encontró src/index.ts');
  assert(
    /process\.env\.MONGO_URI/.test(indexTs),
    'src/index.ts no lee MONGO_URI desde process.env',
  );
  assert(/process\.env\.PORT/.test(indexTs), 'src/index.ts no lee PORT desde process.env');
});

test('La cadena de conexión ya no está escrita en el código', () => {
  assert(indexTs !== null, 'no se encontró src/index.ts');
  assert(
    !/mongodb:\/\//.test(indexTs),
    'src/index.ts todavía tiene la cadena de conexión escrita a mano: debe venir de process.env',
  );
});

test('.gitignore incluye .env', () => {
  const gitignore = read('.gitignore');
  assert(gitignore !== null, 'no se encontró el archivo .gitignore');
  assert(
    /^\s*\.env\s*$/m.test(gitignore),
    'el archivo .env no está en .gitignore, así que se subiría al repositorio',
  );
});

test('Existe un .env.example con la forma del archivo, sin valores reales', () => {
  const example = read('.env.example');
  assert(example !== null, 'no se encontró el archivo .env.example');
  const vars = parseEnv(example);
  assert(
    'MONGO_URI' in vars && 'PORT' in vars && 'JWT_SECRET' in vars,
    '.env.example debe listar MONGO_URI, PORT y JWT_SECRET',
  );
  assert(
    !env.JWT_SECRET || vars.JWT_SECRET !== env.JWT_SECRET,
    '.env.example no debe contener tu clave real: deja un valor de ejemplo',
  );
});

console.log(`\n${passed} aprobadas, ${failed} fallidas`);

if (failed === 0) {
  const code = Buffer.from('cHY2LW16cnQ=', 'base64').toString();
  console.log(`\nCódigo de verificación: ${code}`);
}

process.exit(failed > 0 ? 1 : 0);
