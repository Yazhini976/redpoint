const bcrypt = require('bcryptjs');
const db = require('../config/db');

// GET /api/participants
exports.getAllParticipants = async (req, res) => {
  try {
    const { search } = req.query;
    let query = `
      SELECT u.id, u.name, u.email, u.role, u.created_at,
        COUNT(DISTINCT p.tournament_id) AS registration_count,
        COALESCE(
          json_agg(
            DISTINCT jsonb_build_object(
              'tournament_id', t.id,
              'tournament_name', t.name,
              'sport', t.sport,
              'status', t.status,
              'registered_at', p.registered_at
            )
          ) FILTER (WHERE t.id IS NOT NULL),
          '[]'
        ) AS tournaments
      FROM users u
      LEFT JOIN participants p ON u.id = p.user_id
      LEFT JOIN tournaments t ON p.tournament_id = t.id
      WHERE u.role = 'PARTICIPANT'
    `;
    const params = [];

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (u.name ILIKE $${params.length} OR u.email ILIKE $${params.length})`;
    }

    query += ` GROUP BY u.id ORDER BY u.name ASC`;

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, participants: result.rows });
  } catch (err) {
    console.error('getAllParticipants error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve participants.' });
  }
};

// GET /api/participants/:id
exports.getParticipantById = async (req, res) => {
  try {
    const { id } = req.params;
    const uResult = await db.query(
      'SELECT id, name, email, role, created_at FROM users WHERE id = $1 AND role = $2',
      [id, 'PARTICIPANT']
    );

    if (uResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Participant not found.' });
    }

    const participant = uResult.rows[0];

    // Fetch registered tournaments
    const tResult = await db.query(`
      SELECT t.*, p.registered_at, p.id as registration_id
      FROM participants p
      JOIN tournaments t ON p.tournament_id = t.id
      WHERE p.user_id = $1
      ORDER BY p.registered_at DESC
    `, [id]);

    participant.tournaments = tResult.rows;
    res.json({ success: true, participant });
  } catch (err) {
    console.error('getParticipantById error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve participant.' });
  }
};

// POST /api/participants
exports.createParticipant = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Name, email, and password are required.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    const existing = await db.query('SELECT id FROM users WHERE LOWER(email) = $1', [trimmedEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'A user with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, 'PARTICIPANT')
       RETURNING id, name, email, role, created_at`,
      [name.trim(), trimmedEmail, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: 'Participant account created successfully.',
      participant: result.rows[0]
    });
  } catch (err) {
    console.error('createParticipant error:', err);
    res.status(500).json({ success: false, message: 'Failed to create participant.' });
  }
};

// DELETE /api/participants/:id
exports.deleteParticipant = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      'DELETE FROM users WHERE id = $1 AND role = $2 RETURNING id',
      [id, 'PARTICIPANT']
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Participant not found.' });
    }

    res.json({ success: true, message: 'Participant deleted successfully.' });
  } catch (err) {
    console.error('deleteParticipant error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete participant.' });
  }
};
