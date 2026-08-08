import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import mongoose from 'mongoose';
import noteRoutes from './routes/notes.js';
import authRoutes from './routes/auth.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(noteRoutes);
app.use(authRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGO_URI!)
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
