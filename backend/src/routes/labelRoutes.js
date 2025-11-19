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

// Get all labels
router.get('/', async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - GET /api/labels`);
    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');

    const result = await pool.query(
      'SELECT * FROM labels ORDER BY created_at DESC'
    );
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching labels:', error);
    res.status(500).json({ error: 'Failed to fetch labels' });
  }
});

// Create a new label
router.post('/', async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - POST /api/labels`);
    const { name, color, description } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Label name is required' });
    }

    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');

    // Check if label already exists
    const existingLabel = await pool.query(
      'SELECT id FROM labels WHERE LOWER(name) = LOWER($1)',
      [name]
    );

    if (existingLabel.rows.length > 0) {
      return res.status(400).json({ error: 'Label with this name already exists' });
    }

    const result = await pool.query(
      'INSERT INTO labels (name, color, description, created_at, updated_at) VALUES ($1, $2, $3, NOW(), NOW()) RETURNING *',
      [name, color || '#3b82f6', description || '']
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating label:', error);
    res.status(500).json({ error: 'Failed to create label' });
  }
});

// Update a label
router.put('/:id', async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - PUT /api/labels/${req.params.id}`);
    const { id } = req.params;
    const { name, color, description } = req.body;

    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');

    const result = await pool.query(
      'UPDATE labels SET name = $1, color = $2, description = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
      [name, color, description, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error updating label:', error);
    res.status(500).json({ error: 'Failed to update label' });
  }
});

// Delete a label
router.delete('/:id', async (req, res) => {
  try {
    console.log(`${new Date().toISOString()} - DELETE /api/labels/${req.params.id}`);
    const { id } = req.params;

    await pool.query('SELECT 1');
    console.log('✅ Connected to PostgreSQL database');

    const result = await pool.query(
      'DELETE FROM labels WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Label not found' });
    }

    res.json({ message: 'Label deleted successfully' });
  } catch (error) {
    console.error('Error deleting label:', error);
    res.status(500).json({ error: 'Failed to delete label' });
  }
});

export default router;