// Autorización: de quién es cada nota
// Requiere que el servidor esté en ejecución: npm run dev
// Ejecutar con: node tests/lesson-11.js

const BASE_URL = 'http://localhost:3000';
const testPassword = 'password123';

const title = 'Autorización: de quién es cada nota';
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

function skip(name) {
  console.log(`○ ${name} — omitida`);
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

// Cada prueba necesita dos cuentas distintas para comparar lo propio con lo ajeno
async function createUser(name) {
  const email = `owner_test_${name}_${Date.now()}@example.com`;

  const registerRes = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: testPassword, name }),
  });
  if (registerRes.status !== 201) return null;

  const loginRes = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password: testPassword }),
  });
  if (loginRes.status !== 200) return null;

  const body = await loginRes.json();
  const token = body.data?.token ?? null;
  const userId = body.data?.user?.userId ?? null;

  return token && userId ? { token, userId } : null;
}

const dueno = await createUser('Dueno');
const otro = await createUser('Otro');

if (!dueno || !otro) {
  console.log('⚠️  No se pudieron crear las dos cuentas de prueba — asegúrate de que el registro y el login funcionen\n');
}

await test('GET /notes — devuelve 401 sin token', async () => {
  const res = await fetch(`${BASE_URL}/notes`);
  assert(res.status === 401, `se esperaba 401, se recibió ${res.status}`);
});

await test('POST /notes — devuelve 401 sin token', async () => {
  const res = await fetch(`${BASE_URL}/notes`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Sin dueño', body: 'No debería crearse' }),
  });
  assert(res.status === 401, `se esperaba 401, se recibió ${res.status}`);
});

let noteId = null;

if (dueno && otro) {
  await test('POST /notes — guarda como owner al usuario autenticado', async () => {
    const res = await fetch(`${BASE_URL}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${dueno.token}`,
      },
      body: JSON.stringify({ title: 'Nota del dueño', body: 'contenido' }),
    });
    assert(res.status === 201, `se esperaba 201, se recibió ${res.status}`);
    const body = await res.json();
    assert(
      body.data?.owner,
      'la nota creada no tiene campo owner — revisa el esquema y createNote',
    );
    assert(
      String(body.data.owner) === dueno.userId,
      'el owner de la nota no coincide con el usuario que la creó',
    );
    noteId = body.data._id;
  });

  await test('GET /notes — el dueño ve su propia nota', async () => {
    assert(noteId, 'no se pudo crear la nota de prueba');
    const res = await fetch(`${BASE_URL}/notes`, {
      headers: { Authorization: `Bearer ${dueno.token}` },
    });
    assert(res.status === 200, `se esperaba 200, se recibió ${res.status}`);
    const body = await res.json();
    assert(
      body.data?.some((note) => note._id === noteId),
      'la lista del dueño no incluye su propia nota',
    );
  });

  await test('GET /notes — otro usuario no ve la nota ajena', async () => {
    assert(noteId, 'no se pudo crear la nota de prueba');
    const res = await fetch(`${BASE_URL}/notes`, {
      headers: { Authorization: `Bearer ${otro.token}` },
    });
    assert(res.status === 200, `se esperaba 200, se recibió ${res.status}`);
    const body = await res.json();
    assert(
      !body.data?.some((note) => note._id === noteId),
      'la lista devuelve notas de otro usuario — revisa el filtro de getNotes',
    );
  });

  await test('DELETE /notes/:id — devuelve 403 al borrar una nota ajena', async () => {
    assert(noteId, 'no se pudo crear la nota de prueba');
    const res = await fetch(`${BASE_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${otro.token}` },
    });
    assert(res.status === 403, `se esperaba 403, se recibió ${res.status}`);
    const body = await res.json();
    assert(body.success === false, 'se esperaba success: false');
  });

  await test('DELETE /notes/:id — la nota ajena sigue existiendo tras el 403', async () => {
    assert(noteId, 'no se pudo crear la nota de prueba');
    const res = await fetch(`${BASE_URL}/notes`, {
      headers: { Authorization: `Bearer ${dueno.token}` },
    });
    const body = await res.json();
    assert(
      body.data?.some((note) => note._id === noteId),
      'la nota se borró a pesar del 403 — comprueba el dueño antes de borrar, no después',
    );
  });

  await test('DELETE /notes/:id — el dueño sí puede borrar su nota', async () => {
    assert(noteId, 'no se pudo crear la nota de prueba');
    const res = await fetch(`${BASE_URL}/notes/${noteId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${dueno.token}` },
    });
    assert(res.status === 200, `se esperaba 200, se recibió ${res.status}`);
  });

  await test('DELETE /notes/:id — devuelve 404 si la nota no existe', async () => {
    const res = await fetch(`${BASE_URL}/notes/000000000000000000000001`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${dueno.token}` },
    });
    assert(res.status === 404, `se esperaba 404, se recibió ${res.status}`);
  });
} else {
  skip('POST /notes — guarda como owner al usuario autenticado');
  skip('GET /notes — el dueño ve su propia nota');
  skip('GET /notes — otro usuario no ve la nota ajena');
  skip('DELETE /notes/:id — devuelve 403 al borrar una nota ajena');
  skip('DELETE /notes/:id — la nota ajena sigue existiendo tras el 403');
  skip('DELETE /notes/:id — el dueño sí puede borrar su nota');
  skip('DELETE /notes/:id — devuelve 404 si la nota no existe');
}

console.log(`\n${passed} aprobadas, ${failed} fallidas`);

if (failed === 0 && dueno && otro) {
  const code = Buffer.from('cXo1LXRtdmg=', 'base64').toString();
  console.log(`\nCódigo de verificación: ${code}`);
}

process.exit(failed > 0 ? 1 : 0);
