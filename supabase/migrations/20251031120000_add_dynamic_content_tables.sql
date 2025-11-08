
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    achievement_title TEXT NOT NULL,
    cadet_name TEXT NOT NULL,
    rank TEXT,
    event TEXT,
    year TEXT,
    image TEXT
);

CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    title TEXT NOT NULL,
    description TEXT,
    date DATE,
    tag TEXT,
    tag_color TEXT
);

CREATE TABLE gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    src TEXT NOT NULL,
    event TEXT,
    date TEXT
);

ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gallery ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read access for all users" ON achievements FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON announcements FOR SELECT USING (true);
CREATE POLICY "Enable read access for all users" ON gallery FOR SELECT USING (true);

CREATE POLICY "Enable all access for admin" ON achievements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Enable all access for admin" ON announcements FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "Enable all access for admin" ON gallery FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());
