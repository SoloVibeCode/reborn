-- Tabla principal de artículos seleccionados diariamente
CREATE TABLE daily_picks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  title TEXT NOT NULL,
  summary TEXT NOT NULL,
  author_name TEXT NOT NULL,
  source TEXT NOT NULL CHECK (source IN ('Hacker News', 'Reddit')),
  avatar_url TEXT,
  link_post TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('LLMs', 'Agentes', 'Modelos', 'Herramientas', 'Investigación', 'Industria')),
  score INTEGER NOT NULL CHECK (score >= 0 AND score <= 100),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índice para consultas por fecha (el query más frecuente)
CREATE INDEX idx_daily_picks_date ON daily_picks (date DESC);

-- Row Level Security
ALTER TABLE daily_picks ENABLE ROW LEVEL SECURITY;

-- Política: lectura pública (la web necesita leer los picks)
CREATE POLICY "Allow public read" ON daily_picks
  FOR SELECT USING (true);

-- Política: solo el service role puede insertar/actualizar (el cron job)
CREATE POLICY "Allow service role insert" ON daily_picks
  FOR INSERT WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Allow service role update" ON daily_picks
  FOR UPDATE USING (auth.role() = 'service_role');
