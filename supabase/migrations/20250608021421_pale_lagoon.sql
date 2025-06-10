/*
  # Sample Data for The Cyber Crucible

  1. Sample Exams
    - CompTIA PenTest+ with multiple versions
    - CompTIA Security+ 
    - Cisco CCNA

  2. Sample Questions
    - Multiple choice questions with explanations
    - Different difficulty levels and domains

  3. Daily Questions
    - Pre-assigned daily questions for testing
*/

-- Insert sample exams
INSERT INTO exams (id, title, short_name, description, category, total_questions, passing_score, duration_minutes) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'CompTIA® PenTest+', 'PenTest+', 'Certified Penetration Tester', 'CompTIA', 1000, 750, 165),
  ('550e8400-e29b-41d4-a716-446655440002', 'CompTIA® Security+', 'Security+', 'IT Security and Cybersecurity', 'CompTIA', 1000, 750, 90),
  ('550e8400-e29b-41d4-a716-446655440003', 'Cisco CCNA', 'CCNA', 'Cisco Certified Network Associate', 'Cisco', 500, 825, 120)
ON CONFLICT (id) DO NOTHING;

-- Insert exam versions
INSERT INTO exam_versions (id, exam_id, version_code, version_name, description, is_current, launch_date, discontinue_date) VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440001', 'PT0-003', '2.2.1: New Version', 'This exam version is based on the CompTIA® PenTest+ Certification Exam Objectives (PT0-003), launched December 17, 2024.', true, '2024-12-17', null),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440001', 'PT0-002', '1.1.1', 'CompTIA® launched PT0-003 on December 17, 2024, and will retire this version, PT0-002, on June 17, 2025.', false, '2021-04-15', '2025-06-17'),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 'SY0-701', '7.0.1: Current Version', 'Current CompTIA Security+ certification exam objectives', true, '2023-11-07', null),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440003', '200-301', 'Current CCNA', 'Current Cisco CCNA certification exam', true, '2024-01-01', null)
ON CONFLICT (id) DO NOTHING;

-- Insert sample questions for PenTest+ PT0-003
INSERT INTO questions (id, exam_version_id, question_text, question_type, explanation, difficulty, domain) VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'Similar to RDP and VNC services on Windows, Linux, and MAC, Apple Remote Desktop is remote managing software. Which port does it usually listen to?', 'multiple_choice', 'Apple Remote Desktop typically uses port 3283/tcp for remote management connections. This is different from RDP (3389/tcp), SSH (22/tcp), and HTTPS (443/tcp).', 'medium', 'Network Services'),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'Which of the following is the BEST method for ensuring data confidentiality during transmission?', 'multiple_choice', 'Encryption transforms data into an unreadable format that can only be decrypted with the proper key, ensuring confidentiality. Hashing is used for integrity verification, not confidentiality.', 'medium', 'Cryptography'),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'What is the primary purpose of reconnaissance in penetration testing?', 'multiple_choice', 'Reconnaissance is the initial phase of penetration testing focused on gathering information about the target system, network, or organization to identify potential attack vectors.', 'easy', 'Planning and Scoping'),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'Which tool is commonly used for vulnerability scanning?', 'multiple_choice', 'Nessus is a popular vulnerability scanner used to identify security vulnerabilities in systems and networks. Wireshark is a network protocol analyzer, Metasploit is an exploitation framework, and John the Ripper is a password cracking tool.', 'medium', 'Vulnerability Assessment'),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'What does SQL injection primarily target?', 'multiple_choice', 'SQL injection attacks target database-driven applications by inserting malicious SQL code into application queries, potentially allowing attackers to access, modify, or delete database information.', 'hard', 'Attacks and Exploits')
ON CONFLICT (id) DO NOTHING;

-- Insert question options for the Apple Remote Desktop question
INSERT INTO question_options (id, question_id, option_text, option_letter, is_correct) VALUES
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', '3283/tcp', 'A', true),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', '3389/tcp', 'B', false),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', '22/tcp', 'C', false),
  ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', '443/tcp', 'D', false)
ON CONFLICT (id) DO NOTHING;

-- Insert question options for data confidentiality question
INSERT INTO question_options (id, question_id, option_text, option_letter, is_correct) VALUES
  ('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'Encryption', 'A', true),
  ('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', 'Hashing', 'B', false),
  ('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', 'Digital signatures', 'C', false),
  ('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440002', 'Compression', 'D', false)
ON CONFLICT (id) DO NOTHING;

-- Insert question options for reconnaissance question
INSERT INTO question_options (id, question_id, option_text, option_letter, is_correct) VALUES
  ('880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440003', 'Gathering information about the target', 'A', true),
  ('880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440003', 'Exploiting vulnerabilities', 'B', false),
  ('880e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440003', 'Installing backdoors', 'C', false),
  ('880e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440003', 'Covering tracks', 'D', false)
ON CONFLICT (id) DO NOTHING;

-- Insert question options for vulnerability scanning question
INSERT INTO question_options (id, question_id, option_text, option_letter, is_correct) VALUES
  ('880e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440004', 'Nessus', 'A', true),
  ('880e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440004', 'Wireshark', 'B', false),
  ('880e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440004', 'Metasploit', 'C', false),
  ('880e8400-e29b-41d4-a716-446655440016', '770e8400-e29b-41d4-a716-446655440004', 'John the Ripper', 'D', false)
ON CONFLICT (id) DO NOTHING;

-- Insert question options for SQL injection question
INSERT INTO question_options (id, question_id, option_text, option_letter, is_correct) VALUES
  ('880e8400-e29b-41d4-a716-446655440017', '770e8400-e29b-41d4-a716-446655440005', 'Database-driven applications', 'A', true),
  ('880e8400-e29b-41d4-a716-446655440018', '770e8400-e29b-41d4-a716-446655440005', 'Network protocols', 'B', false),
  ('880e8400-e29b-41d4-a716-446655440019', '770e8400-e29b-41d4-a716-446655440005', 'Operating systems', 'C', false),
  ('880e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440005', 'Email servers', 'D', false)
ON CONFLICT (id) DO NOTHING;

-- Insert daily question for today
INSERT INTO daily_questions (id, question_id, date_assigned, exam_version_id) VALUES
  ('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, '660e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (date_assigned, exam_version_id) DO NOTHING;