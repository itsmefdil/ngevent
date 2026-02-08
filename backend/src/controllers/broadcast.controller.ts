import { Response, NextFunction } from 'express';
import { eq, and, desc } from 'drizzle-orm';
import db from '../db/connection';
import { events, registrations, profiles, users, broadcastHistory } from '../db/schema';
import { AppError } from '../middlewares/errorHandler';
import { AuthRequest } from '../middlewares/auth';
import { sendEventNotification } from '../utils/email';

export const broadcastToParticipants = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;
    const { subject, message } = req.body;

    if (!subject || !message) {
      throw new AppError('Subject and message are required', 400);
    }

    // Verify event exists and user is organizer
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, req.user!.id))
      .limit(1);

    if (event.organizerId !== req.user!.id && profile?.role !== 'admin') {
      throw new AppError('Unauthorized: You are not the organizer of this event', 403);
    }

    // Get all registered participants
    const participants = await db
      .select({
        userId: registrations.userId,
        fullName: profiles.fullName,
        email: users.email,
      })
      .from(registrations)
      .innerJoin(profiles, eq(registrations.userId, profiles.id))
      .innerJoin(users, eq(profiles.id, users.id))
      .where(
        and(
          eq(registrations.eventId, eventId),
          eq(registrations.status, 'registered')
        )
      );

    if (participants.length === 0) {
      res.json({
        message: 'No participants found for this event',
        sent: 0
      });
      return;
    }

    // Helper function to replace placeholders
    const replacePlaceholders = (text: string, participant: any, event: any) => {
      const firstName = participant.fullName?.split(' ')[0] || 'Peserta';
      const fullName = participant.fullName || 'Peserta';

      // Format date and time
      let eventDate = '';
      let eventTime = '';
      try {
        const date = new Date(event.startDate);
        eventDate = date.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        });
        eventTime = date.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        });
      } catch (e) {
        eventDate = event.startDate || '';
        eventTime = '';
      }

      return text
        .replace(/\{firstName\}/g, firstName)
        .replace(/\{fullName\}/g, fullName)
        .replace(/\{eventTitle\}/g, event.title)
        .replace(/\{eventDate\}/g, eventDate)
        .replace(/\{eventTime\}/g, eventTime)
        .replace(/\{eventLocation\}/g, event.location || 'TBA');
    };

    // Send personalized emails to all participants
    const emailPromises = participants.map(participant => {
      const personalizedSubject = replacePlaceholders(subject, participant, event);
      const personalizedMessage = replacePlaceholders(message, participant, event);

      return sendEventNotification(
        participant.email,
        event.title,
        `<h2>${personalizedSubject}</h2><p style="white-space: pre-wrap;">${personalizedMessage}</p>`
      );
    });

    await Promise.allSettled(emailPromises);

    // Save broadcast history
    await db.insert(broadcastHistory).values({
      eventId,
      subject,
      message,
      recipientCount: participants.length,
      status: 'sent',
    });

    res.json({
      message: `Broadcast sent to ${participants.length} participants`,
      sent: participants.length,
      eventTitle: event.title,
    });
    return;
  } catch (error) {
    next(error);
    return;
  }
};

export const getBroadcastHistory = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const { eventId } = req.params;

    // Verify event exists and user is organizer/admin
    const [event] = await db
      .select()
      .from(events)
      .where(eq(events.id, eventId))
      .limit(1);

    if (!event) {
      throw new AppError('Event not found', 404);
    }

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.id, req.user!.id))
      .limit(1);

    if (event.organizerId !== req.user!.id && profile?.role !== 'admin') {
      throw new AppError('Unauthorized: You are not the organizer of this event', 403);
    }

    // Get broadcast history
    const history = await db
      .select()
      .from(broadcastHistory)
      .where(eq(broadcastHistory.eventId, eventId))
      .orderBy(desc(broadcastHistory.sentAt))
      .limit(10);

    res.json(history);
    return;
  } catch (error) {
    next(error);
    return;
  }
};
