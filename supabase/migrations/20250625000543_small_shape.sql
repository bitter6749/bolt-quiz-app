/*
  # Initial Schema for QuizAI Application

  1. New Tables
    - `users`
      - `id` (uuid, primary key)
      - `email` (text, unique)
      - `name` (text)
      - `image` (text)
      - `role` (text, default 'USER')
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quiz_sets`
      - `id` (uuid, primary key)
      - `title` (text)
      - `description` (text)
      - `questions` (jsonb)
      - `created_by` (uuid, foreign key)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)
    
    - `quiz_attempts`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `quiz_set_id` (uuid, foreign key)
      - `answers` (jsonb)
      - `score` (integer)
      - `total_questions` (integer)
      - `completed_at` (timestamp)
    
    - `monthly_usage`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `month_year` (text)
      - `total_prompts` (integer)
      - `total_cost` (numeric)
      - `last_updated` (timestamp)
    
    - `usage_logs`
      - `id` (uuid, primary key)
      - `user_id` (uuid, foreign key)
      - `action` (text)
      - `prompt_text` (text)
      - `cost_estimate` (numeric)
      - `created_at` (timestamp)
      - `month_year` (text)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text UNIQUE NOT NULL,
  name text,
  image text,
  role text DEFAULT 'USER' CHECK (role IN ('USER', 'ADMIN')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_sets table
CREATE TABLE IF NOT EXISTS quiz_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  questions jsonb NOT NULL,
  created_by uuid REFERENCES users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create quiz_attempts table
CREATE TABLE IF NOT EXISTS quiz_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  quiz_set_id uuid REFERENCES quiz_sets(id) ON DELETE CASCADE,
  answers jsonb NOT NULL,
  score integer NOT NULL DEFAULT 0,
  total_questions integer NOT NULL DEFAULT 0,
  completed_at timestamptz DEFAULT now()
);

-- Create monthly_usage table
CREATE TABLE IF NOT EXISTS monthly_usage (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  month_year text NOT NULL,
  total_prompts integer DEFAULT 0,
  total_cost numeric DEFAULT 0,
  last_updated timestamptz DEFAULT now(),
  UNIQUE(user_id, month_year)
);

-- Create usage_logs table
CREATE TABLE IF NOT EXISTS usage_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  action text NOT NULL,
  prompt_text text,
  cost_estimate numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  month_year text NOT NULL
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can read own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = id);

-- Create policies for quiz_sets table
CREATE POLICY "Users can read own quiz sets"
  ON quiz_sets
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = created_by);

CREATE POLICY "Users can create quiz sets"
  ON quiz_sets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = created_by);

CREATE POLICY "Users can update own quiz sets"
  ON quiz_sets
  FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = created_by);

CREATE POLICY "Users can delete own quiz sets"
  ON quiz_sets
  FOR DELETE
  TO authenticated
  USING (auth.uid()::text = created_by);

-- Create policies for quiz_attempts table
CREATE POLICY "Users can read own quiz attempts"
  ON quiz_attempts
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create quiz attempts"
  ON quiz_attempts
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Create policies for monthly_usage table
CREATE POLICY "Users can read own usage"
  ON monthly_usage
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can manage own usage"
  ON monthly_usage
  FOR ALL
  TO authenticated
  USING (auth.uid()::text = user_id);

-- Create policies for usage_logs table
CREATE POLICY "Users can read own usage logs"
  ON usage_logs
  FOR SELECT
  TO authenticated
  USING (auth.uid()::text = user_id);

CREATE POLICY "Users can create usage logs"
  ON usage_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_quiz_sets_created_by ON quiz_sets(created_by);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_quiz_set_id ON quiz_attempts(quiz_set_id);
CREATE INDEX IF NOT EXISTS idx_monthly_usage_user_month ON monthly_usage(user_id, month_year);
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_month ON usage_logs(user_id, month_year);