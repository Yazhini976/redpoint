const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const authRoutes = require('./routes/authRoutes');
const tournamentRoutes = require('./routes/tournamentRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const participantRoutes = require('./routes/participantRoutes');
const registrationRoutes = require('./routes/registrationRoutes');
const matchRoutes = require('./routes/matchRoutes');
const resultRoutes = require('./routes/resultRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
app.use(express.static(path.join(__dirname, '../frontend')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/participants', participantRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/stats', statsRoutes);

// Health check API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'RedPoint - Sports & Extracurricular Event Management System',
    timestamp: new Date().toISOString()
  });
});

// Root fallback to frontend index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` RedPoint Server is running on port ${PORT}`);
  console.log(` Access Application: http://localhost:${PORT}`);
  console.log(` Health Check API:   http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
