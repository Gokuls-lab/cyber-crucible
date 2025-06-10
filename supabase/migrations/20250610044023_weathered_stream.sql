/*
  # Add Subjects Table and Quiz Functionality

  1. New Tables
    - `subjects` - Subject categories for exams
    - `subject_exam_versions` - Junction table linking subjects to exam versions

  2. Updates
    - Add subject_id foreign key to questions table
    - Update existing data to include proper subject relationships

  3. Sample Data
    - Add sample subjects for CompTIA PenTest+
    - Link subjects to exam versions
    - Update questions with proper subject references
*/

-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id text PRIMARY KEY,
  name text NOT NULL,
  description text DEFAULT '',
  created_at timestamptz DEFAULT now()
);

-- Create junction table for subjects and exam versions
CREATE TABLE IF NOT EXISTS subject_exam_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  subject_id text REFERENCES subjects(id) ON DELETE CASCADE,
  exam_version_id uuid REFERENCES exam_versions(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(subject_id, exam_version_id)
);

-- Add subject_id to questions table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'questions' AND column_name = 'subject_id'
  ) THEN
    ALTER TABLE questions ADD COLUMN subject_id text REFERENCES subjects(id);
  END IF;
END $$;

-- Enable RLS on new tables
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_exam_versions ENABLE ROW LEVEL SECURITY;

-- Add policies for subjects (public read)
CREATE POLICY "Anyone can read subjects" ON subjects FOR SELECT TO authenticated USING (true);

-- Add policies for subject_exam_versions (public read)
CREATE POLICY "Anyone can read subject exam versions" ON subject_exam_versions FOR SELECT TO authenticated USING (true);

-- Insert sample subjects for CompTIA PenTest+
INSERT INTO subjects (id, name, description) VALUES
  ('planning-and-scoping', 'Planning and Scoping', 'Planning and scoping penetration testing engagements'),
  ('information-gathering', 'Information Gathering and Vulnerability Scanning', 'Reconnaissance and vulnerability assessment techniques'),
  ('attacks-and-exploits', 'Attacks and Exploits', 'Various attack vectors and exploitation techniques'),
  ('post-exploitation', 'Post-Exploitation Techniques', 'Activities performed after gaining initial access'),
  ('reporting-and-communication', 'Reporting and Communication', 'Documentation and communication of findings')
ON CONFLICT (id) DO NOTHING;

-- Link subjects to PenTest+ PT0-003 exam version
INSERT INTO subject_exam_versions (subject_id, exam_version_id) VALUES
  ('planning-and-scoping', '660e8400-e29b-41d4-a716-446655440001'),
  ('information-gathering', '660e8400-e29b-41d4-a716-446655440001'),
  ('attacks-and-exploits', '660e8400-e29b-41d4-a716-446655440001'),
  ('post-exploitation', '660e8400-e29b-41d4-a716-446655440001'),
  ('reporting-and-communication', '660e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (subject_id, exam_version_id) DO NOTHING;

-- Update existing questions with proper subject_id references
UPDATE questions SET subject_id = 'information-gathering' WHERE domain = 'Network Services';
UPDATE questions SET subject_id = 'attacks-and-exploits' WHERE domain = 'Cryptography';
UPDATE questions SET subject_id = 'planning-and-scoping' WHERE domain = 'Planning and Scoping';
UPDATE questions SET subject_id = 'information-gathering' WHERE domain = 'Vulnerability Assessment';
UPDATE questions SET subject_id = 'attacks-and-exploits' WHERE domain = 'Attacks and Exploits';

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_subject_exam_versions_subject_id ON subject_exam_versions(subject_id);
CREATE INDEX IF NOT EXISTS idx_subject_exam_versions_exam_version_id ON subject_exam_versions(exam_version_id);
CREATE INDEX IF NOT EXISTS idx_questions_subject_id ON questions(subject_id);