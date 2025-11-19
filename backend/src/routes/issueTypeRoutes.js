import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'qa_bugtracking',
  password: process.env.DB_PASSWORD || 'password',
  port: process.env.DB_PORT || 5432,
});

// Get all issue types
router.get('/', async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - GET /api/issue-types`);
    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');

    const result = await pool.query(
      'SELECT * FROM issue_types ORDER BY created_at DESC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching issue types:', error);
    res.status(500).json({ error: 'Failed to fetch issue types' });
  }
});

// Create a new issue type
router.post('/', async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - POST /api/issue-types`);
    const { name, icon, color, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Issue type name is required' });
    }

    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');

    // Check if issue type already exists
    const existingType = await pool.query(
      'SELECT id FROM issue_types WHERE LOWER(name) = LOWER($1)',
      [name]
    );

    if (existingType.rows.length > 0) {
      return res.status(400).json({ error: 'Issue type with this name already exists' });
    }

    const result = await pool.query(
      'INSERT INTO issue_types (name, icon, color, description, created_at, updated_at) VALUES ($1, $2, $3, $4, NOW(), NOW()) RETURNING *',
      [name, icon || 'bug_report', color || '#ef4444', description || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating issue type:', error);
    res.status(500).json({ error: 'Failed to create issue type' });
  }
});

// Update an issue type
router.put('/:id', async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - PUT /api/issue-types/${req.params.id}`);
    const { id } = req.params;
    const { name, icon, color, description } = req.body;

    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');

    const result = await pool.query(
      'UPDATE issue_types SET name = $1, icon = $2, color = $3, description = $4, updated_at = NOW() WHERE id = $5 RETURNING *',
      [name, icon, color, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue type not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating issue type:', error);
    res.status(500).json({ error: 'Failed to update issue type' });
  }
});

// Delete an issue type
router.delete('/:id', async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - DELETE /api/issue-types/${req.params.id}`);
    const { id } = req.params;

    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');

    const result = await pool.query(
      'DELETE FROM issue_types WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue type not found' });
    }

    res.json({ message: 'Issue type deleted successfully' });
  } catch (error) {
    console.error('Error deleting issue type:', error);
    res.status(500).json({ error: 'Failed to delete issue type' });
  }
});

export default router;