# PostIt Notes App

A digital sticky notes application built with Next.js, TypeScript, and Supabase. This app allows users to create, edit, and organize sticky notes on a virtual board.

## Features

- 🔐 User authentication with Supabase Auth
- 📝 Create, edit, and delete sticky notes
- 🎨 Customize note colors
- 📌 Drag and drop interface
- 🔄 Zoom and pan controls
- 📋 Multiple boards support
- 🔄 Real-time synchronization with Supabase
- 📱 Responsive design

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/en/) (v16 or newer)
- [Supabase Account](https://supabase.com/)

### Supabase Setup

1. Create a new Supabase project
2. Run the following SQL in the Supabase SQL editor to create the necessary tables:

```sql
-- Create tables for the PostIt Notes App

-- Boards table (create first for referencing)
CREATE TABLE public.boards (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    state JSONB NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Notes table
CREATE TABLE public.notes (
    id BIGINT PRIMARY KEY,
    text TEXT NOT NULL,
    x FLOAT NOT NULL,
    y FLOAT NOT NULL,
    color TEXT NOT NULL,
    board_id TEXT NOT NULL REFERENCES public.boards(id) ON DELETE CASCADE,
    group_id TEXT,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Set up row level security
ALTER TABLE public.notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.boards ENABLE ROW LEVEL SECURITY;

-- Create policies for notes
CREATE POLICY "Users can view their own notes" ON public.notes
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own notes" ON public.notes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own notes" ON public.notes
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notes" ON public.notes
    FOR DELETE USING (auth.uid() = user_id);

-- Create policies for boards
CREATE POLICY "Users can view their own boards" ON public.boards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own boards" ON public.boards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own boards" ON public.boards
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own boards" ON public.boards
    FOR DELETE USING (auth.uid() = user_id);
```

3. If you're upgrading an existing database, you can run the migration script from the `database/migration.sql` file to add the necessary foreign key constraints.

4. Set up email authentication in the Supabase Authentication settings

### Local Development Setup

1. Clone the repository:

```bash
git clone https://github.com/yourusername/postit-notes-app.git
cd postit-notes-app
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env.local` file with your Supabase credentials:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-url.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

4. Run the development server:

```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Built With

- [Next.js](https://nextjs.org/) - React framework
- [TypeScript](https://www.typescriptlang.org/) - Static type checking
- [Supabase](https://supabase.com/) - Backend and database
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework

## License

This project is licensed under the MIT License

## Acknowledgments

- Inspired by traditional sticky notes and digital productivity tools
- Thanks to the Next.js, React, and Supabase communities for their great documentation
