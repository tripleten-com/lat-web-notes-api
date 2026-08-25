// La ruta de login
// Requiere que el servidor esté en ejecución: npm run dev
// Ejecutar con: node tests/lesson-08.js

const BASE_URL = 'http://localhost:3000';
const testEmail = `login_test_${Date.now()}@example.com`;
const testPassword = 'password123';

const title = 'La ruta de login';
console.log(`\n${title}\n`);

let passed = 0;
let failed = 0;
let loginSkipped = false;

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

function skip(name) {
  console.log(`○ ${name} — omitida`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Registramos un usuario para poder iniciar sesión con él
const registerRes = await fetch(`${BASE_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: testEmail, password: testPassword, name: 'Login Tester' }),
});

if (registerRes.status !== 201) {
  console.log('⚠️  No se pudo registrar el usuario de prueba — asegúrate de haber implementado primero la ruta de registro');
  loginSkipped = true;
}

if (!loginSkipped) {
  await test('POST /auth/login — devuelve 200 con credenciales válidas', async () => {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword }),
    });
    assert(res.status === 200, `se esperaba 200, se recibió ${res.status}`);
    const body = await res.json();
    assert(body.success === true, 'se esperaba success: true');
    assert(body.data?.token, 'se esperaba que data.token estuviera presente');
    assert(body.data?.user?.email === testEmail, 'se esperaba que data.user.email coincidiera');
    assert(!body.data?.user?.password, 'la contraseña no debe aparecer en la respuesta');
  });
} else {
  skip('POST /auth/login — devuelve 200 con credenciales válidas');
}

await test('POST /auth/login — devuelve 401 con una contraseña incorrecta', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: 'wrongpassword' }),
  });
  assert(res.status === 401, `se esperaba 401, se recibió ${res.status}`);
  const body = await res.json();
  assert(body.success === false, 'se esperaba success: false');
  assert(
    body.error?.message === 'Credenciales inválidas',
    'se esperaba el mensaje genérico "Credenciales inválidas"',
  );
});

await test('POST /auth/login — devuelve 401 con un email que no existe', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nobody@example.com', password: 'whatever' }),
  });
  assert(res.status === 401, `se esperaba 401, se recibió ${res.status}`);
  const body = await res.json();
  assert(
    body.error?.message === 'Credenciales inválidas',
    'se esperaba el mensaje genérico "Credenciales inválidas"',
  );
});

await test('POST /auth/login — devuelve 400 cuando faltan campos', async () => {
  const res = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail }),
  });
  assert(res.status === 400, `se esperaba 400, se recibió ${res.status}`);
});

console.log(`\n${passed} aprobadas, ${failed} fallidas`);

if (failed === 0 && !loginSkipped) {
  const code = Buffer.from('bGs3LXlwY20=', 'base64').toString();
  console.log(`\nCódigo de verificación: ${code}`);
}

process.exit(failed > 0 ? 1 : 0);
