// Labels API routes
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

// Get all labels
router.get('/', async (req, res) => {
  try {
    console.log('✅ Connected to PostgreSQL database');
    const result = await pool.query('SELECT * FROM labels ORDER BY name ASC');
    res.json(result.rows);
  } catch (error) {
    console.error('Get labels error:', error);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

// Create a new label
router.post('/', async (req, res) => {
  try {
    console.log('Creating label with data:', req.body);
    const { name, color, description } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    console.log('✅ Connected to PostgreSQL database');
    const result = await pool.query(
      'INSERT INTO labels (name, color, description) VALUES ($1, $2, $3) RETURNING *',
      [name, color, description || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create label error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Label with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create label' });
    }
  }
});

// Update a label
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, color, description } = req.body;

    if (!name || !color) {
      return res.status(400).json({ error: 'Name and color are required' });
    }

    console.log('✅ Connected to PostgreSQL database');
    const result = await pool.query(
      'UPDATE labels SET name = $1, color = $2, description = $3, updated_at = CURRENT_TIMESTAMP WHERE id = $4 RETURNING *',
      [name, color, description || '', id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update label error:', error);
    if (error.code === '23505') { // Unique constraint violation
      res.status(409).json({ error: 'Label with this name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to update label' });
    }
  }
});

// Delete a label
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('✅ Connected to PostgreSQL database');
    // Check if label is in use
    const usageCheck = await pool.query(
      'SELECT COUNT(*) FROM issue_labels WHERE label_id = $1',
      [id]
    );

    if (parseInt(usageCheck.rows[0].count) > 0) {
      return res.status(409).json({ 
        error: 'Cannot delete label: it is currently in use by issues' 
      });
    }

    const result = await pool.query('DELETE FROM labels WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json({ message: 'Label deleted successfully' });
  } catch (error) {
    console.error('Delete label error:', error);
    res.status(500).json({ error: 'Failed to delete label' });
  }
});

export default router;