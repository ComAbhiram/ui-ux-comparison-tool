// Issue Types API routes
import express from 'express';
import { Pool } from 'pg';

const router = express.Router();

// Database connection
const pool = new Pool({
  user: process.env.DB_USER || 'admin',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'qa_bugtracking',
  password: process.env.DB_PASSWORD || 'admin123',
  port: parseInt(process.env.DB_PORT) || 5432,
});

// Get all issue types
router.get('/', async (req, res) => {
  try {
    console.log('✅ Connected to PostgreSQL database');
    const result = await pool.query('SELECT * FROM issue_types ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get issue types error:', error);
    res.status(500).json({ error: 'Failed to fetch issue types' });
  }
});

// Create a new issue type
router.post('/', async (req, res) => {
  try {
    console.log('Creating issue type with data:', req.body);
    const { name, icon, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('✅ Connected to PostgreSQL database');
    const result = await pool.query(
      'INSERT INTO issue_types (name, icon, description, color) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, icon || 'task_alt', description || '', color || '#6366f1']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create issue type error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Issue type with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create issue type' });
    }
  }
});

// Update an issue type
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, icon, description, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    console.log('✅ Connected to PostgreSQL database');
    const result = await pool.query(
      'UPDATE issue_types SET name = $1, icon = $2, description = $3, color = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
      [name, icon || 'task_alt', description || '', color || '#6366f1', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue type not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update issue type error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Issue type with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update issue type' });
    }
  }
});

// Delete an issue type
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('✅ Connected to PostgreSQL database');
    // Check if issue type is in use
    const usageCheck = await pool.query(
      'SELECT COUNT(*) FROM issues WHERE type = (SELECT name FROM issue_types WHERE id = $1)',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete issue type: it is currently in use by issues' 
      });
    }

    const result = await pool.query('DELETE FROM issue_types WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue type not found' });
    }

    res.json({ message: 'Issue type deleted successfully' });
  } catch (error) {
    console.error('Delete issue type error:', error);
    res.status(500).json({ error: 'Failed to delete issue type' });
  }
});

export default router;