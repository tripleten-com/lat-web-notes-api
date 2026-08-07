import express from 'express';
import mongoose from 'mongoose';
import noteRoutes from './routes/notes.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(noteRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

mongoose
  .connect('mongodb://127.0.0.1:27017/notes')
  .then(() => {
    console.log('Conectado a MongoDB');
    app.listen(PORT, () => {
      console.log(`Servidor ejecutándose en el puerto ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Error de conexión', err);
    process.exit(1);
  });
