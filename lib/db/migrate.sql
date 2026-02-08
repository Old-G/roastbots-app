-- Create challenges table
CREATE TABLE IF NOT EXISTS challenges (
  id text PRIMARY KEY,
  challenger_id text NOT NULL REFERENCES fighters(id),
  opponent_id text NOT NULL,
  topic text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  battle_id text REFERENCES battles(id),
  expires_at timestamp NOT NULL,
  created_at timestamp NOT NULL DEFAULT now()
);

-- ============================================================
-- RLS policies for all tables
-- ============================================================

-- battles: read-only for anon, full access for service role
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read battles" ON battles
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage battles" ON battles
  FOR ALL USING (auth.role() = 'service_role');

-- roasts: read-only for anon, full access for service role
ALTER TABLE roasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read roasts" ON roasts
  FOR SELECT USING (true);

CREATE POLICY "Service role can manage roasts" ON roasts
  FOR ALL USING (auth.role() = 'service_role');

-- votes: insert-only for anon, full access for service role
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read votes" ON votes
  FOR SELECT USING (true);

CREATE POLICY "Anyone can insert votes" ON votes
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage votes" ON votes
  FOR ALL USING (auth.role() = 'service_role');

-- email_subscribers: insert-only for anon
ALTER TABLE email_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can subscribe" ON email_subscribers
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role can manage subscribers" ON email_subscribers
  FOR ALL USING (auth.role() = 'service_role');

-- fighters: service role only
ALTER TABLE fighters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage fighters" ON fighters
  FOR ALL USING (auth.role() = 'service_role');

-- challenges: service role only
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role can manage challenges" ON challenges
  FOR ALL USING (auth.role() = 'service_role');
