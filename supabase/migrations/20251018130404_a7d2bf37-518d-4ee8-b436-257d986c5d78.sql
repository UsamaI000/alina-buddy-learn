-- Create event_type enum
CREATE TYPE event_type AS ENUM ('exam', 'training', 'meeting', 'other');

-- Add event_type column to events table
ALTER TABLE public.events
ADD COLUMN event_type event_type DEFAULT 'other';

-- Add indexes for better query performance
CREATE INDEX idx_events_event_type ON public.events(event_type);
CREATE INDEX idx_events_start_time ON public.events(start_time);