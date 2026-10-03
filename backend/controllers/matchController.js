const db = require('../config/db');

// GET /api/matches
exports.getAllMatches = async (req, res) => {
  try {
    const { tournament_id, category_id, status, sport, user_id, search } = req.query;

    let query = `
      SELECT m.*,
        t.name as tournament_name, t.sport,
        c.name as category_name, c.gender as category_gender, c.format as category_format,
        ua.name as player_a_name, ua.email as player_a_email,
        ub.name as player_b_name, ub.email as player_b_email,
        r.id as result_id, r.score_a, r.score_b, r.winner as winner_id,
        uw.name as winner_name
      FROM matches m
      JOIN tournaments t ON m.tournament_id = t.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users ua ON m.participant_a = ua.id
      LEFT JOIN users ub ON m.participant_b = ub.id
      LEFT JOIN results r ON m.id = r.match_id
      LEFT JOIN users uw ON r.winner = uw.id
      WHERE 1=1
    `;
    const params = [];

    if (tournament_id && tournament_id !== 'ALL') {
      params.push(tournament_id);
      query += ` AND m.tournament_id = $${params.length}`;
    }

    if (category_id && category_id !== 'ALL') {
      params.push(category_id);
      query += ` AND m.category_id = $${params.length}`;
    }

    if (status && status !== 'ALL') {
      params.push(status);
      query += ` AND m.status = $${params.length}`;
    }

    if (sport && sport !== 'ALL') {
      params.push(sport);
      query += ` AND LOWER(t.sport) = LOWER($${params.length})`;
    }

    if (user_id) {
      params.push(user_id);
      query += ` AND (m.participant_a = $${params.length} OR m.participant_b = $${params.length})`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        t.name ILIKE $${params.length} OR
        t.sport ILIKE $${params.length} OR
        ua.name ILIKE $${params.length} OR
        ub.name ILIKE $${params.length} OR
        m.venue ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY m.match_date ASC, m.match_time ASC, m.id DESC`;

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, matches: result.rows });
  } catch (err) {
    console.error('getAllMatches error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve matches.' });
  }
};

// GET /api/matches/:id
exports.getMatchById = async (req, res) => {
  try {
    const { id } = req.params;
    const query = `
      SELECT m.*,
        t.name as tournament_name, t.sport,
        c.name as category_name,
        ua.name as player_a_name, ua.email as player_a_email,
        ub.name as player_b_name, ub.email as player_b_email,
        r.id as result_id, r.score_a, r.score_b, r.winner as winner_id,
        uw.name as winner_name
      FROM matches m
      JOIN tournaments t ON m.tournament_id = t.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users ua ON m.participant_a = ua.id
      LEFT JOIN users ub ON m.participant_b = ub.id
      LEFT JOIN results r ON m.id = r.match_id
      LEFT JOIN users uw ON r.winner = uw.id
      WHERE m.id = $1
    `;
    const result = await db.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    res.json({ success: true, match: result.rows[0] });
  } catch (err) {
    console.error('getMatchById error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve match.' });
  }
};

// POST /api/matches
exports.createMatch = async (req, res) => {
  try {
    const { tournament_id, category_id, participant_a, participant_b, match_date, match_time, venue, status } = req.body;

    if (!tournament_id || !participant_a || !participant_b || !match_date || !match_time || !venue) {
      return res.status(400).json({ success: false, message: 'All match fields are required.' });
    }

    if (String(participant_a) === String(participant_b)) {
      return res.status(400).json({ success: false, message: 'Participant A and Participant B cannot be the same.' });
    }

    // Verify tournament
    const tCheck = await db.query('SELECT id FROM tournaments WHERE id = $1', [tournament_id]);
    if (tCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const mStatus = status || 'SCHEDULED';
    const result = await db.query(
      `INSERT INTO matches (tournament_id, category_id, participant_a, participant_b, match_date, match_time, venue, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [tournament_id, category_id || null, participant_a, participant_b, match_date, match_time, venue.trim(), mStatus]
    );

    res.status(201).json({
      success: true,
      message: 'Match created successfully.',
      match: result.rows[0]
    });
  } catch (err) {
    console.error('createMatch error:', err);
    res.status(500).json({ success: false, message: 'Unable to create match.' });
  }
};

// PUT /api/matches/:id
exports.updateMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { tournament_id, category_id, participant_a, participant_b, match_date, match_time, venue, status } = req.body;

    const existing = await db.query('SELECT * FROM matches WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    const cur = existing.rows[0];
    const newA = participant_a !== undefined ? participant_a : cur.participant_a;
    const newB = participant_b !== undefined ? participant_b : cur.participant_b;

    if (newA && newB && String(newA) === String(newB)) {
      return res.status(400).json({ success: false, message: 'Participant A and Participant B cannot be the same.' });
    }

    const newTournamentId = tournament_id || cur.tournament_id;
    const newCategoryId = category_id !== undefined ? category_id : cur.category_id;
    const newDate = match_date || cur.match_date;
    const newTime = match_time || cur.match_time;
    const newVenue = venue !== undefined ? venue.trim() : cur.venue;
    const newStatus = status || cur.status;

    const result = await db.query(
      `UPDATE matches
       SET tournament_id = $1, category_id = $2, participant_a = $3, participant_b = $4,
           match_date = $5, match_time = $6, venue = $7, status = $8
       WHERE id = $9
       RETURNING *`,
      [newTournamentId, newCategoryId, newA, newB, newDate, newTime, newVenue, newStatus, id]
    );

    res.json({
      success: true,
      message: 'Match updated successfully.',
      match: result.rows[0]
    });
  } catch (err) {
    console.error('updateMatch error:', err);
    res.status(500).json({ success: false, message: 'Failed to update match.' });
  }
};

// DELETE /api/matches/:id
exports.deleteMatch = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM matches WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    res.json({ success: true, message: 'Match deleted successfully.' });
  } catch (err) {
    console.error('deleteMatch error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete match.' });
  }
};
