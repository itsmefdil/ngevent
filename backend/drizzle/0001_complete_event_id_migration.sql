-- Migration: Fix all event_id foreign keys to varchar(6)
-- WARNING: This will DELETE ALL EXISTING EVENT DATA
-- Only run this on development database or after backing up production data

BEGIN;

-- Step 1: Delete all existing data (CASCADE will handle related records)
DELETE FROM "events";

-- Step 2: Drop all foreign key constraints related to event_id
ALTER TABLE "form_fields" DROP CONSTRAINT IF EXISTS "form_fields_event_id_events_id_fk";
ALTER TABLE "notifications" DROP CONSTRAINT IF EXISTS "notifications_event_id_events_id_fk";
ALTER TABLE "registrations" DROP CONSTRAINT IF EXISTS "registrations_event_id_events_id_fk";
ALTER TABLE "speakers" DROP CONSTRAINT IF EXISTS "speakers_event_id_events_id_fk";

-- Step 3: Alter all column types to varchar(6)
ALTER TABLE "events" ALTER COLUMN "id" SET DATA TYPE varchar(6);
ALTER TABLE "events" ALTER COLUMN "id" DROP DEFAULT;

ALTER TABLE "form_fields" ALTER COLUMN "event_id" SET DATA TYPE varchar(6);
ALTER TABLE "notifications" ALTER COLUMN "event_id" SET DATA TYPE varchar(6);
ALTER TABLE "registrations" ALTER COLUMN "event_id" SET DATA TYPE varchar(6);
ALTER TABLE "speakers" ALTER COLUMN "event_id" SET DATA TYPE varchar(6);

-- Step 4: Recreate foreign key constraints
ALTER TABLE "form_fields" 
  ADD CONSTRAINT "form_fields_event_id_events_id_fk" 
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;

ALTER TABLE "notifications" 
  ADD CONSTRAINT "notifications_event_id_events_id_fk" 
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;

ALTER TABLE "registrations" 
  ADD CONSTRAINT "registrations_event_id_events_id_fk" 
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;

ALTER TABLE "speakers" 
  ADD CONSTRAINT "speakers_event_id_events_id_fk" 
  FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE;

COMMIT;
