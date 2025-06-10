/*
  # Complete Database Schema for The Cyber Crucible

  1. New Tables
    - `users` - User profiles with subscription status
    - `exams` - Available certification exams
    - `exam_versions` - Different versions of exams
    - `questions` - Exam questions with metadata
    - `question_options` - Multiple choice options for questions
    - `user_progress` - User study progress per exam
    - `quiz_sessions` - Completed quiz sessions with scores
    - `user_answers` - Individual user answers to questions
    - `daily_questions` - Daily question assignments

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to access their data
    - Public read access for exam catalogs and questions

  3. Features
    - Complete exam catalog with multiple versions
    - Question bank with explanations and difficulty levels
    - Progress tracking and streak counting
    - Quiz session management
    - Daily question system
*/

-- Users table for profiles
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text DEFAULT '',
  avatar_url text,
  subscription_status text DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  short_name text NOT NULL,
  description text DEFAULT '',
  category text NOT NULL,
  total_questions integer DEFAULT 0,
  passing_score integer DEFAULT 70,
  duration_minutes integer DEFAULT 90,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now()
);

-- Exam versions table
CREATE TABLE IF NOT EXISTS exam_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_id uuid REFERENCES exams(id) ON DELETE CASCADE,
  version_code text NOT NULL,
  version_name text NOT NULL,
  description text DEFAULT '',
  is_current boolean DEFAULT false,
  launch_date timestamptz DEFAULT now(),
  discontinue_date timestamptz,
  created_at timestamptz DEFAULT now()
);

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  exam_version_id uuid REFERENCES exam_versions(id) ON DELETE CASCADE,
  question_text text NOT NULL,
  question_type text DEFAULT 'multiple_choice' CHECK (question_type IN ('multiple_choice', 'true_false')),
  explanation text DEFAULT '',
  difficulty text DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
  domain text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Question options table
CREATE TABLE IF NOT EXISTS question_options (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  option_text text NOT NULL,
  option_letter text NOT NULL,
  is_correct boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- User progress table
CREATE TABLE IF NOT EXISTS user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  exam_version_id uuid REFERENCES exam_versions(id) ON DELETE CASCADE,
  questions_answered integer DEFAULT 0,
  questions_correct integer DEFAULT 0,
  last_studied timestamptz DEFAULT now(),
  study_streak integer DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(user_id, exam_version_id)
);

-- Add unique constraint to user_progress
ALTER TABLE public.user_progress ADD CONSTRAINT user_progress_user_id_exam_version_id_key UNIQUE (user_id, exam_version_id);

-- Quiz sessions table
CREATE TABLE IF NOT EXISTS quiz_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  exam_version_id uuid REFERENCES exam_versions(id) ON DELETE CASCADE,
  quiz_type text NOT NULL CHECK (quiz_type IN ('daily', 'quick_10', 'timed', 'level_up', 'missed', 'weakest', 'custom')),
  score integer DEFAULT 0,
  total_questions integer DEFAULT 0,
  time_taken_seconds integer DEFAULT 0,
  completed_at timestamptz DEFAULT now(),
  created_at timestamptz DEFAULT now()
);

-- User answers table
CREATE TABLE IF NOT EXISTS user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  selected_option_id uuid REFERENCES question_options(id) ON DELETE CASCADE,
  is_correct boolean DEFAULT false,
  quiz_session_id uuid REFERENCES quiz_sessions(id) ON DELETE SET NULL,
  answered_at timestamptz DEFAULT now()
);

-- Daily questions table
CREATE TABLE IF NOT EXISTS daily_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES questions(id) ON DELETE CASCADE,
  date_assigned date DEFAULT CURRENT_DATE,
  exam_version_id uuid REFERENCES exam_versions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(date_assigned, exam_version_id)
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE question_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_questions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile" ON users FOR SELECT TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE TO authenticated USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON users FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

-- Public read access for exams and exam versions
CREATE POLICY "Anyone can read exams" ON exams FOR SELECT TO authenticated USING (is_active = true);
CREATE POLICY "Anyone can read exam versions" ON exam_versions FOR SELECT TO authenticated USING (true);

-- Public read access for questions and options
CREATE POLICY "Anyone can read questions" ON questions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can read question options" ON question_options FOR SELECT TO authenticated USING (true);

-- Users can manage their own progress
CREATE POLICY "Users can manage own progress" ON user_progress FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can manage their own quiz sessions
CREATE POLICY "Users can manage own quiz sessions" ON quiz_sessions FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Users can manage their own answers
CREATE POLICY "Users can manage own answers" ON user_answers FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Anyone can read daily questions
CREATE POLICY "Anyone can read daily questions" ON daily_questions FOR SELECT TO authenticated USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_exam_versions_exam_id ON exam_versions(exam_id);
CREATE INDEX IF NOT EXISTS idx_questions_exam_version_id ON questions(exam_version_id);
CREATE INDEX IF NOT EXISTS idx_question_options_question_id ON question_options(question_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_sessions_user_id ON quiz_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_questions_date ON daily_questions(date_assigned);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updating timestamps
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_progress_updated_at ON user_progress;
CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON user_progress FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();