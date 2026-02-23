-- Admin Users Table
-- Simple password-protected admin access

CREATE TABLE IF NOT EXISTS admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for quick email lookups
CREATE INDEX IF NOT EXISTS idx_admin_users_email ON admin_users(email);

-- Allow public read for login check (password verified in app)
-- RLS disabled for simplicity - table only contains admin credentials
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Allow anonymous select for login verification
CREATE POLICY "Allow login check"
  ON admin_users
  FOR SELECT
  TO anon
  USING (true);

-- Function to verify admin password
CREATE OR REPLACE FUNCTION verify_admin_password(p_email TEXT, p_password TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE email = p_email
    AND password_hash = crypt(p_password, password_hash)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Comment for documentation
COMMENT ON TABLE admin_users IS 'Admin users with password authentication';

-- To add an admin, run:
-- INSERT INTO admin_users (email, password_hash, name)
-- VALUES ('admin@example.com', crypt('your-password', gen_salt('bf')), 'Admin Name');
