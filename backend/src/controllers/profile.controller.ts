import { Response, NextFunction } from 'express';
import { query } from '../db/connection';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

export const getCurrentProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const result = await query('SELECT * FROM profiles WHERE id = $1', [req.user!.id]);

    if (result.rows.length === 0) {
      throw new AppError('Profile not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { full_name, phone, institution, position, city, avatar_url } = req.body;

    const result = await query(
      `UPDATE profiles 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           institution = COALESCE($3, institution),
           position = COALESCE($4, position),
           city = COALESCE($5, city),
           avatar_url = COALESCE($6, avatar_url)
       WHERE id = $7
       RETURNING *`,
      [full_name, phone, institution, position, city, avatar_url, req.user!.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};

export const getProfileById = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query('SELECT * FROM profiles WHERE id = $1', [id]);

    if (result.rows.length === 0) {
      throw new AppError('Profile not found', 404);
    }

    res.json(result.rows[0]);
  } catch (error) {
    next(error);
  }
};
