const db = require('../config/db');

// GET /api/categories
exports.getAllCategories = async (req, res) => {
  try {
    const { tournament_id } = req.query;
    let query = `
      SELECT c.*, t.name as tournament_name, t.sport as tournament_sport,
        COUNT(DISTINCT m.id) as match_count
      FROM categories c
      JOIN tournaments t ON c.tournament_id = t.id
      LEFT JOIN matches m ON c.id = m.category_id
    `;
    const params = [];

    if (tournament_id) {
      params.push(tournament_id);
      query += ` WHERE c.tournament_id = $1`;
    }

    query += ` GROUP BY c.id, t.name, t.sport ORDER BY t.name ASC, c.name ASC`;

    const result = await db.query(query, params);
    res.json({ success: true, count: result.rows.length, categories: result.rows });
  } catch (err) {
    console.error('getAllCategories error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories.' });
  }
};

// GET /api/categories/tournament/:tournamentId
exports.getCategoriesByTournament = async (req, res) => {
  try {
    const { tournamentId } = req.params;
    const result = await db.query(
      `SELECT c.*, t.name as tournament_name
       FROM categories c
       JOIN tournaments t ON c.tournament_id = t.id
       WHERE c.tournament_id = $1
       ORDER BY c.id ASC`,
      [tournamentId]
    );

    res.json({ success: true, count: result.rows.length, categories: result.rows });
  } catch (err) {
    console.error('getCategoriesByTournament error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve categories for tournament.' });
  }
};

// GET /api/categories/:id
exports.getCategoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query(
      `SELECT c.*, t.name as tournament_name
       FROM categories c
       JOIN tournaments t ON c.tournament_id = t.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, category: result.rows[0] });
  } catch (err) {
    console.error('getCategoryById error:', err);
    res.status(500).json({ success: false, message: 'Failed to retrieve category.' });
  }
};

// POST /api/categories
exports.createCategory = async (req, res) => {
  try {
    const { tournament_id, name, gender, format } = req.body;

    if (!tournament_id || !name || !gender || !format) {
      return res.status(400).json({ success: false, message: 'All category fields are required.' });
    }

    // Verify tournament exists
    const tCheck = await db.query('SELECT id FROM tournaments WHERE id = $1', [tournament_id]);
    if (tCheck.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Tournament not found.' });
    }

    const result = await db.query(
      `INSERT INTO categories (tournament_id, name, gender, format)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [tournament_id, name.trim(), gender.trim(), format.trim()]
    );

    res.status(201).json({
      success: true,
      message: 'Category created successfully.',
      category: result.rows[0]
    });
  } catch (err) {
    console.error('createCategory error:', err);
    res.status(500).json({ success: false, message: 'Unable to create category.' });
  }
};

// PUT /api/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { tournament_id, name, gender, format } = req.body;

    const existing = await db.query('SELECT * FROM categories WHERE id = $1', [id]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    const cur = existing.rows[0];
    const newTournamentId = tournament_id || cur.tournament_id;
    const newName = name !== undefined ? name.trim() : cur.name;
    const newGender = gender !== undefined ? gender.trim() : cur.gender;
    const newFormat = format !== undefined ? format.trim() : cur.format;

    const result = await db.query(
      `UPDATE categories
       SET tournament_id = $1, name = $2, gender = $3, format = $4
       WHERE id = $5
       RETURNING *`,
      [newTournamentId, newName, newGender, newFormat, id]
    );

    res.json({
      success: true,
      message: 'Category updated successfully.',
      category: result.rows[0]
    });
  } catch (err) {
    console.error('updateCategory error:', err);
    res.status(500).json({ success: false, message: 'Failed to update category.' });
  }
};

// DELETE /api/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Category not found.' });
    }

    res.json({ success: true, message: 'Category deleted successfully.' });
  } catch (err) {
    console.error('deleteCategory error:', err);
    res.status(500).json({ success: false, message: 'Failed to delete category.' });
  }
};
