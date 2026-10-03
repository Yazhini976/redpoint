const db = require('../config/db');

// POST /api/registrations
exports.registerForTournament = async (req, res) => {
  try {
    const { tournament_id } = req.body;
    const userId = req.user.id;

    if (!tournament_id) {
      return res.status(400).json({ success: false, message: 'Tournament ID is required.' });
    }

    // 1. Check if tournament exists
    const tResult = await db.query('SELECT * FROM tournaments WHERE id = $1', [tournament_id]);
    if (tResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const tournament = tResult.rows[0];

    // Check if tournament is completed
    if (tournament.status === 'COMPLETED') {
      return res.status(400).json({
        success: false,
        message: 'This tournament has already concluded. Registrations are closed.'
      });
    }

    // 2. Check duplicate registration
    const existing = await db.query(
      'SELECT id FROM participants WHERE tournament_id = $1 AND user_id = $2',
      [tournament_id, userId]
    );

    if (existing.rows.length > 0) {
      return res.status(400).json({
        success: false,
        alreadyRegistered: true,
        message: 'You are already registered for this tournament.'
      });
    }

    // 3. Register participant
    const result = await db.query(
      'INSERT INTO participants (tournament_id, user_id) VALUES ($1, $2) RETURNING id, registered_at',
      [tournament_id, userId]
    );

    res.status(201).json({
      success: true,
      message: 'Registration Successful',
      registration: result.rows[0]
    });
  } catch (err) {
    console.error('registerForTournament error:', err);
    res.status(500).json({ success: false, message: 'Failed to process tournament registration.' });
  }
};

// GET /api/registrations/my
exports.getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user.id;
    const result = await db.query(`
      SELECT p.id as registration_id, p.registered_at,
        t.id as tournament_id, t.name as tournament_name, t.sport,
        t.venue, t.event_date, t.registration_deadline, t.status,
        t.description
      FROM participants p
      JOIN tournaments t ON p.tournament_id = t.id
      WHERE p.user_id = $1
      ORDER BY p.registered_at DESC
    `, [userId]);

    res.json({ success: true, count: result.rows.length, registrations: result.rows });
  } catch (err) {
    console.error('getMyRegistrations error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve registrations.' });
  }
};

// GET /api/registrations/tournament/:tournamentId
exports.getTournamentRegistrations = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const result = await db.query(`
      SELECT p.id as registration_id, p.registered_at,
        u.id as user_id, u.name, u.email
      FROM participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.tournament_id = $1
      ORDER BY p.registered_at DESC
    `, [tournamentId]);

    res.json({ success: true, count: result.rows.length, participants: result.rows });
  } catch (err) {
    console.error('getTournamentRegistrations error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve tournament participants.' });
  }
};

// DELETE /api/registrations/:id
exports.cancelRegistration = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const isAdmin = req.user.role === 'ADMIN';

    let query = 'DELETE FROM participants WHERE id = $1';
    const params = [id];

    if (!isAdmin) {
      query += ' AND user_id = $2';
      params.push(userId);
    }
    query += ' RETURNING id';

    const result = await db.query(query, params);
    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Registration not found or unauthorized.' });
    }

    res.json({ success: true, message: 'Registration cancelled successfully.' });
  } catch (err) {
    console.error('cancelRegistration error:', err);
    res.status(500).json({ success: false, message: 'Failed to cancel registration.' });
  }
};
