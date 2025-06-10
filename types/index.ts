export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  subscription_status: 'free' | 'premium';
}

export interface Exam {
  id: string;
  title: string;
  short_name: string;
  description: string;
  category: string;
  total_questions: number;
  passing_score: number;
  duration_minutes: number;
  is_active: boolean;
  versions: ExamVersion[];
}

export interface ExamVersion {
  id: string;
  exam_id: string;
  version_code: string;
  version_name: string;
  description: string;
  is_current: boolean;
  discontinue_date?: string;
  launch_date: string;
}

export interface Question {
  id: string;
  exam_version_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false';
  explanation: string;
  difficulty: 'easy' | 'medium' | 'hard';
  domain: string;
  is_daily_question?: boolean;
  daily_question_date?: string;
}

export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_letter: string;
}

export interface UserProgress {
  id: string;
  user_id: string;
  exam_version_id: string;
  questions_answered: number;
  questions_correct: number;
  last_studied: string;
  study_streak: number;
  created_at: string;
}

export interface QuizSession {
  id: string;
  user_id: string;
  exam_version_id: string;
  quiz_type: 'daily' | 'quick_10' | 'timed' | 'level_up' | 'missed' | 'weakest' | 'custom';
  score: number;
  total_questions: number;
  time_taken_seconds: number;
  completed_at: string;
}

export interface UserAnswer {
  id: string;
  user_id: string;
  question_id: string;
  selected_option_id: string;
  is_correct: boolean;
  quiz_session_id?: string;
  answered_at: string;
}