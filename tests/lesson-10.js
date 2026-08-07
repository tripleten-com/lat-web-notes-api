// El endpoint de perfil
// Requiere que el servidor esté corriendo: npm run dev
// Ejecutar con: node tests/lesson-10.js

const BASE_URL = 'http://localhost:3000';
const testEmail = `profile_test_${Date.now()}@example.com`;
const testPassword = 'password123';

const title = 'El endpoint de perfil';
console.log(`\n${title}\n`);

let passed = 0;
let failed = 0;
let token = null;

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

// Registramos e iniciamos sesión para obtener un token
const registerRes = await fetch(`${BASE_URL}/auth/register`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: testEmail, password: testPassword, name: 'Profile Tester' }),
});

if (registerRes.status === 201) {
  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });
  if (loginRes.status === 200) {
    const loginBody = await loginRes.json();
    token = loginBody.data?.token ?? null;
  }
}

if (!token) {
  console.log('⚠️  No se pudo obtener un token — asegúrate de haber implementado primero el registro y el login\n');
}

if (token) {
  await test('GET /auth/me — devuelve el usuario autenticado con un token válido', async () => {
    const res = await fetch(`${BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert(res.status === 200, `se esperaba 200, se recibió ${res.status}`);
    const body = await res.json();
    assert(body.success === true, 'se esperaba success: true');
    assert(
      body.data?.user?.email === testEmail,
      'se esperaba que data.user.email coincidiera con el usuario autenticado',
    );
    assert(!body.data?.user?.password, 'la contraseña no debe aparecer en la respuesta del perfil');
  });
} else {
  skip('GET /auth/me — devuelve el usuario autenticado con un token válido');
}

console.log(`\n${passed} aprobadas, ${failed} fallidas`);

if (failed === 0 && token) {
  const code = Buffer.from('Ymc5LWt3dHM=', 'base64').toString();
  console.log(`\nCódigo de verificación: ${code}`);
}

process.exit(failed > 0 ? 1 : 0);
