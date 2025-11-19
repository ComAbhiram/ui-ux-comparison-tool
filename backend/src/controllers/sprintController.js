import pool from '../config/database.js';

// Get all sprints for a project
export const getSprintsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await pool.query(
      `SELECT s.*,
              COUNT(DISTINCT i.id) as issue_count,
              SUM(CASE WHEN i.status = 'Closed' THEN 1 ELSE 0 END) as completed_count
       FROM sprints s
       LEFT JOIN issues i ON s.id = i.sprint_id
       WHERE s.project_id = $1
       GROUP BY s.id
       ORDER BY s.start_date DESC`,
      [projectId]
    );

    const sprints = result.rows.map(row => ({
      id: row.id,
      projectId: row.project_id,
      name: row.name,
      goal: row.goal,
      startDate: row.start_date,
      endDate: row.end_date,
      status: row.status,
      issueCount: parseInt(row.issue_count) || 0,
      completedCount: parseInt(row.completed_count) || 0,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(sprints);
  } catch (error) {
    console.error('Get sprints error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get sprint by ID with issues
export const getSprintById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const sprintResult = await pool.query(
      'SELECT * FROM sprints WHERE id = $1',
      [id]
    );

    if (sprintResult.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    const sprint = sprintResult.rows[0];

    // Get issues in this sprint
    const issuesResult = await pool.query(
      `SELECT i.*, 
              u1.name as assigned_to_name, u1.email as assigned_to_email,
              u2.name as reported_by_name, u2.email as reported_by_email
       FROM issues i
       LEFT JOIN users u1 ON i.assigned_to = u1.id
       LEFT JOIN users u2 ON i.reported_by = u2.id
       WHERE i.sprint_id = $1
       ORDER BY i.created_at DESC`,
      [id]
    );

    const issues = issuesResult.rows.map(row => ({
      id: row.id,
      bugId: row.bug_id,
      projectId: row.project_id,
      moduleName: row.module_name,
      type: row.type,
      severity: row.severity,
      status: row.status,
      priority: row.priority,
      description: row.description,
      assignedTo: row.assigned_to ? {
        id: row.assigned_to,
        name: row.assigned_to_name,
        email: row.assigned_to_email
      } : null,
      reportedBy: row.reported_by ? {
        id: row.reported_by,
        name: row.reported_by_name,
        email: row.reported_by_email
      } : null,
      storyPoints: row.story_points,
      timeEstimate: row.time_estimate,
      timeSpent: row.time_spent,
      createdAt: row.created_at
    }));

    res.json({
      id: sprint.id,
      projectId: sprint.project_id,
      name: sprint.name,
      goal: sprint.goal,
      startDate: sprint.start_date,
      endDate: sprint.end_date,
      status: sprint.status,
      issues,
      createdAt: sprint.created_at,
      updatedAt: sprint.updated_at
    });
  } catch (error) {
    console.error('Get sprint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new sprint
export const createSprint = async (req, res) => {
  try {
    const { projectId, name, goal, startDate, endDate } = req.body;

    if (!projectId || !name || !startDate || !endDate) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const sprintId = `sprint-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO sprints (id, project_id, name, goal, start_date, end_date, status)
       VALUES ($1, $2, $3, $4, $5, $6, 'Planning')
       RETURNING *`,
      [sprintId, projectId, name, goal, startDate, endDate]
    );

    const sprint = {
      id: result.rows[0].id,
      projectId: result.rows[0].project_id,
      name: result.rows[0].name,
      goal: result.rows[0].goal,
      startDate: result.rows[0].start_date,
      endDate: result.rows[0].end_date,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.status(201).json(sprint);
  } catch (error) {
    console.error('Create sprint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update sprint
export const updateSprint = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, goal, startDate, endDate, status } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }
    if (goal !== undefined) {
      updates.push(`goal = $${paramCount}`);
      params.push(goal);
      paramCount++;
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramCount}`);
      params.push(startDate);
      paramCount++;
    }
    if (endDate !== undefined) {
      updates.push(`end_date = $${paramCount}`);
      params.push(endDate);
      paramCount++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await pool.query(
      `UPDATE sprints SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    res.json({
      id: result.rows[0].id,
      projectId: result.rows[0].project_id,
      name: result.rows[0].name,
      goal: result.rows[0].goal,
      startDate: result.rows[0].start_date,
      endDate: result.rows[0].end_date,
      status: result.rows[0].status,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Update sprint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete sprint
export const deleteSprint = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove sprint reference from issues
    await pool.query('UPDATE issues SET sprint_id = NULL WHERE sprint_id = $1', [id]);

    // Delete sprint
    const result = await pool.query('DELETE FROM sprints WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Sprint not found' });
    }

    res.json({ message: 'Sprint deleted successfully' });
  } catch (error) {
    console.error('Delete sprint error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
