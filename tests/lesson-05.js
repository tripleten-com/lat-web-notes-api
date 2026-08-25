// La ruta de registro
// Requiere que el servidor esté en ejecución: npm run dev
// Ejecutar con: node tests/lesson-05.js

const BASE_URL = 'http://localhost:3000';
const testEmail = `test_${Date.now()}@example.com`;

const title = 'La ruta de registro';
console.log(`\n${title}\n`);

let passed = 0;
let failed = 0;
let registeredUserId = null;

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

await test('POST /auth/register — devuelve 201 con un body válido', async () => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'password123', name: 'Test User' }),
  });
  assert(res.status === 201, `se esperaba 201, se recibió ${res.status}`);
  const body = await res.json();
  assert(body.success === true, 'se esperaba success: true');
  assert(body.data?.userId, 'se esperaba que data.userId estuviera presente');
  assert(body.data?.email === testEmail, 'se esperaba que data.email coincidiera');
  assert(body.data?.name === 'Test User', 'se esperaba que data.name coincidiera');
  assert(!body.data?.password, 'la contraseña no debe aparecer en la respuesta');
  registeredUserId = body.data.userId;
});

await test('POST /auth/register — devuelve 400 cuando faltan campos', async () => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  assert(res.status === 400, `se esperaba 400, se recibió ${res.status}`);
  const body = await res.json();
  assert(body.success === false, 'se esperaba success: false');
  assert(body.error?.message, 'se esperaba que error.message estuviera presente');
});

await test('POST /auth/register — la respuesta nunca incluye la contraseña', async () => {
  const res = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: `safe_${Date.now()}@example.com`,
      password: 'secret',
      name: 'Safe Check',
    }),
  });
  const body = await res.json();
  const bodyStr = JSON.stringify(body);
  assert(!bodyStr.includes('secret'), 'la contraseña apareció en el cuerpo de la respuesta');
});

console.log(`\n${passed} aprobadas, ${failed} fallidas`);

if (failed === 0) {
  const code = Buffer.from('cngyLXZid2o=', 'base64').toString();
  console.log(`\nCódigo de verificación: ${code}`);
}

process.exit(failed > 0 ? 1 : 0);
