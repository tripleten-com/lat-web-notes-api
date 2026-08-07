# Notes API

Una API de notas sencilla. Tu tarea es agregarle la autenticación.

## Puesta en marcha

1. Clona el repositorio
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Asegúrate de que MongoDB esté en ejecución y arranca el servidor de desarrollo:
   ```bash
   npm run dev
   ```

Si todo está bien, vas a ver estas dos líneas:

```
Conectado a MongoDB
Servidor ejecutándose en el puerto 3000
```

## Qué viene resuelto

- Un modelo `Note` con `title`, `body` y `createdAt`
- Las rutas `GET /notes`, `POST /notes` y `DELETE /notes/:id`
- El middleware de manejo de errores
- Stubs para todo lo que vas a implementar tú

## Comprobar tu trabajo

Las pruebas de cada lección están en `tests/` y se ejecutan con un script de npm cuyo número corresponde al de la lección:

```bash
npm run test:03    # el modelo de usuario
npm run test:05    # la ruta de registro
npm run test:07    # variables de entorno
npm run test:08    # la ruta de login
npm run test:09    # el middleware de autenticación
npm run test:10    # el endpoint de perfil
```

Todas necesitan el servidor en ejecución, en otra terminal, salvo `test:03` y `test:07`, que leen los archivos del proyecto directamente. Cuando una prueba pasa por completo, imprime el código de verificación que tienes que ingresar en la lección.

## La API

Así se ve la API cuando termines de implementarla. En el código inicial las rutas existen, pero ninguna comprueba todavía quién hace la petición.

| Método | Ruta | Requiere token | Descripción |
|--------|------|----------------|-------------|
| `GET` | `/notes` | No | Devuelve todas las notas |
| `POST` | `/notes` | No | Crea una nota |
| `DELETE` | `/notes/:id` | Sí | Elimina una nota |
| `POST` | `/auth/register` | No | Registra un usuario nuevo |
| `POST` | `/auth/login` | No | Inicia sesión y devuelve un token |
| `GET` | `/auth/me` | Sí | Devuelve el perfil del usuario actual |
