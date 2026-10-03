const db = require('../config/db');

// GET /api/leaderboard
exports.getLeaderboard = async (req, res) => {
  try {
    const { tournament_id } = req.query;

    let tournamentCondition = '';
    const params = [];

    if (tournament_id && tournament_id !== 'ALL') {
      params.push(tournament_id);
      tournamentCondition = ` AND m.tournament_id = $${params.length}`;
    }

    const query = `
      WITH completed_matches AS (
        SELECT
          m.id AS match_id,
          m.tournament_id,
          m.participant_a,
          m.participant_b,
          r.score_a,
          r.score_b,
          r.winner
        FROM matches m
        JOIN results r ON m.id = r.match_id
        WHERE m.status = 'COMPLETED' ${tournamentCondition}
      ),
      participant_stats AS (
        SELECT
          u.id AS user_id,
          u.name AS participant_name,
          u.email AS participant_email,
          COUNT(cm.match_id) AS matches_played,
          COUNT(CASE WHEN cm.winner = u.id THEN 1 END) AS wins,
          COUNT(CASE WHEN cm.winner IS NULL AND cm.score_a = cm.score_b THEN 1 END) AS draws,
          COUNT(CASE WHEN cm.winner IS NOT NULL AND cm.winner != u.id THEN 1 END) AS losses
        FROM users u
        JOIN completed_matches cm ON (u.id = cm.participant_a OR u.id = cm.participant_b)
        WHERE u.role = 'PARTICIPANT'
        GROUP BY u.id, u.name, u.email
      )
      SELECT
        user_id,
        participant_name,
        participant_email,
        matches_played,
        wins,
        losses,
        draws,
        ((wins * 3) + (draws * 1)) AS points
      FROM participant_stats
      ORDER BY points DESC, wins DESC, matches_played DESC, participant_name ASC
    `;

    const result = await db.query(query, params);

    // Add rank numbering
    const leaderboard = result.rows.map((row, index) => ({
      rank: index + 1,
      ...row,
      matches_played: parseInt(row.matches_played, 10),
      wins: parseInt(row.wins, 10),
      losses: parseInt(row.losses, 10),
      draws: parseInt(row.draws, 10),
      points: parseInt(row.points, 10)
    }));

    res.json({
      success: true,
      count: leaderboard.length,
      leaderboard
    });
  } catch (err) {
    console.error('getLeaderboard error:', err);
    res.status(500).json({ success: false, message: 'Failed to generate leaderboard.' });
  }
};
