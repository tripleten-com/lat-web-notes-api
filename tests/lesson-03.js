// El modelo de usuario
// Ejecutar con: tsx tests/lesson-03.js

import User from '../src/models/user.js';

const title = 'El modelo de usuario';
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

test('Modelo User — el campo email existe', () => {
  const path = User.schema.path('email');
  assert(path, 'no se encontró el campo email en el esquema');
});

test('Modelo User — el campo email es obligatorio', () => {
  const path = User.schema.path('email');
  assert(path, 'no se encontró el campo email en el esquema');
  assert(path.isRequired, 'el campo email no está marcado como required');
});

test('Modelo User — el campo email es único', () => {
  const path = User.schema.path('email');
  assert(path, 'no se encontró el campo email en el esquema');
  assert(
    path.options.unique === true,
    'el campo email no está marcado como unique',
  );
});

test('Modelo User — el campo password es obligatorio', () => {
  const path = User.schema.path('password');
  assert(path, 'no se encontró el campo password en el esquema');
  assert(path.isRequired, 'el campo password no está marcado como required');
});

test('Modelo User — el campo name es obligatorio', () => {
  const path = User.schema.path('name');
  assert(path, 'no se encontró el campo name en el esquema');
  assert(path.isRequired, 'el campo name no está marcado como required');
});

console.log(`\n${passed} aprobadas, ${failed} fallidas`);

if (failed === 0) {
  const code = Buffer.from('dW0zLXh0cWs=', 'base64').toString();
  console.log(`\nCódigo de verificación: ${code}`);
}

process.exit(failed > 0 ? 1 : 0);
