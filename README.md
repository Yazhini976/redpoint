# REDPOINT — Sports & Extracurricular Event Management System

RedPoint is a streamlined Sports & Extracurricular Event Management System built for colleges and universities. It enables administrators and tournament managers to organize sports tournaments, manage divisions/categories, enroll student participants, schedule fixtures, record scores, and track competitive athletic leaderboards. Students can securely log in, browse tournaments, register with duplicate prevention, view their personal schedules, and track match outcomes.

---

## Key Features

### Administrator & Tournament Manager
- **Dynamic Dashboard**: Real-time summary cards (Total Tournaments, Upcoming Tournaments, Total Participants, Total Matches), participation Chart.js visualization, and recent match feed.
- **Tournament Management**: Create, edit, inspect, and delete tournaments across various sports (Badminton, Cricket, Volleyball, Table Tennis, Basketball, Football, etc.) with registration deadlines and venue tracking.
- **Category Management**: Partition tournaments into competitive categories/divisions (e.g. Men's Singles, Women's Singles, Men's Doubles, Mixed Doubles, Team).
- **Participant Management**: Create and manage verified student athlete accounts with direct visibility into enrolled tournaments.
- **Match Management**: Schedule match fixtures between participants with date, time, venue, and status validation (prevents duplicate participant pairings).
- **Result Recording**: Record official match scores and winners with automatic status progression to `COMPLETED` and immediate leaderboard recalibration.
- **Live Leaderboard**: Real-time points calculation and standings table (Win = 3 points, Draw = 1 point, Loss = 0 points) with tournament-specific and combined filters.

### Student & Participant
- **Personalized Athlete Dashboard**: Summary counters for registered tournaments, upcoming matches, completed matches, and total wins.
- **Tournament Catalog & Registration**: Browse available collegiate tournaments with real-time registration deadline tracking and immediate duplicate prevention feedback.
- **My Registrations**: Manage enrolled events with the ability to review dates, venues, and cancel upcoming entries.
- **Fixture Schedule**: Filterable match schedule (by sport, tournament, status, or "Only My Matches") with reporting time guidelines.
- **Match Results**: Searchable archive of verified completed matches and final scores.
- **Athletic Standings**: View overall and tournament-specific leaderboards with personal ranking highlighted.
- **Profile & Security**: Manage personal details and change account passwords.

---

## Technology Stack

- **Frontend**:
  - HTML5 & CSS3 (Custom design system with responsive layouts)
  - Vanilla JavaScript (ES6+ modular API client and UI controllers)
  - Bootstrap 5.3.3 (Responsive grid, modal dialogues, toasts, cards)
  - Bootstrap Icons 1.11.3
  - Chart.js 4.4.7 (Participation analytics)
  - *No heavy frontend frameworks (clean, lightweight, academic-friendly)*

- **Backend**:
  - Node.js (v18+) & Express.js REST API
  - PostgreSQL database with `pg` connection pooling
  - Parameterized SQL queries for safety against SQL injection
  - Password hashing with `bcryptjs`
  - JWT (JSON Web Tokens) authentication stored in `localStorage`
  - Cross-Origin Resource Sharing (`cors`) & `dotenv`

---

## Folder Structure

```
REDPOINT/
├── README.md
├── .gitignore
├── backend/
│   ├── .env
│   ├── .env.example
│   ├── package.json
│   ├── server.js
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── tournamentController.js
│   │   ├── categoryController.js
│   │   ├── participantController.js
│   │   ├── registrationController.js
│   │   ├── matchController.js
│   │   ├── resultController.js
│   │   ├── leaderboardController.js
│   │   └── statsController.js
│   ├── middleware/
│   │   └── authMiddleware.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── tournamentRoutes.js
│   │   ├── categoryRoutes.js
│   │   ├── participantRoutes.js
│   │   ├── registrationRoutes.js
│   │   ├── matchRoutes.js
│   │   ├── resultRoutes.js
│   │   ├── leaderboardRoutes.js
│   │   └── statsRoutes.js
│   ├── scripts/
│   │   ├── initDb.js
│   │   └── seedDb.js
│   └── sql/
│       ├── schema.sql
│       └── seed.sql
└── frontend/
    ├── index.html
    ├── login.html
    ├── css/
    │   └── style.css
    ├── js/
    │   ├── api.js
    │   ├── auth.js
    │   ├── admin.js
    │   ├── participant.js
    │   └── common.js
    ├── admin/
    │   ├── dashboard.html
    │   ├── tournaments.html
    │   ├── categories.html
    │   ├── participants.html
    │   ├── matches.html
    │   ├── results.html
    │   └── leaderboard.html
    └── participant/
        ├── dashboard.html
        ├── tournaments.html
        ├── registrations.html
        ├── schedule.html
        ├── results.html
        ├── leaderboard.html
        └── profile.html
```

---

## Database Setup

1. Make sure PostgreSQL is running on your system.
2. Create the database `redpoint` (if not already created):
   ```sql
   CREATE DATABASE redpoint;
   ```
3. Configure database credentials in `backend/.env`.

---

## Environment Variables

Create or verify `backend/.env`:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=redpoint
DB_USER=postgres
DB_PASSWORD=password
JWT_SECRET=redpoint_jwt_super_secret_college_key_2026
```

---

## Installation & Running the Application

### 1. Install Backend Dependencies
Open terminal in the `backend/` directory:
```bash
cd backend
npm install
```

### 2. Initialize Database Schema & Seed Data
Run the initialization and seeding scripts:
```bash
npm run db:init
npm run db:seed
```
This sets up all tables and inserts 1 Admin, 16 realistic Indian college student participants, 5 tournaments, 12 categories, 26 registrations, 16 matches, and 10 results!

### 3. Start the Server
```bash
npm start
```

### 4. Access the Application
The Express server is configured to serve both the REST API and the static frontend simultaneously. Open your browser and navigate to:
```
http://localhost:5000
```
- Or open `http://localhost:5000/login.html` to log in directly.

---

## Login Credentials

### Administrator Account
- **Email:** `admin@redpoint.com`
- **Password:** `admin123`
- **Role:** Administrator (Full tournament, category, match, and result controls)

### Participant / Student Accounts (Sample)
- **Email:** `arun.kumar@college.edu` | **Password:** `student123`
- **Email:** `ravi.sharma@college.edu` | **Password:** `student123`
- **Email:** `priya.patel@college.edu` | **Password:** `student123`
- **Email:** `divya.reddy@college.edu` | **Password:** `student123`
- **Email:** `aditya.verma@college.edu` | **Password:** `student123`

*(The login page also provides 1-click Quick Demo Fill buttons for instant evaluation)*

---

## REST API Documentation

### Authentication
- `POST /api/auth/login` — Authenticate user and obtain JWT token.
- `GET /api/auth/me` — Retrieve currently logged-in user profile.
- `POST /api/auth/change-password` — Update user account password.

### Tournaments
- `GET /api/tournaments` — Retrieve tournaments (filters: `sport`, `status`, `search`).
- `GET /api/tournaments/:id` — Retrieve tournament details with categories and registrations.
- `POST /api/tournaments` — Create a tournament (Admin only).
- `PUT /api/tournaments/:id` — Update tournament details (Admin only).
- `DELETE /api/tournaments/:id` — Delete a tournament (Admin only).

### Categories
- `GET /api/categories` — Retrieve all categories (optional `tournament_id` query).
- `GET /api/categories/tournament/:tournamentId` — Retrieve categories for a tournament.
- `GET /api/categories/:id` — Retrieve category by ID.
- `POST /api/categories` — Create category (Admin only).
- `PUT /api/categories/:id` — Update category (Admin only).
- `DELETE /api/categories/:id` — Delete category (Admin only).

### Participants
- `GET /api/participants` — List all student participants with registration counts (Admin only).
- `GET /api/participants/:id` — Get participant details (Admin only).
- `POST /api/participants` — Create a participant student account (Admin only).
- `DELETE /api/participants/:id` — Delete a participant account (Admin only).

### Registrations
- `POST /api/registrations` — Enroll student in a tournament (with duplicate prevention).
- `GET /api/registrations/my` — Retrieve current student's enrolled tournaments.
- `GET /api/registrations/tournament/:tournamentId` — Retrieve participants in a tournament.
- `DELETE /api/registrations/:id` — Cancel tournament registration.

### Matches
- `GET /api/matches` — List matches (filters: `tournament_id`, `category_id`, `status`, `sport`, `user_id`, `search`).
- `GET /api/matches/:id` — Get match by ID.
- `POST /api/matches` — Schedule a match (Admin only).
- `PUT /api/matches/:id` — Update match details (Admin only).
- `DELETE /api/matches/:id` — Delete match (Admin only).

### Results
- `GET /api/results` — List match results (filters: `tournament_id`, `search`).
- `POST /api/results` — Record/update match scores & winner; sets match status to `COMPLETED` (Admin only).
- `PUT /api/results/:id` — Update result scores/winner (Admin only).
- `DELETE /api/results/:id` — Remove result (Admin only).

### Leaderboard & Analytics
- `GET /api/leaderboard` — Calculate participant standings (`tournament_id` filter optional).
- `GET /api/stats/admin` — Aggregate counts and chart data for admin dashboard.
- `GET /api/stats/participant` — Aggregate counts and upcoming fixtures for student dashboard.

---

## Future Enhancements
*(For academic discussion and future milestones)*
1. **Real-time Score Updates**: WebSocket-based broadcast of live score updates during ongoing fixtures.
2. **Automated Fixture Generation**: Single-elimination, round-robin, and bracket generation algorithms.
3. **Automated Notification Services**: Email and SMS alerts for upcoming matches and schedule changes.
4. **Advanced Performance Analytics**: Deep statistical metrics, win rate graphs, and head-to-head records.
