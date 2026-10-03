const bcrypt = require('bcryptjs');
const { pool } = require('../config/db');

async function seed() {
  try {
    console.log('Seeding RedPoint database...');

    // 1. Clear existing data
    await pool.query('TRUNCATE TABLE results, matches, participants, categories, tournaments, users RESTART IDENTITY CASCADE');

    // 2. Insert Admin & Participants
    const adminPasswordHash = await bcrypt.hash('admin123', 10);
    const studentPasswordHash = await bcrypt.hash('student123', 10);

    const userInserts = [
      { name: 'System Administrator', email: 'admin@redpoint.com', password: adminPasswordHash, role: 'ADMIN' },
      { name: 'Arun Kumar', email: 'arun.kumar@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Ravi Sharma', email: 'ravi.sharma@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Priya Patel', email: 'priya.patel@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Divya Reddy', email: 'divya.reddy@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Rohan Gupta', email: 'rohan.gupta@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Sneha Nair', email: 'sneha.nair@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Aditya Verma', email: 'aditya.verma@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Ananya Iyer', email: 'ananya.iyer@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Vikram Singh', email: 'vikram.singh@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Pooja Joshi', email: 'pooja.joshi@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Rahul Deshmukh', email: 'rahul.deshmukh@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Meera Menon', email: 'meera.menon@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Karthik Rajan', email: 'karthik.rajan@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Kavita Rao', email: 'kavita.rao@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Sanjay Menon', email: 'sanjay.menon@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' },
      { name: 'Neha Kulkarni', email: 'neha.kulkarni@college.edu', password: studentPasswordHash, role: 'PARTICIPANT' }
    ];

    const usersMap = {};
    for (const u of userInserts) {
      const res = await pool.query(
        'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
        [u.name, u.email, u.password, u.role]
      );
      usersMap[u.email] = res.rows[0];
    }
    console.log(`Created ${Object.keys(usersMap).length} users.`);

    // 3. Insert Tournaments (5 tournaments)
    const tournaments = [
      {
        name: 'Annual Badminton Championship',
        sport: 'Badminton',
        description: 'The premier college badminton tournament featuring singles and doubles categories for all departments.',
        venue: 'Indoor Sports Complex - Badminton Hall',
        event_date: '2026-10-15',
        registration_deadline: '2026-10-12',
        status: 'ONGOING'
      },
      {
        name: 'Inter Department Cricket Cup',
        sport: 'Cricket',
        description: '10-over cricket tournament contested between all engineering and science departments.',
        venue: 'College Main Oval Ground',
        event_date: '2026-10-20',
        registration_deadline: '2026-10-18',
        status: 'UPCOMING'
      },
      {
        name: 'Volleyball Championship',
        sport: 'Volleyball',
        description: 'Inter-collegiate volleyball tournament testing teamwork, agility, and spikers.',
        venue: 'Outdoor Volleyball Court 1',
        event_date: '2026-10-25',
        registration_deadline: '2026-10-22',
        status: 'UPCOMING'
      },
      {
        name: 'Table Tennis Tournament',
        sport: 'Table Tennis',
        description: 'Fast-paced table tennis showdown across men and women singles brackets.',
        venue: 'Student Activity Center - TT Arena',
        event_date: '2026-10-10',
        registration_deadline: '2026-10-08',
        status: 'ONGOING'
      },
      {
        name: 'Annual Basketball Championship',
        sport: 'Basketball',
        description: '5v5 high-intensity collegiate basketball tournament.',
        venue: 'Main Gymnasium Basketball Arena',
        event_date: '2026-09-28',
        registration_deadline: '2026-09-24',
        status: 'COMPLETED'
      }
    ];

    const tMap = {};
    for (const t of tournaments) {
      const res = await pool.query(
        'INSERT INTO tournaments (name, sport, description, venue, event_date, registration_deadline, status) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id, name',
        [t.name, t.sport, t.description, t.venue, t.event_date, t.registration_deadline, t.status]
      );
      tMap[t.name] = res.rows[0].id;
    }
    console.log(`Created ${tournaments.length} tournaments.`);

    // 4. Insert Categories (12 categories)
    const categories = [
      { tName: 'Annual Badminton Championship', name: "Men's Singles", gender: 'Men', format: 'Singles' },
      { tName: 'Annual Badminton Championship', name: "Women's Singles", gender: 'Women', format: 'Singles' },
      { tName: 'Annual Badminton Championship', name: "Men's Doubles", gender: 'Men', format: 'Doubles' },
      { tName: 'Annual Badminton Championship', name: "Mixed Doubles", gender: 'Mixed', format: 'Doubles' },

      { tName: 'Inter Department Cricket Cup', name: "Men's Team (T10)", gender: 'Men', format: 'Team' },
      { tName: 'Inter Department Cricket Cup', name: "Women's Team (T10)", gender: 'Women', format: 'Team' },

      { tName: 'Volleyball Championship', name: "Men's Team", gender: 'Men', format: 'Team' },
      { tName: 'Volleyball Championship', name: "Women's Team", gender: 'Women', format: 'Team' },

      { tName: 'Table Tennis Tournament', name: "Men's Singles", gender: 'Men', format: 'Singles' },
      { tName: 'Table Tennis Tournament', name: "Women's Singles", gender: 'Women', format: 'Singles' },

      { tName: 'Annual Basketball Championship', name: "Men's 5v5", gender: 'Men', format: 'Team' },
      { tName: 'Annual Basketball Championship', name: "Women's 5v5", gender: 'Women', format: 'Team' }
    ];

    const catMap = {};
    for (const c of categories) {
      const tId = tMap[c.tName];
      const res = await pool.query(
        'INSERT INTO categories (tournament_id, name, gender, format) VALUES ($1, $2, $3, $4) RETURNING id, name, tournament_id',
        [tId, c.name, c.gender, c.format]
      );
      catMap[`${c.tName} - ${c.name}`] = res.rows[0].id;
    }
    console.log(`Created ${categories.length} categories.`);

    // 5. Insert Registrations (24 registrations)
    const registrations = [
      // Badminton
      { email: 'arun.kumar@college.edu', tName: 'Annual Badminton Championship' },
      { email: 'ravi.sharma@college.edu', tName: 'Annual Badminton Championship' },
      { email: 'priya.patel@college.edu', tName: 'Annual Badminton Championship' },
      { email: 'divya.reddy@college.edu', tName: 'Annual Badminton Championship' },
      { email: 'rohan.gupta@college.edu', tName: 'Annual Badminton Championship' },
      { email: 'sneha.nair@college.edu', tName: 'Annual Badminton Championship' },

      // Table Tennis
      { email: 'arun.kumar@college.edu', tName: 'Table Tennis Tournament' },
      { email: 'aditya.verma@college.edu', tName: 'Table Tennis Tournament' },
      { email: 'vikram.singh@college.edu', tName: 'Table Tennis Tournament' },
      { email: 'rahul.deshmukh@college.edu', tName: 'Table Tennis Tournament' },
      { email: 'priya.patel@college.edu', tName: 'Table Tennis Tournament' },
      { email: 'ananya.iyer@college.edu', tName: 'Table Tennis Tournament' },
      { email: 'pooja.joshi@college.edu', tName: 'Table Tennis Tournament' },
      { email: 'neha.kulkarni@college.edu', tName: 'Table Tennis Tournament' },

      // Cricket
      { email: 'rohan.gupta@college.edu', tName: 'Inter Department Cricket Cup' },
      { email: 'karthik.rajan@college.edu', tName: 'Inter Department Cricket Cup' },
      { email: 'sanjay.menon@college.edu', tName: 'Inter Department Cricket Cup' },
      { email: 'vikram.singh@college.edu', tName: 'Inter Department Cricket Cup' },

      // Volleyball
      { email: 'aditya.verma@college.edu', tName: 'Volleyball Championship' },
      { email: 'karthik.rajan@college.edu', tName: 'Volleyball Championship' },
      { email: 'meera.menon@college.edu', tName: 'Volleyball Championship' },
      { email: 'kavita.rao@college.edu', tName: 'Volleyball Championship' },

      // Basketball
      { email: 'arun.kumar@college.edu', tName: 'Annual Basketball Championship' },
      { email: 'ravi.sharma@college.edu', tName: 'Annual Basketball Championship' },
      { email: 'divya.reddy@college.edu', tName: 'Annual Basketball Championship' },
      { email: 'sneha.nair@college.edu', tName: 'Annual Basketball Championship' }
    ];

    for (const r of registrations) {
      const u = usersMap[r.email];
      const tId = tMap[r.tName];
      if (u && tId) {
        await pool.query(
          'INSERT INTO participants (tournament_id, user_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [tId, u.id]
        );
      }
    }
    console.log(`Created ${registrations.length} registrations.`);

    // 6. Insert Matches (16 matches: 10 completed, 6 scheduled)
    const matchesData = [
      // Completed Badminton Matches
      {
        tName: 'Annual Badminton Championship',
        cName: "Men's Singles",
        playerA: 'arun.kumar@college.edu',
        playerB: 'ravi.sharma@college.edu',
        date: '2026-10-01',
        time: '10:00 AM',
        venue: 'Badminton Court 1',
        status: 'COMPLETED',
        scoreA: 21,
        scoreB: 18,
        winner: 'arun.kumar@college.edu'
      },
      {
        tName: 'Annual Badminton Championship',
        cName: "Women's Singles",
        playerA: 'priya.patel@college.edu',
        playerB: 'divya.reddy@college.edu',
        date: '2026-10-01',
        time: '11:00 AM',
        venue: 'Badminton Court 2',
        status: 'COMPLETED',
        scoreA: 15,
        scoreB: 21,
        winner: 'divya.reddy@college.edu'
      },
      {
        tName: 'Annual Badminton Championship',
        cName: "Men's Singles",
        playerA: 'rohan.gupta@college.edu',
        playerB: 'arun.kumar@college.edu',
        date: '2026-10-02',
        time: '02:00 PM',
        venue: 'Badminton Court 1',
        status: 'COMPLETED',
        scoreA: 19,
        scoreB: 21,
        winner: 'arun.kumar@college.edu'
      },
      {
        tName: 'Annual Badminton Championship',
        cName: "Women's Singles",
        playerA: 'sneha.nair@college.edu',
        playerB: 'priya.patel@college.edu',
        date: '2026-10-02',
        time: '03:30 PM',
        venue: 'Badminton Court 2',
        status: 'COMPLETED',
        scoreA: 17,
        scoreB: 21,
        winner: 'priya.patel@college.edu'
      },

      // Completed Table Tennis Matches
      {
        tName: 'Table Tennis Tournament',
        cName: "Men's Singles",
        playerA: 'aditya.verma@college.edu',
        playerB: 'vikram.singh@college.edu',
        date: '2026-10-01',
        time: '09:30 AM',
        venue: 'TT Table 1',
        status: 'COMPLETED',
        scoreA: 3,
        scoreB: 1,
        winner: 'aditya.verma@college.edu'
      },
      {
        tName: 'Table Tennis Tournament',
        cName: "Men's Singles",
        playerA: 'rahul.deshmukh@college.edu',
        playerB: 'aditya.verma@college.edu',
        date: '2026-10-02',
        time: '11:30 AM',
        venue: 'TT Table 1',
        status: 'COMPLETED',
        scoreA: 0,
        scoreB: 3,
        winner: 'aditya.verma@college.edu'
      },
      {
        tName: 'Table Tennis Tournament',
        cName: "Women's Singles",
        playerA: 'ananya.iyer@college.edu',
        playerB: 'pooja.joshi@college.edu',
        date: '2026-10-01',
        time: '01:00 PM',
        venue: 'TT Table 2',
        status: 'COMPLETED',
        scoreA: 3,
        scoreB: 2,
        winner: 'ananya.iyer@college.edu'
      },
      {
        tName: 'Table Tennis Tournament',
        cName: "Women's Singles",
        playerA: 'neha.kulkarni@college.edu',
        playerB: 'ananya.iyer@college.edu',
        date: '2026-10-02',
        time: '04:00 PM',
        venue: 'TT Table 2',
        status: 'COMPLETED',
        scoreA: 1,
        scoreB: 3,
        winner: 'ananya.iyer@college.edu'
      },

      // Completed Basketball Matches
      {
        tName: 'Annual Basketball Championship',
        cName: "Men's 5v5",
        playerA: 'arun.kumar@college.edu',
        playerB: 'ravi.sharma@college.edu',
        date: '2026-09-27',
        time: '04:00 PM',
        venue: 'Main Gym Court',
        status: 'COMPLETED',
        scoreA: 54,
        scoreB: 48,
        winner: 'arun.kumar@college.edu'
      },
      {
        tName: 'Annual Basketball Championship',
        cName: "Women's 5v5",
        playerA: 'divya.reddy@college.edu',
        playerB: 'sneha.nair@college.edu',
        date: '2026-09-28',
        time: '05:30 PM',
        venue: 'Main Gym Court',
        status: 'COMPLETED',
        scoreA: 42,
        scoreB: 38,
        winner: 'divya.reddy@college.edu'
      },

      // Scheduled Matches (Upcoming)
      {
        tName: 'Annual Badminton Championship',
        cName: "Men's Singles",
        playerA: 'arun.kumar@college.edu',
        playerB: 'rohan.gupta@college.edu',
        date: '2026-10-15',
        time: '10:00 AM',
        venue: 'Indoor Sports Complex - Court 1',
        status: 'SCHEDULED'
      },
      {
        tName: 'Annual Badminton Championship',
        cName: "Women's Singles",
        playerA: 'divya.reddy@college.edu',
        playerB: 'priya.patel@college.edu',
        date: '2026-10-15',
        time: '11:30 AM',
        venue: 'Indoor Sports Complex - Court 1',
        status: 'SCHEDULED'
      },
      {
        tName: 'Inter Department Cricket Cup',
        cName: "Men's Team (T10)",
        playerA: 'rohan.gupta@college.edu',
        playerB: 'karthik.rajan@college.edu',
        date: '2026-10-20',
        time: '09:00 AM',
        venue: 'College Main Oval Ground',
        status: 'SCHEDULED'
      },
      {
        tName: 'Inter Department Cricket Cup',
        cName: "Men's Team (T10)",
        playerA: 'sanjay.menon@college.edu',
        playerB: 'vikram.singh@college.edu',
        date: '2026-10-20',
        time: '01:30 PM',
        venue: 'College Main Oval Ground',
        status: 'SCHEDULED'
      },
      {
        tName: 'Volleyball Championship',
        cName: "Men's Team",
        playerA: 'aditya.verma@college.edu',
        playerB: 'karthik.rajan@college.edu',
        date: '2026-10-25',
        time: '10:00 AM',
        venue: 'Outdoor Volleyball Court 1',
        status: 'SCHEDULED'
      },
      {
        tName: 'Table Tennis Tournament',
        cName: "Men's Singles",
        playerA: 'aditya.verma@college.edu',
        playerB: 'arun.kumar@college.edu',
        date: '2026-10-10',
        time: '02:00 PM',
        venue: 'Student Activity Center - TT Arena',
        status: 'SCHEDULED'
      }
    ];

    let matchCount = 0;
    let resultCount = 0;

    for (const m of matchesData) {
      const tId = tMap[m.tName];
      const cId = catMap[`${m.tName} - ${m.cName}`];
      const pA = usersMap[m.playerA]?.id;
      const pB = usersMap[m.playerB]?.id;

      const mRes = await pool.query(
        `INSERT INTO matches (tournament_id, category_id, participant_a, participant_b, match_date, match_time, venue, status)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [tId, cId, pA, pB, m.date, m.time, m.venue, m.status]
      );
      matchCount++;

      if (m.status === 'COMPLETED') {
        const winnerId = usersMap[m.winner]?.id;
        await pool.query(
          `INSERT INTO results (match_id, score_a, score_b, winner, result_date)
           VALUES ($1, $2, $3, $4, $5)`,
          [mRes.rows[0].id, m.scoreA, m.scoreB, winnerId, `${m.date} 18:00:00`]
        );
        resultCount++;
      }
    }

    console.log(`Created ${matchCount} matches and ${resultCount} results.`);
    console.log('Database seeded successfully!');
  } catch (err) {
    console.error('Error seeding database:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  seed();
}

module.exports = seed;
