import { Request, Response, NextFunction } from 'express';
import { pool } from '../db/connection';

export const healthCheck = async (_req: Request, res: Response, _next: NextFunction) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
};

export const databaseHealth = async (_req: Request, res: Response, _next: NextFunction) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({
      status: 'ok',
      database: 'connected',
      timestamp: result.rows[0].now,
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'disconnected',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
