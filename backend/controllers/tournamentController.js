const db = require('../config/db');

// GET /api/tournaments
exports.getAllTournaments = async (req, res) => {
  try {
    const { sport, status, search } = req.query;
    let query = `
      SELECT t.*,
        COUNT(DISTINCT c.id) AS category_count,
        COUNT(DISTINCT p.id) AS participant_count
      FROM tournaments t
      LEFT JOIN categories c ON t.id = c.tournament_id
      LEFT JOIN participants p ON t.id = p.tournament_id
      WHERE 1=1
    `;
    const params = [];

    if (sport && sport !== 'ALL') {
      params.push(sport);
      query += ` AND LOWER(t.sport) = LOWER($${params.length})`;
    }

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND t.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (t.name ILIKE $${params.length} OR t.sport ILIKE $${params.length} OR t.venue ILIKE $${params.length})`;
    }

    query += ` GROUP BY t.id ORDER BY t.event_date ASC, t.id DESC`;

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, tournaments: result.rows });
  } catch (err) {
    console.error('getAllTournaments error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve tournaments.' });
  }
};

// GET /api/tournaments/:id
exports.getTournamentById = async (req, res) => {
  try {
    const { id } = req.params;
    const tResult = await db.query('SELECT * FROM tournaments WHERE id = $1', [id]);

    if (tResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const tournament = tResult.rows[0];

    // Fetch categories
    const catResult = await db.query(
      'SELECT * FROM categories WHERE tournament_id = $1 ORDER BY id ASC',
      [id]
    );
    tournament.categories = catResult.rows;

    // Fetch registered participants
    const partResult = await db.query(`
      SELECT p.id as registration_id, p.registered_at, u.id as user_id, u.name, u.email
      FROM participants p
      JOIN users u ON p.user_id = u.id
      WHERE p.tournament_id = $1
      ORDER BY p.registered_at DESC
    `, [id]);
    tournament.participants = partResult.rows;
    tournament.participant_count = partResult.rows.length;

    // Fetch matches
    const matchResult = await db.query(`
      SELECT m.*, c.name as category_name,
        ua.name as player_a_name, ub.name as player_b_name,
        r.score_a, r.score_b, r.winner as winner_id, uw.name as winner_name
      FROM matches m
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users ua ON m.participant_a = ua.id
      LEFT JOIN users ub ON m.participant_b = ub.id
      LEFT JOIN results r ON m.id = r.match_id
      LEFT JOIN users uw ON r.winner = uw.id
      WHERE m.tournament_id = $1
      ORDER BY m.match_date ASC, m.match_time ASC
    `, [id]);
    tournament.matches = matchResult.rows;

    res.json({ success: true, tournament });
  } catch (err) {
    console.error('getTournamentById error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve tournament details.' });
  }
};

// POST /api/tournaments
exports.createTournament = async (req, res) => {
  try {
    const { name, sport, description, venue, event_date, registration_deadline, status } = req.body;

    if (!name || !sport || !venue || !event_date || !registration_deadline) {
      return res.status(400).json({ success: false, message: 'Please provide all required tournament fields.' });
    }

    const tStatus = status || 'UPCOMING';
    const validStatuses = ['UPCOMING', 'ONGOING', 'COMPLETED'];
    if (!validStatuses.includes(tStatus)) {
      return res.status(400).json({ success: false, message: 'Invalid status. Must be UPCOMING, ONGOING, or COMPLETED.' });
    }

    const result = await db.query(
      `INSERT INTO tournaments (name, sport, description, venue, event_date, registration_deadline, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [name.trim(), sport.trim(), description || '', venue.trim(), event_date, registration_deadline, tStatus]
    );

    res.status(201).json({
      success: true,
      message: 'Tournament created successfully.',
      tournament: result.rows[0]
    });
  } catch (err) {
    console.error('createTournament error:', err);
    res.status(500).json({ success: false, message: 'Unable to create tournament.' });
  }
};

// PUT /api/tournaments/:id
exports.updateTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sport, description, venue, event_date, registration_deadline, status } = req.body;

    const existing = await db.query('SELECT * FROM tournaments WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const current = existing.rows[0];
    const newName = name !== undefined ? name.trim() : current.name;
    const newSport = sport !== undefined ? sport.trim() : current.sport;
    const newDesc = description !== undefined ? description : current.description;
    const newVenue = venue !== undefined ? venue.trim() : current.venue;
    const newEventDate = event_date || current.event_date;
    const newDeadline = registration_deadline || current.registration_deadline;
    const newStatus = status || current.status;

    const result = await db.query(
      `UPDATE tournaments
       SET name = $1, sport = $2, description = $3, venue = $4, event_date = $5, registration_deadline = $6, status = $7
       WHERE id = $8
       RETURNING *`,
      [newName, newSport, newDesc, newVenue, newEventDate, newDeadline, newStatus, id]
    );

    res.json({
      success: true,
      message: 'Tournament updated successfully.',
      tournament: result.rows[0]
    });
  } catch (err) {
    console.error('updateTournament error:', err);
    res.status(500).json({ success: false, message: 'Failed to update tournament.' });
  }
};

// DELETE /api/tournaments/:id
exports.deleteTournament = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM tournaments WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    res.json({ success: true, message: 'Tournament deleted successfully.' });
  } catch (err) {
    console.error('deleteTournament error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete tournament.' });
  }
};
