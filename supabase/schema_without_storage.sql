-- ============================================
-- NGEVENT DATABASE SCHEMA (WITHOUT STORAGE POLICIES)
-- Platform Manajemen Event Online
-- ============================================
-- This version excludes storage policies that require elevated privileges
-- Run this in Supabase SQL Editor
-- ============================================
-- ============================================
-- 1. PROFILES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    full_name TEXT,
    phone VARCHAR(20),
    institution VARCHAR(255),
    position VARCHAR(255),
    city VARCHAR(255),
    role TEXT CHECK (role IN ('participant', 'organizer')) DEFAULT 'participant',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- 2. EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organizer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    image_url TEXT,
    capacity INTEGER,
    registration_fee NUMERIC(10, 2) DEFAULT 0,
    status TEXT CHECK (
        status IN ('draft', 'published', 'cancelled', 'completed')
    ) DEFAULT 'draft',
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- 3. SPEAKERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.speakers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    title VARCHAR(255),
    company VARCHAR(255),
    bio TEXT,
    photo_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    website_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- 4. REGISTRATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    registration_data JSONB,
    status TEXT CHECK (
        status IN ('registered', 'attended', 'cancelled')
    ) DEFAULT 'registered',
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(event_id, user_id)
);
-- ============================================
-- 5. FORM_FIELDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.form_fields (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE NOT NULL,
    field_name TEXT NOT NULL,
    field_type TEXT NOT NULL,
    is_required BOOLEAN DEFAULT false,
    options JSONB,
    order_index INTEGER NOT NULL
);
-- ============================================
-- 6. NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    event_id UUID REFERENCES public.events(id) ON DELETE CASCADE,
    type TEXT CHECK (
        type IN (
            'registration',
            'event_update',
            'reminder',
            'general',
            'payment'
        )
    ) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- 7. EMAIL TEMPLATES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_type TEXT NOT NULL CHECK (
        template_type IN (
            'welcome',
            'registration_confirmation',
            'event_reminder',
            'event_update'
        )
    ),
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    variables JSONB,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(template_type)
);
-- ============================================
-- 8. EMAIL LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE
    SET NULL,
        email_type TEXT NOT NULL,
        recipient_email TEXT NOT NULL,
        subject TEXT NOT NULL,
        status TEXT CHECK (status IN ('pending', 'sent', 'failed')) DEFAULT 'pending',
        error_message TEXT,
        metadata JSONB,
        sent_at TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
-- ============================================
-- INDEXES FOR PERFORMANCE
-- ============================================
-- Profiles indexes
CREATE INDEX IF NOT EXISTS idx_profiles_phone ON public.profiles(phone);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
-- Events indexes
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events(organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_status ON public.events(status);
CREATE INDEX IF NOT EXISTS idx_events_start_date ON public.events(start_date);
CREATE INDEX IF NOT EXISTS idx_events_category ON public.events(category);
-- Speakers indexes
CREATE INDEX IF NOT EXISTS idx_speakers_event ON public.speakers(event_id);
-- Registrations indexes
CREATE INDEX IF NOT EXISTS idx_registrations_event ON public.registrations(event_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user ON public.registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_registrations_status ON public.registrations(status);
-- Form fields indexes
CREATE INDEX IF NOT EXISTS idx_form_fields_event ON public.form_fields(event_id);
-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON public.notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, read);
-- Email logs indexes
CREATE INDEX IF NOT EXISTS idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON public.email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON public.email_logs(created_at DESC);
-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.speakers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.form_fields ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
-- ============================================
-- PROFILES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR
SELECT USING (true);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR
INSERT WITH CHECK (
        (
            SELECT auth.uid()
        ) = id
    );
CREATE POLICY "Users can update their own profile" ON public.profiles FOR
UPDATE USING (
        (
            SELECT auth.uid()
        ) = id
    );
-- ============================================
-- EVENTS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Published events are viewable by everyone" ON public.events;
DROP POLICY IF EXISTS "Organizers can create events" ON public.events;
DROP POLICY IF EXISTS "Organizers can update their own events" ON public.events;
DROP POLICY IF EXISTS "Organizers can delete their own events" ON public.events;
CREATE POLICY "Published events are viewable by everyone" ON public.events FOR
SELECT USING (
        status = 'published'
        OR organizer_id = (
            SELECT auth.uid()
        )
    );
CREATE POLICY "Organizers can create events" ON public.events FOR
INSERT WITH CHECK (
        (
            SELECT auth.uid()
        ) = organizer_id
    );
CREATE POLICY "Organizers can update their own events" ON public.events FOR
UPDATE USING (
        (
            SELECT auth.uid()
        ) = organizer_id
    );
CREATE POLICY "Organizers can delete their own events" ON public.events FOR DELETE USING (
    (
        SELECT auth.uid()
    ) = organizer_id
);
-- ============================================
-- SPEAKERS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Speakers are viewable by everyone" ON public.speakers;
DROP POLICY IF EXISTS "Organizers can manage their event speakers" ON public.speakers;
CREATE POLICY "Speakers are viewable by everyone" ON public.speakers FOR
SELECT USING (true);
CREATE POLICY "Organizers can manage their event speakers" ON public.speakers FOR ALL USING (
    event_id IN (
        SELECT id
        FROM public.events
        WHERE organizer_id = (
                SELECT auth.uid()
            )
    )
);
-- ============================================
-- REGISTRATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Users can register for events" ON public.registrations;
DROP POLICY IF EXISTS "Users can update their own registrations" ON public.registrations;
DROP POLICY IF EXISTS "Organizers can update registrations for their events" ON public.registrations;
CREATE POLICY "Users can view their own registrations" ON public.registrations FOR
SELECT USING (
        (
            SELECT auth.uid()
        ) = user_id
        OR (
            SELECT auth.uid()
        ) IN (
            SELECT organizer_id
            FROM public.events
            WHERE id = event_id
        )
    );
CREATE POLICY "Users can register for events" ON public.registrations FOR
INSERT WITH CHECK (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "Users can update their own registrations" ON public.registrations FOR
UPDATE USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "Organizers can update registrations for their events" ON public.registrations FOR
UPDATE USING (
        (
            SELECT auth.uid()
        ) IN (
            SELECT organizer_id
            FROM public.events
            WHERE id = event_id
        )
    );
-- ============================================
-- FORM_FIELDS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Form fields are viewable by everyone" ON public.form_fields;
DROP POLICY IF EXISTS "Organizers can create form fields for their events" ON public.form_fields;
DROP POLICY IF EXISTS "Organizers can update form fields for their events" ON public.form_fields;
DROP POLICY IF EXISTS "Organizers can delete form fields for their events" ON public.form_fields;
CREATE POLICY "Form fields are viewable by everyone" ON public.form_fields FOR
SELECT USING (true);
CREATE POLICY "Organizers can create form fields for their events" ON public.form_fields FOR
INSERT WITH CHECK (
        (
            SELECT auth.uid()
        ) IN (
            SELECT organizer_id
            FROM public.events
            WHERE id = event_id
        )
    );
CREATE POLICY "Organizers can update form fields for their events" ON public.form_fields FOR
UPDATE USING (
        (
            SELECT auth.uid()
        ) IN (
            SELECT organizer_id
            FROM public.events
            WHERE id = event_id
        )
    );
CREATE POLICY "Organizers can delete form fields for their events" ON public.form_fields FOR DELETE USING (
    (
        SELECT auth.uid()
    ) IN (
        SELECT organizer_id
        FROM public.events
        WHERE id = event_id
    )
);
-- ============================================
-- NOTIFICATIONS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Authenticated users can create notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;
CREATE POLICY "Users can view own notifications" ON public.notifications FOR
SELECT USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "Users can update own notifications" ON public.notifications FOR
UPDATE USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "Authenticated users can create notifications" ON public.notifications FOR
INSERT WITH CHECK (
        (
            SELECT auth.uid()
        ) IS NOT NULL
    );
CREATE POLICY "Users can delete own notifications" ON public.notifications FOR DELETE USING (
    (
        SELECT auth.uid()
    ) = user_id
);
-- ============================================
-- EMAIL_TEMPLATES POLICIES
-- ============================================
DROP POLICY IF EXISTS "Anyone can read email templates" ON public.email_templates;
DROP POLICY IF EXISTS "Service role can modify templates" ON public.email_templates;
CREATE POLICY "Anyone can read email templates" ON public.email_templates FOR
SELECT USING (active = true);
CREATE POLICY "Service role can modify templates" ON public.email_templates FOR ALL USING (
    (
        SELECT auth.role()
    ) = 'service_role'
);
-- ============================================
-- EMAIL_LOGS POLICIES
-- ============================================
DROP POLICY IF EXISTS "Users can view own email logs" ON public.email_logs;
DROP POLICY IF EXISTS "Service role can manage email logs" ON public.email_logs;
CREATE POLICY "Users can view own email logs" ON public.email_logs FOR
SELECT USING (
        (
            SELECT auth.uid()
        ) = user_id
    );
CREATE POLICY "Service role can manage email logs" ON public.email_logs FOR ALL USING (
    (
        SELECT auth.role()
    ) = 'service_role'
);
-- ============================================
-- FUNCTIONS AND TRIGGERS
-- ============================================
-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user() RETURNS TRIGGER AS $$ BEGIN
INSERT INTO public.profiles (id, full_name, avatar_url)
VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.raw_user_meta_data->>'avatar_url'
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger for new user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER
INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = NOW();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
-- Trigger to update updated_at on events
DROP TRIGGER IF EXISTS update_events_updated_at ON public.events;
CREATE TRIGGER update_events_updated_at BEFORE
UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Trigger to update updated_at on speakers
DROP TRIGGER IF EXISTS update_speakers_updated_at ON public.speakers;
CREATE TRIGGER update_speakers_updated_at BEFORE
UPDATE ON public.speakers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
-- Function to auto-create notifications when registration is created
CREATE OR REPLACE FUNCTION create_registration_notification() RETURNS TRIGGER AS $$
DECLARE event_record RECORD;
organizer_id UUID;
BEGIN -- Get event data and organizer
SELECT e.id,
    e.title,
    e.organizer_id INTO event_record
FROM public.events e
WHERE e.id = NEW.event_id;
-- Create notification for organizer
INSERT INTO public.notifications (user_id, event_id, type, title, message)
VALUES (
        event_record.organizer_id,
        NEW.event_id,
        'registration',
        'New Registration',
        'Someone just registered for your event "' || event_record.title || '"'
    );
-- Create notification for participant
INSERT INTO public.notifications (user_id, event_id, type, title, message)
VALUES (
        NEW.user_id,
        NEW.event_id,
        'registration',
        'Registration Confirmed',
        'You have successfully registered for "' || event_record.title || '"'
    );
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger for registration notifications
DROP TRIGGER IF EXISTS on_registration_created ON public.registrations;
CREATE TRIGGER on_registration_created
AFTER
INSERT ON public.registrations FOR EACH ROW EXECUTE FUNCTION create_registration_notification();
-- Function to auto-create notifications when event is updated
CREATE OR REPLACE FUNCTION create_event_update_notification() RETURNS TRIGGER AS $$
DECLARE participant_record RECORD;
BEGIN -- Skip if event is newly created (not an update)
IF TG_OP = 'INSERT' THEN RETURN NEW;
END IF;
-- Skip if no important changes
IF OLD.title = NEW.title
AND OLD.start_date = NEW.start_date
AND OLD.end_date = NEW.end_date
AND OLD.location = NEW.location
AND OLD.status = NEW.status THEN RETURN NEW;
END IF;
-- Create notifications for all registered participants
FOR participant_record IN
SELECT user_id
FROM public.registrations
WHERE event_id = NEW.id LOOP
INSERT INTO public.notifications (user_id, event_id, type, title, message)
VALUES (
        participant_record.user_id,
        NEW.id,
        'event_update',
        'Event Updated',
        'The event "' || NEW.title || '" has been updated by the organizer'
    );
END LOOP;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger for event update notifications
DROP TRIGGER IF EXISTS on_event_updated ON public.events;
CREATE TRIGGER on_event_updated
AFTER
UPDATE ON public.events FOR EACH ROW EXECUTE FUNCTION create_event_update_notification();
-- Function to create event reminders (should be called by cron)
CREATE OR REPLACE FUNCTION create_event_reminders() RETURNS void AS $$
DECLARE event_record RECORD;
participant_record RECORD;
BEGIN -- Find events starting within 24 hours
FOR event_record IN
SELECT id,
    title,
    start_date,
    organizer_id
FROM public.events
WHERE start_date BETWEEN NOW()
    AND NOW() + INTERVAL '24 hours'
    AND status = 'published' LOOP -- Reminder for organizer
INSERT INTO public.notifications (user_id, event_id, type, title, message)
VALUES (
        event_record.organizer_id,
        event_record.id,
        'reminder',
        'Event Starting Soon',
        'Your event "' || event_record.title || '" will start in less than 24 hours'
    ) ON CONFLICT DO NOTHING;
-- Reminder for all participants
FOR participant_record IN
SELECT user_id
FROM public.registrations
WHERE event_id = event_record.id LOOP
INSERT INTO public.notifications (user_id, event_id, type, title, message)
VALUES (
        participant_record.user_id,
        event_record.id,
        'reminder',
        'Event Reminder',
        'The event "' || event_record.title || '" will start soon!'
    ) ON CONFLICT DO NOTHING;
END LOOP;
END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to cleanup old notifications
CREATE OR REPLACE FUNCTION cleanup_old_notifications() RETURNS void AS $$ BEGIN
DELETE FROM public.notifications
WHERE created_at < NOW() - INTERVAL '30 days'
    AND read = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Function to send welcome email (requires pg_net extension)
CREATE OR REPLACE FUNCTION send_welcome_email() RETURNS TRIGGER AS $$
DECLARE user_email TEXT;
user_name TEXT;
webhook_url TEXT;
service_key TEXT;
BEGIN -- Get webhook URL and service key
webhook_url := current_setting('app.settings.webhook_url', true);
service_key := current_setting('app.settings.service_role_key', true);
-- Skip if webhook URL is not configured
IF webhook_url IS NULL
OR webhook_url = '' THEN RAISE NOTICE 'Email webhook not configured, skipping welcome email for user %',
NEW.id;
RETURN NEW;
END IF;
-- Get user email from auth.users
SELECT email INTO user_email
FROM auth.users
WHERE id = NEW.id;
-- Get user name from profile
user_name := COALESCE(NEW.full_name, split_part(user_email, '@', 1));
-- Send email using pg_net extension
BEGIN PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
        'Content-Type',
        'application/json',
        'Authorization',
        'Bearer ' || COALESCE(service_key, '')
    ),
    body := jsonb_build_object(
        'type',
        'welcome_email',
        'user_id',
        NEW.id,
        'email',
        user_email,
        'name',
        user_name,
        'timestamp',
        NOW()
    )
);
EXCEPTION
WHEN OTHERS THEN RAISE WARNING 'Failed to send welcome email for user %: %',
NEW.id,
SQLERRM;
END;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger for welcome email
DROP TRIGGER IF EXISTS on_profile_created_send_welcome_email ON public.profiles;
CREATE TRIGGER on_profile_created_send_welcome_email
AFTER
INSERT ON public.profiles FOR EACH ROW EXECUTE FUNCTION send_welcome_email();
-- Function to send registration confirmation email
CREATE OR REPLACE FUNCTION send_registration_confirmation_email() RETURNS TRIGGER AS $$
DECLARE user_email TEXT;
user_name TEXT;
event_title TEXT;
event_date TIMESTAMP WITH TIME ZONE;
event_location TEXT;
organizer_name TEXT;
webhook_url TEXT;
service_key TEXT;
BEGIN -- Get webhook URL and service key
webhook_url := current_setting('app.settings.webhook_url', true);
service_key := current_setting('app.settings.service_role_key', true);
-- Skip if webhook URL is not configured
IF webhook_url IS NULL
OR webhook_url = '' THEN RAISE NOTICE 'Email webhook not configured, skipping registration confirmation for registration %',
NEW.id;
RETURN NEW;
END IF;
-- Get user details
SELECT u.email,
    p.full_name INTO user_email,
    user_name
FROM auth.users u
    LEFT JOIN public.profiles p ON p.id = u.id
WHERE u.id = NEW.user_id;
-- Get event details
SELECT e.title,
    e.start_date,
    e.location,
    po.full_name INTO event_title,
    event_date,
    event_location,
    organizer_name
FROM public.events e
    LEFT JOIN public.profiles po ON po.id = e.organizer_id
WHERE e.id = NEW.event_id;
-- Send confirmation email
BEGIN PERFORM net.http_post(
    url := webhook_url,
    headers := jsonb_build_object(
        'Content-Type',
        'application/json',
        'Authorization',
        'Bearer ' || COALESCE(service_key, '')
    ),
    body := jsonb_build_object(
        'type',
        'registration_confirmation',
        'user_id',
        NEW.user_id,
        'email',
        user_email,
        'user_name',
        COALESCE(user_name, split_part(user_email, '@', 1)),
        'event_id',
        NEW.event_id,
        'event_title',
        event_title,
        'event_date',
        event_date,
        'event_location',
        COALESCE(event_location, 'TBA'),
        'organizer_name',
        COALESCE(organizer_name, 'Event Organizer'),
        'registration_id',
        NEW.id,
        'registered_at',
        NEW.registered_at,
        'timestamp',
        NOW()
    )
);
EXCEPTION
WHEN OTHERS THEN RAISE WARNING 'Failed to send registration confirmation for registration %: %',
NEW.id,
SQLERRM;
END;
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
-- Trigger for registration confirmation email
DROP TRIGGER IF EXISTS on_registration_created_send_email ON public.registrations;
CREATE TRIGGER on_registration_created_send_email
AFTER
INSERT ON public.registrations FOR EACH ROW EXECUTE FUNCTION send_registration_confirmation_email();
-- ============================================
-- INSERT DEFAULT EMAIL TEMPLATES
-- ============================================
INSERT INTO public.email_templates (
        template_type,
        subject,
        html_body,
        text_body,
        variables
    )
VALUES (
        'welcome',
        'Welcome to NGEvent! 🎉',
        '<html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Welcome to NGEvent!</h1>
            <p>Hi {{user_name}},</p>
            <p>Thank you for joining NGEvent! We''re excited to have you as part of our community.</p>
            <p>With NGEvent, you can:</p>
            <ul>
                <li>Discover amazing events</li>
                <li>Register for events easily</li>
                <li>Organize your own events</li>
                <li>Connect with other participants</li>
            </ul>
            <p>Get started by exploring our upcoming events:</p>
            <a href="{{base_url}}/events" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">Browse Events</a>
            <p>If you have any questions, feel free to reach out to our support team.</p>
            <p>Best regards,<br>The NGEvent Team</p>
        </body>
    </html>',
        'Welcome to NGEvent! Thank you for joining us. Start exploring events at {{base_url}}/events',
        '{"user_name": "User full name", "base_url": "Application base URL"}'
    ),
    (
        'registration_confirmation',
        'Event Registration Confirmed: {{event_title}}',
        '<html>
        <body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h1 style="color: #4F46E5;">Registration Confirmed! ✅</h1>
            <p>Hi {{user_name}},</p>
            <p>Your registration for <strong>{{event_title}}</strong> has been confirmed!</p>
            <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h2 style="margin-top: 0; color: #1F2937;">Event Details:</h2>
                <p><strong>📅 Date:</strong> {{event_date}}</p>
                <p><strong>📍 Location:</strong> {{event_location}}</p>
                <p><strong>👤 Organizer:</strong> {{organizer_name}}</p>
            </div>
            <p>We''re looking forward to seeing you there!</p>
            <a href="{{base_url}}/events/{{event_id}}" style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">View Event Details</a>
            <p>If you need to make any changes to your registration, please visit your dashboard.</p>
            <p>Best regards,<br>The NGEvent Team</p>
        </body>
    </html>',
        'Registration Confirmed! You are registered for {{event_title}} on {{event_date}} at {{event_location}}. View details: {{base_url}}/events/{{event_id}}',
        '{"user_name": "User full name", "event_title": "Event title", "event_date": "Event date", "event_location": "Event location", "organizer_name": "Organizer name", "event_id": "Event ID", "base_url": "Application base URL"}'
    ) ON CONFLICT (template_type) DO
UPDATE
SET subject = EXCLUDED.subject,
    html_body = EXCLUDED.html_body,
    text_body = EXCLUDED.text_body,
    variables = EXCLUDED.variables,
    updated_at = NOW();
-- ============================================
-- GRANT PERMISSIONS
-- ============================================
GRANT ALL ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.events TO authenticated;
GRANT ALL ON public.events TO service_role;
GRANT ALL ON public.speakers TO authenticated;
GRANT ALL ON public.speakers TO service_role;
GRANT ALL ON public.registrations TO authenticated;
GRANT ALL ON public.registrations TO service_role;
GRANT ALL ON public.form_fields TO authenticated;
GRANT ALL ON public.form_fields TO service_role;
GRANT ALL ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
GRANT ALL ON public.email_templates TO authenticated;
GRANT ALL ON public.email_templates TO service_role;
GRANT ALL ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;
-- ============================================
-- DOCUMENTATION
-- ============================================
COMMENT ON TABLE public.profiles IS 'User profiles with additional information beyond auth.users';
COMMENT ON TABLE public.events IS 'Events created by organizers with all event details';
COMMENT ON TABLE public.speakers IS 'Speakers associated with events';
COMMENT ON TABLE public.registrations IS 'User registrations for events with custom form data';
COMMENT ON TABLE public.form_fields IS 'Custom registration form fields defined by event organizers';
COMMENT ON TABLE public.notifications IS 'Stores user notifications for events, registrations, and updates';
COMMENT ON TABLE public.email_templates IS 'Email templates for automated notifications';
COMMENT ON TABLE public.email_logs IS 'Log of all emails sent by the system';
COMMENT ON FUNCTION create_registration_notification() IS 'Auto-creates notifications when a new registration is made';
COMMENT ON FUNCTION create_event_update_notification() IS 'Auto-creates notifications when an event is updated';
COMMENT ON FUNCTION create_event_reminders() IS 'Creates reminder notifications for upcoming events (should be called by cron)';
COMMENT ON FUNCTION cleanup_old_notifications() IS 'Deletes old read notifications to keep table clean';
COMMENT ON FUNCTION send_welcome_email() IS 'Sends welcome email when new profile is created';
COMMENT ON FUNCTION send_registration_confirmation_email() IS 'Sends confirmation email when user registers for an event';
-- ============================================
-- VERIFICATION
-- ============================================
DO $$
DECLARE policy_count INTEGER;
BEGIN
SELECT COUNT(*) INTO policy_count
FROM pg_policies
WHERE schemaname = 'public';
RAISE NOTICE '✅ Schema Setup Complete!';
RAISE NOTICE 'Total RLS policies created: %',
policy_count;
RAISE NOTICE 'All tables, indexes, functions, and triggers have been created successfully.';
RAISE NOTICE '';
RAISE NOTICE '⚠️  IMPORTANT: Storage policies need to be configured separately in Supabase Dashboard.';
RAISE NOTICE 'Go to Storage > Policies to set up the "events" bucket policies.';
END $$;