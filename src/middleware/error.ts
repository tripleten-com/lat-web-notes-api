import type { Request, Response, NextFunction } from 'express';

export const notFoundHandler = (req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    data: null,
    error: { message: `No se encontró la ruta ${req.method} ${req.path}` },
  });
};

export const errorHandler = (
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction,
) => {
  console.error(err);
  res.status(500).json({
    success: false,
    data: null,
    error: { message: 'Ha ocurrido un error en el servidor' },
  });
};
