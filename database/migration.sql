-- Migration script for PostIt Notes App
-- This script adds or updates foreign key constraints for multi-user support

-- First, check if tables exist and create them if needed
DO $$
BEGIN
    -- Check if boards table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'boards') THEN
        -- Create boards table
        CREATE TABLE public.boards (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            state JSONB NOT NULL,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
    END IF;

    -- Check if notes table exists
    IF NOT EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notes') THEN
        -- Create notes table
        CREATE TABLE public.notes (
            id BIGINT PRIMARY KEY,
            text TEXT NOT NULL,
            x FLOAT NOT NULL,
            y FLOAT NOT NULL,
            color TEXT NOT NULL,
            board_id TEXT NOT NULL,
            group_id TEXT,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
        );
    END IF;
END
$$;

-- Check and add foreign key constraint if it doesn't exist
DO $$
BEGIN
    -- Check if foreign key constraint already exists
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'notes_board_id_fkey' AND table_name = 'notes'
    ) THEN
        -- Add constraint
        ALTER TABLE public.notes
        ADD CONSTRAINT notes_board_id_fkey
        FOREIGN KEY (board_id) REFERENCES public.boards(id) ON DELETE CASCADE;
    END IF;
END
$$;

-- Enable Row Level Security if not already enabled
DO $$
BEGIN
    -- Enable RLS on boards table
    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'boards'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;
    END IF;

    -- Enable RLS on notes table
    IF NOT EXISTS (
        SELECT 1
        FROM pg_tables
        WHERE schemaname = 'public'
        AND tablename = 'notes'
        AND rowsecurity = true
    ) THEN
        ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
    END IF;
END
$$;

-- Create or replace RLS policies
-- For boards table
DROP POLICY IF EXISTS "Users can view their own boards" ON public.boards;
CREATE POLICY "Users can view their own boards" ON public.boards
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own boards" ON public.boards;
CREATE POLICY "Users can create their own boards" ON public.boards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own boards" ON public.boards;
CREATE POLICY "Users can update their own boards" ON public.boards
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own boards" ON public.boards;
CREATE POLICY "Users can delete their own boards" ON public.boards
    FOR DELETE USING (auth.uid() = user_id);

-- For notes table
DROP POLICY IF EXISTS "Users can view their own notes" ON public.notes;
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own notes" ON public.notes;
CREATE POLICY "Users can create their own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own notes" ON public.notes;
CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own notes" ON public.notes;
CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);