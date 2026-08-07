// Middleware de autenticación
// Requiere que el servidor esté corriendo: npm run dev
// Ejecutar con: node tests/lesson-09.js

const BASE_URL = 'http://localhost:3000';

const title = 'Middleware de autenticación';
console.log(`\n${title}\n`);

let passed = 0;
let failed = 0;

async function test(name, fn) {
  try {
    await fn();
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

await test('GET /auth/me — devuelve 401 sin token', async () => {
  const res = await fetch(`${BASE_URL}/auth/me`);
  assert(res.status === 401, `se esperaba 401, se recibió ${res.status}`);
  const body = await res.json();
  assert(body.success === false, 'se esperaba success: false');
  assert(body.error?.message, 'se esperaba que error.message estuviera presente');
});

await test('GET /auth/me — devuelve 401 con un token mal formado', async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'Bearer this-is-not-a-valid-token' },
  });
  assert(res.status === 401, `se esperaba 401, se recibió ${res.status}`);
  const body = await res.json();
  assert(body.success === false, 'se esperaba success: false');
});

await test('GET /auth/me — devuelve 401 sin el prefijo Bearer', async () => {
  const res = await fetch(`${BASE_URL}/auth/me`, {
    headers: { Authorization: 'notabearer token' },
  });
  assert(res.status === 401, `se esperaba 401, se recibió ${res.status}`);
});

await test('DELETE /notes/:id — devuelve 401 sin token', async () => {
  const res = await fetch(`${BASE_URL}/notes/000000000000000000000001`, {
    method: 'DELETE',
  });
  assert(res.status === 401, `se esperaba 401, se recibió ${res.status}`);
  const body = await res.json();
  assert(body.success === false, 'se esperaba success: false');
});

console.log(`\n${passed} aprobadas, ${failed} fallidas`);

if (failed === 0) {
  const code = Buffer.from('bmg0LWRmemU=', 'base64').toString();
  console.log(`\nCódigo de verificación: ${code}`);
}

process.exit(failed > 0 ? 1 : 0);
