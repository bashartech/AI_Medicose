-- ============================================
-- AI Doctor Platform - Complete Database Schema
-- ============================================
-- FIXED ORDER: Tables created before foreign key references
-- This migration creates all tables needed for both workflows:
-- - Workflow 1: Dedicated Upload & Analysis
-- - Workflow 2: Chat-Integrated Analysis
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. PROFILES TABLE (Created FIRST - other tables reference this)
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- ============================================
-- 2. CHAT SESSIONS TABLE (Created EARLY - ai_analyses references this)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  specialist_type TEXT NOT NULL,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
ALTER TABLE chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat sessions" ON chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chat sessions" ON chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 3. MEDICAL REPORTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  ocr_text TEXT,
  structured_data JSONB,
  specialist_type TEXT NOT NULL,
  report_type TEXT CHECK (report_type IN ('blood', 'urine', 'xray', 'mri', 'ct_scan', 'ultrasound', 'other')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_reports_user_id ON medical_reports(user_id);
CREATE INDEX idx_reports_specialist ON medical_reports(specialist_type);
CREATE INDEX idx_reports_created_at ON medical_reports(created_at DESC);
ALTER TABLE medical_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own reports" ON medical_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON medical_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON medical_reports FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 4. MEDICAL IMAGES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS medical_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  image_type TEXT NOT NULL CHECK (image_type IN ('xray', 'skin', 'oral', 'posture', 'retina', 'other')),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  image_url TEXT,
  file_size BIGINT NOT NULL,
  ml_analysis_result JSONB,
  specialist_type TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_images_user_id ON medical_images(user_id);
CREATE INDEX idx_images_type ON medical_images(image_type);
CREATE INDEX idx_images_specialist ON medical_images(specialist_type);
CREATE INDEX idx_images_created_at ON medical_images(created_at DESC);
ALTER TABLE medical_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own images" ON medical_images FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own images" ON medical_images FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own images" ON medical_images FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 5. AI ANALYSES TABLE (References chat_sessions, medical_reports, medical_images)
-- ============================================
CREATE TABLE IF NOT EXISTS ai_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('dedicated', 'chat')),
  report_id UUID REFERENCES medical_reports(id) ON DELETE SET NULL,
  image_id UUID REFERENCES medical_images(id) ON DELETE SET NULL,
  session_id UUID REFERENCES chat_sessions(id) ON DELETE SET NULL,
  specialist_type TEXT NOT NULL,
  analysis_text TEXT NOT NULL,
  diagnosis_summary TEXT,
  recommendations JSONB,
  confidence_score DECIMAL(5, 2),
  sources TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analyses_user_id ON ai_analyses(user_id);
CREATE INDEX idx_analyses_workflow ON ai_analyses(workflow_type);
CREATE INDEX idx_analyses_report_id ON ai_analyses(report_id);
CREATE INDEX idx_analyses_image_id ON ai_analyses(image_id);
CREATE INDEX idx_analyses_session_id ON ai_analyses(session_id);
CREATE INDEX idx_analyses_specialist ON ai_analyses(specialist_type);
CREATE INDEX idx_analyses_created_at ON ai_analyses(created_at DESC);
ALTER TABLE ai_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON ai_analyses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert analyses" ON ai_analyses FOR INSERT WITH CHECK (true);

-- ============================================
-- 6. SYMPTOMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS symptoms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  symptom_text TEXT NOT NULL,
  severity INTEGER CHECK (severity >= 1 AND severity <= 10),
  duration_days INTEGER,
  body_location TEXT,
  specialist_type TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'archived')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_symptoms_user_id ON symptoms(user_id);
CREATE INDEX idx_symptoms_specialist ON symptoms(specialist_type);
CREATE INDEX idx_symptoms_created_at ON symptoms(created_at DESC);
ALTER TABLE symptoms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own symptoms" ON symptoms FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own symptoms" ON symptoms FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own symptoms" ON symptoms FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- 7. CONSULTATION HISTORY TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS consultation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  workflow_type TEXT NOT NULL CHECK (workflow_type IN ('dedicated', 'chat')),
  specialist_type TEXT NOT NULL,
  symptoms TEXT,
  report_ids UUID[],
  image_ids UUID[],
  ai_analysis_id UUID REFERENCES ai_analyses(id) ON DELETE SET NULL,
  final_report TEXT,
  pdf_report_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_consultations_user_id ON consultation_history(user_id);
CREATE INDEX idx_consultations_workflow ON consultation_history(workflow_type);
CREATE INDEX idx_consultations_specialist ON consultation_history(specialist_type);
CREATE INDEX idx_consultations_created_at ON consultation_history(created_at DESC);
ALTER TABLE consultation_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own consultations" ON consultation_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert consultations" ON consultation_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can delete own consultations" ON consultation_history FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- 8. CHAT MESSAGES TABLE (References chat_sessions)
-- ============================================
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES chat_sessions(id) ON DELETE CASCADE NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own chat messages" ON chat_messages FOR SELECT USING (auth.uid() = (SELECT user_id FROM chat_sessions WHERE id = session_id));
CREATE POLICY "System can insert chat messages" ON chat_messages FOR INSERT WITH CHECK (true);

-- ============================================
-- 9. ANALYSIS RECORDS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS analysis_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('image', 'report')),
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  analysis_type TEXT NOT NULL,
  specialist_type TEXT NOT NULL,
  ml_results JSONB,
  ocr_text TEXT,
  ai_analysis TEXT,
  recommendations JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_analysis_user_id ON analysis_records(user_id);
CREATE INDEX idx_analysis_type ON analysis_records(analysis_type);
CREATE INDEX idx_analysis_created_at ON analysis_records(created_at DESC);
ALTER TABLE analysis_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own analyses" ON analysis_records FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert analyses" ON analysis_records FOR INSERT WITH CHECK (true);

-- ============================================
-- 10. TRIGGER FUNCTION: Update updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_reports_updated_at BEFORE UPDATE ON medical_reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_medical_images_updated_at BEFORE UPDATE ON medical_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_symptoms_updated_at BEFORE UPDATE ON symptoms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chat_sessions_updated_at BEFORE UPDATE ON chat_sessions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 11. SPECIALIST TYPES REFERENCE DATA
-- ============================================
CREATE TABLE IF NOT EXISTS specialist_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  icon TEXT,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

INSERT INTO specialist_types (name, display_name, icon, description) VALUES
  ('general-physician', 'General Physician', 'FaUserMd', 'Primary care for everyday medical conditions'),
  ('cardiologist-specialist', 'Cardiologist', 'FaHeartbeat', 'Heart and cardiovascular health'),
  ('dermatologist-specialist', 'Dermatologist', 'FaSpa', 'Skin, hair, and nail conditions'),
  ('ent-specialist', 'ENT Specialist', 'FaAssistiveListeningSystems', 'Ear, nose, and throat disorders'),
  ('eye-specialist', 'Eye Specialist', 'FaEye', 'Vision and eye diseases'),
  ('orthopedic-specialist', 'Orthopedic Surgeon', 'FaXRay', 'Bones, joints, and muscles'),
  ('dentist-specialist', 'Dentist', 'FaTooth', 'Oral health and dental care'),
  ('pediatrician-specialist', 'Pediatrician', 'FaBaby', 'Child health and development'),
  ('pharmacy-assistant', 'Pharmacy Assistant', 'FaPrescriptionBottle', 'Medication information'),
  ('nutritionist-specialist', 'Nutritionist', 'FaApple', 'Diet and nutrition guidance')
ON CONFLICT (name) DO NOTHING;
