-- Create the table if it doesn't exist yet (Safety check)
CREATE TABLE IF NOT EXISTS teams (
    id SERIAL PRIMARY KEY,
    team_name VARCHAR(255) UNIQUE NOT NULL,
    access_token VARCHAR(255) NOT NULL,
    score INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert the teams
INSERT INTO teams (team_name, access_token) VALUES
('Hello World', 'HELLO-8291'),
('MKC', 'MKC-3342'),
('BM', 'BM-9921'),
('Twin Flames', 'TWIN-7743'),
('Manasverse', 'MANAS-2024'),
('The Jack', 'JACK-5512'),
('T3', 'T3-8831'),
('Duo', 'DUO-1192'),
('Binary Bytes', 'BYTE-4428'),
('3 Idiots', 'IDIOT-3391'),
('Innovation X', 'INNO-6625'),
('Logic Labs', 'LOGIC-7719'),
('Tribytes', 'TRI-2284'),
('ChatGPT', 'GPT-9911')
ON CONFLICT (team_name) DO NOTHING;
