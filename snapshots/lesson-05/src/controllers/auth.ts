import type { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import User from '../models/user.js';

export const register = async (req: Request, res: Response) => {
  const { email, password, name } = req.body;

  if (!email || !password || !name) {
    res.status(400).json({
      success: false,
      data: null,
      error: { message: 'Los campos email, password y name son obligatorios' },
    });
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    const user = await User.create({ email, password: hashedPassword, name });
    res.status(201).json({
      success: true,
      data: { userId: user._id, email: user.email, name: user.name },
      error: null,
    });
  } catch (err: unknown) {
    if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
      res.status(409).json({
        success: false,
        data: null,
        error: { message: 'Ese email ya está en uso' },
      });
      return;
    }
    throw err;
  }
};

export const login = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    data: null,
    error: { message: 'Todavía no implementado' },
  });
};

export const getProfile = async (req: Request, res: Response) => {
  res.status(501).json({
    success: false,
    data: null,
    error: { message: 'Todavía no implementado' },
  });
};
