-- RedPoint Database Initial Seed Script
-- Note: Passwords here are bcrypt hashes of 'admin123' and 'student123'
-- Admin: admin@redpoint.com / admin123
-- Students: [name]@college.edu / student123

TRUNCATE TABLE results, matches, participants, categories, tournaments, users RESTART IDENTITY CASCADE;

-- Insert Users
INSERT INTO users (name, email, password, role) VALUES
('System Administrator', 'admin@redpoint.com', '$2a$10$U2uJq6H7oXmYq3YkUvL9eO3gS4v2Xl4yX1V7iC7i0gR1gW7iK0c2e', 'ADMIN'),
('Arun Kumar', 'arun.kumar@college.edu', '$2a$10$fN8X7tP6E5d3A2s1Q0w9.e9r8t7y6u5i4o3p2a1s0d9f8g7h6j5k', 'PARTICIPANT'),
('Ravi Sharma', 'ravi.sharma@college.edu', '$2a$10$fN8X7tP6E5d3A2s1Q0w9.e9r8t7y6u5i4o3p2a1s0d9f8g7h6j5k', 'PARTICIPANT'),
('Priya Patel', 'priya.patel@college.edu', '$2a$10$fN8X7tP6E5d3A2s1Q0w9.e9r8t7y6u5i4o3p2a1s0d9f8g7h6j5k', 'PARTICIPANT'),
('Divya Reddy', 'divya.reddy@college.edu', '$2a$10$fN8X7tP6E5d3A2s1Q0w9.e9r8t7y6u5i4o3p2a1s0d9f8g7h6j5k', 'PARTICIPANT');

-- Insert Tournaments
INSERT INTO tournaments (name, sport, description, venue, event_date, registration_deadline, status) VALUES
('Annual Badminton Championship', 'Badminton', 'Premier college badminton singles and doubles championship.', 'Indoor Sports Complex', '2026-10-15', '2026-10-12', 'ONGOING'),
('Inter Department Cricket Cup', 'Cricket', '10-over cricket championship across engineering branches.', 'College Main Oval Ground', '2026-10-20', '2026-10-18', 'UPCOMING'),
('Volleyball Championship', 'Volleyball', 'Inter-collegiate volleyball tournament testing teamwork.', 'Outdoor Volleyball Court 1', '2026-10-25', '2026-10-22', 'UPCOMING'),
('Table Tennis Tournament', 'Table Tennis', 'Fast-paced table tennis showdown.', 'Student Activity Center - TT Arena', '2026-10-10', '2026-10-08', 'ONGOING'),
('Annual Basketball Championship', 'Basketball', '5v5 high-intensity collegiate basketball tournament.', 'Main Gymnasium Basketball Arena', '2026-09-28', '2026-09-24', 'COMPLETED');
