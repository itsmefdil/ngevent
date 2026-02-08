import { Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import db from '../db/connection';
import { speakers } from '../db/schema';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';

export const getSpeakersByEventId = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;

    const eventSpeakers = await db
      .select()
      .from(speakers)
      .where(eq(speakers.eventId, eventId))
      .orderBy(speakers.orderIndex);

    res.json(eventSpeakers);
  } catch (error) {
    next(error);
  }
};

export const createSpeakers = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { speakers: speakersList } = req.body;

    if (!Array.isArray(speakersList) || speakersList.length === 0) {
      throw new AppError('Speakers array is required', 400);
    }

    // Transform snake_case to camelCase for database
    const transformedSpeakers = speakersList.map(speaker => ({
      eventId: speaker.event_id,
      name: speaker.name,
      title: speaker.title,
      company: speaker.company,
      bio: speaker.bio,
      photoUrl: speaker.photo_url,
      linkedinUrl: speaker.linkedin_url,
      twitterUrl: speaker.twitter_url,
      websiteUrl: speaker.website_url,
      orderIndex: speaker.order_index ?? 0,
    }));

    const insertedSpeakers = await db.insert(speakers).values(transformedSpeakers).returning();

    res.status(201).json(insertedSpeakers);
  } catch (error) {
    next(error);
  }
};

export const deleteSpeakersByEventId = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;

    await db.delete(speakers).where(eq(speakers.eventId, eventId));

    res.json({ message: 'Speakers deleted successfully' });
  } catch (error) {
    next(error);
  }
};
