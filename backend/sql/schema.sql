-- RedPoint Database Schema
-- Sports & Extracurricular Event Management System

DROP TABLE IF EXISTS results CASCADE;
DROP TABLE IF EXISTS matches CASCADE;
DROP TABLE IF EXISTS participants CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS tournaments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. Users Table
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'PARTICIPANT')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tournaments Table
CREATE TABLE tournaments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sport VARCHAR(100) NOT NULL,
    description TEXT,
    venue VARCHAR(150) NOT NULL,
    event_date DATE NOT NULL,
    registration_deadline DATE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'UPCOMING' CHECK (status IN ('UPCOMING', 'ONGOING', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 3. Categories Table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    gender VARCHAR(50) NOT NULL,
    format VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Participants (Registrations) Table
CREATE TABLE participants (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_tournament_user UNIQUE (tournament_id, user_id)
);

-- 5. Matches Table
CREATE TABLE matches (
    id SERIAL PRIMARY KEY,
    tournament_id INTEGER NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    participant_a INTEGER REFERENCES users(id) ON DELETE SET NULL,
    participant_b INTEGER REFERENCES users(id) ON DELETE SET NULL,
    match_date DATE NOT NULL,
    match_time VARCHAR(20) NOT NULL,
    venue VARCHAR(150) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'COMPLETED')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Results Table
CREATE TABLE results (
    id SERIAL PRIMARY KEY,
    match_id INTEGER NOT NULL UNIQUE REFERENCES matches(id) ON DELETE CASCADE,
    score_a INTEGER NOT NULL DEFAULT 0,
    score_b INTEGER NOT NULL DEFAULT 0,
    winner INTEGER REFERENCES users(id) ON DELETE SET NULL,
    result_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
