import { Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import db from '../db/connection';
import { formFields } from '../db/schema';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

export const getFormFieldsByEventId = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;

    const fields = await db
      .select()
      .from(formFields)
      .where(eq(formFields.eventId, eventId))
      .orderBy(formFields.orderIndex);

    res.json(fields);
  } catch (error) {
    next(error);
  }
};

export const createFormFields = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { fields } = req.body;

    if (!Array.isArray(fields) || fields.length === 0) {
      throw new AppError('Fields array is required', 400);
    }

    // Transform snake_case to camelCase for database
    const transformedFields = fields.map(field => ({
      eventId: field.event_id,
      fieldName: field.field_name,
      fieldType: field.field_type,
      isRequired: field.is_required,
      options: field.options,
      orderIndex: field.order_index,
    }));

    const insertedFields = await db.insert(formFields).values(transformedFields).returning();

    res.status(201).json(insertedFields);
  } catch (error) {
    next(error);
  }
};

export const deleteFormFieldsByEventId = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;

    await db.delete(formFields).where(eq(formFields.eventId, eventId));

    res.json({ message: 'Form fields deleted successfully' });
  } catch (error) {
    next(error);
  }
};
