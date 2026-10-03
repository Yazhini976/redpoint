const db = require('../config/db');

// GET /api/stats/admin
exports.getAdminStats = async (req, res) => {
  try {
    const totalTournamentsRes = await db.query('SELECT COUNT(*) FROM tournaments');
    const upcomingTournamentsRes = await db.query("SELECT COUNT(*) FROM tournaments WHERE status = 'UPCOMING'");
    const totalParticipantsRes = await db.query("SELECT COUNT(*) FROM users WHERE role = 'PARTICIPANT'");
    const totalMatchesRes = await db.query('SELECT COUNT(*) FROM matches');

    // Upcoming tournaments
    const upcomingListRes = await db.query(`
      SELECT t.*, COUNT(p.id) as participant_count
      FROM tournaments t
      LEFT JOIN participants p ON t.id = p.tournament_id
      WHERE t.status IN ('UPCOMING', 'ONGOING')
      GROUP BY t.id
      ORDER BY t.event_date ASC
      LIMIT 5
    `);

    // Recent results
    const recentResultsRes = await db.query(`
      SELECT r.*, m.match_date, m.match_time,
        t.name as tournament_name, t.sport,
        c.name as category_name,
        ua.name as player_a_name, ub.name as player_b_name,
        uw.name as winner_name
      FROM results r
      JOIN matches m ON r.match_id = m.id
      JOIN tournaments t ON m.tournament_id = t.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users ua ON m.participant_a = ua.id
      LEFT JOIN users ub ON m.participant_b = ub.id
      LEFT JOIN users uw ON r.winner = uw.id
      ORDER BY r.result_date DESC
      LIMIT 5
    `);

    // Chart data: Tournament participation (number of participants per tournament)
    const chartRes = await db.query(`
      SELECT t.name, COUNT(p.id) as participant_count
      FROM tournaments t
      LEFT JOIN participants p ON t.id = p.tournament_id
      GROUP BY t.id, t.name
      ORDER BY participant_count DESC, t.id ASC
      LIMIT 6
    `);

    res.json({
      success: true,
      stats: {
        totalTournaments: parseInt(totalTournamentsRes.rows[0].count, 10),
        upcomingTournaments: parseInt(upcomingTournamentsRes.rows[0].count, 10),
        totalParticipants: parseInt(totalParticipantsRes.rows[0].count, 10),
        totalMatches: parseInt(totalMatchesRes.rows[0].count, 10),
        upcomingTournamentsList: upcomingListRes.rows,
        recentResults: recentResultsRes.rows,
        chartData: {
          labels: chartRes.rows.map(r => r.name),
          data: chartRes.rows.map(r => parseInt(r.participant_count, 10))
        }
      }
    });
  } catch (err) {
    console.error('getAdminStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats.' });
  }
};

// GET /api/stats/participant
exports.getParticipantStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Registered tournaments count
    const regCountRes = await db.query(
      'SELECT COUNT(*) FROM participants WHERE user_id = $1',
      [userId]
    );

    // Upcoming matches count (scheduled matches where user is player A or B)
    const upcomingMatchesRes = await db.query(`
      SELECT COUNT(*)
      FROM matches
      WHERE status = 'SCHEDULED' AND (participant_a = $1 OR participant_b = $1)
    `, [userId]);

    // Completed matches count
    const completedMatchesRes = await db.query(`
      SELECT COUNT(*)
      FROM matches
      WHERE status = 'COMPLETED' AND (participant_a = $1 OR participant_b = $1)
    `, [userId]);

    // Wins count
    const winsRes = await db.query(`
      SELECT COUNT(*)
      FROM results
      WHERE winner = $1
    `, [userId]);

    // Upcoming matches list
    const upcomingList = await db.query(`
      SELECT m.*,
        t.name as tournament_name, t.sport,
        c.name as category_name,
        ua.name as player_a_name, ub.name as player_b_name
      FROM matches m
      JOIN tournaments t ON m.tournament_id = t.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users ua ON m.participant_a = ua.id
      LEFT JOIN users ub ON m.participant_b = ub.id
      WHERE m.status = 'SCHEDULED' AND (m.participant_a = $1 OR m.participant_b = $1)
      ORDER BY m.match_date ASC, m.match_time ASC
      LIMIT 5
    `, [userId]);

    // Recent results for this participant
    const participantResults = await db.query(`
      SELECT r.*, m.match_date, m.match_time,
        t.name as tournament_name, t.sport,
        c.name as category_name,
        ua.name as player_a_name, ub.name as player_b_name,
        uw.name as winner_name
      FROM results r
      JOIN matches m ON r.match_id = m.id
      JOIN tournaments t ON m.tournament_id = t.id
      LEFT JOIN categories c ON m.category_id = c.id
      LEFT JOIN users ua ON m.participant_a = ua.id
      LEFT JOIN users ub ON m.participant_b = ub.id
      LEFT JOIN users uw ON r.winner = uw.id
      WHERE m.participant_a = $1 OR m.participant_b = $1
      ORDER BY r.result_date DESC
      LIMIT 5
    `, [userId]);

    res.json({
      success: true,
      stats: {
        registeredTournaments: parseInt(regCountRes.rows[0].count, 10),
        upcomingMatches: parseInt(upcomingMatchesRes.rows[0].count, 10),
        completedMatches: parseInt(completedMatchesRes.rows[0].count, 10),
        wins: parseInt(winsRes.rows[0].count, 10),
        upcomingMatchesList: upcomingList.rows,
        recentResults: participantResults.rows
      }
    });
  } catch (err) {
    console.error('getParticipantStats error:', err);
    res.status(500).json({ success: false, message: 'Failed to fetch participant stats.' });
  }
};
