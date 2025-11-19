import pool from '../config/database.js';

// Get all epics for a project
export const getEpicsByProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    
    const result = await pool.query(
      `SELECT e.*,
              u.name as created_by_name,
              COUNT(DISTINCT i.id) as issue_count,
              SUM(CASE WHEN i.status IN ('Fixed', 'Closed') THEN 1 ELSE 0 END) as completed_count
       FROM epics e
       LEFT JOIN users u ON e.created_by = u.id
       LEFT JOIN issues i ON e.id = i.epic_id
       WHERE e.project_id = $1
       GROUP BY e.id, u.name
       ORDER BY e.created_at DESC`,
      [projectId]
    );

    const epics = result.rows.map(row => {
      const issueCount = parseInt(row.issue_count) || 0;
      const completedCount = parseInt(row.completed_count) || 0;
      const progress = issueCount > 0 ? Math.round((completedCount / issueCount) * 100) : 0;

      return {
        id: row.id,
        projectId: row.project_id,
        name: row.name,
        description: row.description,
        status: row.status,
        color: row.color,
        startDate: row.start_date,
        targetDate: row.target_date,
        createdBy: row.created_by,
        createdByName: row.created_by_name,
        issueCount,
        completedCount,
        progress,
        createdAt: row.created_at,
        updatedAt: row.updated_at
      };
    });

    res.json(epics);
  } catch (error) {
    console.error('Get epics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get epic by ID with issues
export const getEpicById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const epicResult = await pool.query(
      `SELECT e.*, u.name as created_by_name
       FROM epics e
       LEFT JOIN users u ON e.created_by = u.id
       WHERE e.id = $1`,
      [id]
    );

    if (epicResult.rows.length === 0) {
      return res.status(404).json({ error: 'Epic not found' });
    }

    const epic = epicResult.rows[0];

    // Get issues in this epic
    const issuesResult = await pool.query(
      `SELECT i.*, 
              u1.name as assigned_to_name, u1.email as assigned_to_email,
              u2.name as reported_by_name, u2.email as reported_by_email
       FROM issues i
       LEFT JOIN users u1 ON i.assigned_to = u1.id
       LEFT JOIN users u2 ON i.reported_by = u2.id
       WHERE i.epic_id = $1
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
      createdAt: row.created_at
    }));

    const completedCount = issues.filter(i => ['Fixed', 'Closed'].includes(i.status)).length;
    const progress = issues.length > 0 ? Math.round((completedCount / issues.length) * 100) : 0;

    res.json({
      id: epic.id,
      projectId: epic.project_id,
      name: epic.name,
      description: epic.description,
      status: epic.status,
      color: epic.color,
      startDate: epic.start_date,
      targetDate: epic.target_date,
      createdBy: epic.created_by,
      createdByName: epic.created_by_name,
      issues,
      progress,
      createdAt: epic.created_at,
      updatedAt: epic.updated_at
    });
  } catch (error) {
    console.error('Get epic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new epic
export const createEpic = async (req, res) => {
  try {
    const { projectId, name, description, color, startDate, targetDate } = req.body;

    if (!projectId || !name) {
      return res.status(400).json({ error: 'Project ID and name are required' });
    }

    const epicId = `epic-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO epics (id, project_id, name, description, status, color, start_date, target_date, created_by)
       VALUES ($1, $2, $3, $4, 'Open', $5, $6, $7, $8)
       RETURNING *`,
      [epicId, projectId, name, description, color || '#3b82f6', startDate, targetDate, req.user.id]
    );

    const epic = {
      id: result.rows[0].id,
      projectId: result.rows[0].project_id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      status: result.rows[0].status,
      color: result.rows[0].color,
      startDate: result.rows[0].start_date,
      targetDate: result.rows[0].target_date,
      createdBy: result.rows[0].created_by,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.status(201).json(epic);
  } catch (error) {
    console.error('Create epic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update epic
export const updateEpic = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, color, startDate, targetDate } = req.body;

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (name !== undefined) {
      updates.push(`name = $${paramCount}`);
      params.push(name);
      paramCount++;
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }
    if (color !== undefined) {
      updates.push(`color = $${paramCount}`);
      params.push(color);
      paramCount++;
    }
    if (startDate !== undefined) {
      updates.push(`start_date = $${paramCount}`);
      params.push(startDate);
      paramCount++;
    }
    if (targetDate !== undefined) {
      updates.push(`target_date = $${paramCount}`);
      params.push(targetDate);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    params.push(id);

    const result = await pool.query(
      `UPDATE epics SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Epic not found' });
    }

    res.json({
      id: result.rows[0].id,
      projectId: result.rows[0].project_id,
      name: result.rows[0].name,
      description: result.rows[0].description,
      status: result.rows[0].status,
      color: result.rows[0].color,
      startDate: result.rows[0].start_date,
      targetDate: result.rows[0].target_date,
      createdBy: result.rows[0].created_by,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    });
  } catch (error) {
    console.error('Update epic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete epic
export const deleteEpic = async (req, res) => {
  try {
    const { id } = req.params;

    // Remove epic reference from issues
    await pool.query('UPDATE issues SET epic_id = NULL WHERE epic_id = $1', [id]);

    // Delete epic
    const result = await pool.query('DELETE FROM epics WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Epic not found' });
    }

    res.json({ message: 'Epic deleted successfully' });
  } catch (error) {
    console.error('Delete epic error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
