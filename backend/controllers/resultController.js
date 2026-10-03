const db = require('../config/db');

// GET /api/results
exports.getAllResults = async (req, res) => {
  try {
    const { tournament_id, search } = req.query;

    let query = `
      SELECT r.*,
        m.id as match_id, m.match_date, m.match_time, m.venue,
        t.id as tournamen`63t_id, t.name as tournament_name, t.sport,
        c.name as category_name,
        ua.id as player_a_id, ua.name as player_a_name,
        ub.id as player_b_id, ub.name as player_b_name,
        uw.name as winner_name
      FROM results r
      JOIN matches m ON r.match_id = m.id
      JOIN tournaments t ON m.tournament_id = t.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users ua ON m.participant_a = ua.id
      LEFT JOIN users ub ON m.participant_b = ub.id
      LEFT JOIN users uw ON r.winner = uw.id
      WHERE 1=1
    `;
    const params = [];

    if (tournament_id && tournament_id !== 'ALL') {
      params.push(tournament_id);
      query += ` AND m.tournament_id = $${params.length}`;
    }

    if (search) {
      params.push(`%${search}%`);
      query += ` AND (
        t.name ILIKE $${params.length} OR
        t.sport ILIKE $${params.length} OR
        ua.name ILIKE $${params.length} OR
        ub.name ILIKE $${params.length} OR
        uw.name ILIKE $${params.length}
      )`;
    }

    query += ` ORDER BY r.result_date DESC, r.id DESC`;

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, results: result.rows });
  } catch (err) {
    console.error('getAllResults error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve results.' });
  }
};

// POST /api/results
exports.createOrUpdateResult = async (req, res) => {
  try {
    const { match_id, score_a, score_b, winner } = req.body;

    if (!match_id) {
      return res.status(400).json({ success: false, message: 'Match ID is required.' });
    }

    if (score_a === undefined || score_b === undefined || isNaN(score_a) || isNaN(score_b)) {
      return res.status(400).json({ success: false, message: 'Scores must be valid numbers.' });
    }

    // Verify match exists
    const mCheck = await db.query('SELECT * FROM matches WHERE id = $1', [match_id]);
    if (mCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Match not found.' });
    }

    const match = mCheck.rows[0];
    let winnerId = winner ? parseInt(winner, 10) : null;

    // Check if result already exists for this match
    const existing = await db.query('SELECT id FROM results WHERE match_id = $1', [match_id]);

    let savedResult;
    if (existing.rows.length > 0) {
      const updateRes = await db.query(
        `UPDATE results
         SET score_a = $1, score_b = $2, winner = $3, result_date = CURRENT_TIMESTAMP
         WHERE match_id = $4
         RETURNING *`,
        [parseInt(score_a, 10), parseInt(score_b, 10), winnerId, match_id]
      );
      savedResult = updateRes.rows[0];
    } else {
      const insertRes = await db.query(
        `INSERT INTO results (match_id, score_a, score_b, winner, result_date)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
         RETURNING *`,
        [match_id, parseInt(score_a, 10), parseInt(score_b, 10), winnerId]
      );
      savedResult = insertRes.rows[0];
    }

    // Automatically update match status to COMPLETED
    await db.query(`UPDATE matches SET status = 'COMPLETED' WHERE id = $1`, [match_id]);

    res.status(201).json({
      success: true,
      message: 'Match result saved successfully and marked as COMPLETED.',
      result: savedResult
    });
  } catch (err) {
    console.error('createOrUpdateResult error:', err);
    res.status(500).json({ success: false, message: 'Failed to record match result.' });
  }
};

// PUT /api/results/:id
exports.updateResultById = async (req, res) => {
  try {
    const { id } = req.params;
    const { score_a, score_b, winner } = req.body;

    const existing = await db.query('SELECT * FROM results WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }

    const cur = existing.rows[0];
    const newA = score_a !== undefined ? parseInt(score_a, 10) : cur.score_a;
    const newB = score_b !== undefined ? parseInt(score_b, 10) : cur.score_b;
    const newWinner = winner !== undefined ? (winner ? parseInt(winner, 10) : null) : cur.winner;

    const result = await db.query(
      `UPDATE results
       SET score_a = $1, score_b = $2, winner = $3, result_date = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [newA, newB, newWinner, id]
    );

    res.json({
      success: true,
      message: 'Result updated successfully.',
      result: result.rows[0]
    });
  } catch (err) {
    console.error('updateResultById error:', err);
    res.status(500).json({ success: false, message: 'Failed to update result.' });
  }
};

// DELETE /api/results/:id
exports.deleteResult = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM results WHERE id = $1 RETURNING id, match_id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Result not found.' });
    }

    // Optionally set match back to SCHEDULED if result is deleted
    await db.query(`UPDATE matches SET status = 'SCHEDULED' WHERE id = $1`, [result.rows[0].match_id]);

    res.json({ success: true, message: 'Result deleted successfully.' });
  } catch (err) {
    console.error('deleteResult error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete result.' });
  }
};
