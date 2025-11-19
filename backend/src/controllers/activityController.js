import pool from '../config/database.js';

export const getActivitiesByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await pool.query(
      `SELECT a.*, u.name as user_name, u.avatar as user_avatar, u.role as user_role
       FROM activities a
       LEFT JOIN users u ON a.user_id = u.id
       WHERE a.project_id = $1
       ORDER BY a.timestamp DESC
       LIMIT 50`,
      [projectId]
    );

    const formattedActivities = result.rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      user: {
        id: row.user_id,
        name: row.user_name,
        avatar: row.user_avatar,
        role: row.user_role
      },
      action: row.action,
      details: row.details,
      timestamp: row.timestamp
    }));

    res.json(formattedActivities);
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createActivity = async (req, res) => {
  try {
    const { projectId, action, details } = req.body;

    if (!projectId || !action) {
      return res.status(400).json({ error: 'Project ID and action are required' });
    }

    const result = await pool.query(
      'INSERT INTO activities (project_id, user_id, action, details) VALUES ($1, $2, $3, $4) RETURNING *',
      [projectId, req.user.id, action, details]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
