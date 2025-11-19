import pool from '../config/database.js';

export const getAllIssues = async (req, res) => {
  try {
    const { projectId, status, severity, type, search, sortBy = 'created_at', sortOrder = 'desc' } = req.query;
    
    let query = `
      SELECT i.*,
             p.name as project_name,
             u1.name as assigned_to_name, u1.email as assigned_to_email, u1.avatar as assigned_to_avatar, u1.role as assigned_to_role,
             u2.name as reported_by_name, u2.email as reported_by_email, u2.avatar as reported_by_avatar, u2.role as reported_by_role
      FROM issues i
      LEFT JOIN projects p ON i.project_id = p.id
      LEFT JOIN users u1 ON i.assigned_to = u1.id
      LEFT JOIN users u2 ON i.reported_by = u2.id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    if (projectId) {
      query += ` AND i.project_id = $${paramCount}`;
      params.push(projectId);
      paramCount++;
    }

    if (status) {
      query += ` AND i.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (severity) {
      query += ` AND i.severity = $${paramCount}`;
      params.push(severity);
      paramCount++;
    }

    if (type) {
      query += ` AND i.type = $${paramCount}`;
      params.push(type);
      paramCount++;
    }

    if (search) {
      query += ` AND (i.bug_id ILIKE $${paramCount} OR i.module_name ILIKE $${paramCount} OR i.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    const validSortFields = ['bug_id', 'module_name', 'type', 'severity', 'status', 'created_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toLowerCase() === 'asc' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY i.${sortField} ${order}`;

    const result = await pool.query(query, params);
    
    // Format the response to match frontend structure
    const formattedIssues = result.rows.map(row => ({
      id: row.id,
      bugId: row.bug_id,
      projectId: row.project_id,
      projectName: row.project_name,
      moduleName: row.module_name,
      type: row.type,
      severity: row.severity,
      status: row.status,
      description: row.description,
      assignedTo: {
        id: row.assigned_to,
        name: row.assigned_to_name,
        email: row.assigned_to_email,
        avatar: row.assigned_to_avatar,
        role: row.assigned_to_role
      },
      reportedBy: {
        id: row.reported_by,
        name: row.reported_by_name,
        email: row.reported_by_email,
        avatar: row.reported_by_avatar,
        role: row.reported_by_role
      },
      screenshots: row.screenshots || [],
      relatedLinks: row.related_links || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(formattedIssues);
  } catch (error) {
    console.error('Get issues error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getIssueById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT i.*,
              u1.name as assigned_to_name, u1.email as assigned_to_email, u1.avatar as assigned_to_avatar, u1.role as assigned_to_role,
              u2.name as reported_by_name, u2.email as reported_by_email, u2.avatar as reported_by_avatar, u2.role as reported_by_role
       FROM issues i
       LEFT JOIN users u1 ON i.assigned_to = u1.id
       LEFT JOIN users u2 ON i.reported_by = u2.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const row = result.rows[0];
    const formattedIssue = {
      id: row.id,
      bugId: row.bug_id,
      projectId: row.project_id,
      moduleName: row.module_name,
      type: row.type,
      severity: row.severity,
      status: row.status,
      description: row.description,
      assignedTo: {
        id: row.assigned_to,
        name: row.assigned_to_name,
        email: row.assigned_to_email,
        avatar: row.assigned_to_avatar,
        role: row.assigned_to_role
      },
      reportedBy: {
        id: row.reported_by,
        name: row.reported_by_name,
        email: row.reported_by_email,
        avatar: row.reported_by_avatar,
        role: row.reported_by_role
      },
      screenshots: row.screenshots || [],
      relatedLinks: row.related_links || [],
      createdAt: row.created_at,
      updatedAt: row.updated_at
    };

    res.json(formattedIssue);
  } catch (error) {
    console.error('Get issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createIssue = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      projectId,
      moduleName,
      type,
      severity,
      status = 'Open',
      description,
      assignedTo,
      relatedLinks
    } = req.body;

    // Handle uploaded screenshots
    const screenshots = req.files ? req.files.map(file => `/uploads/${file.filename}`) : [];
    
    console.log('Creating issue with data:', { projectId, moduleName, type, severity, status, description, assignedTo, screenshots });
    console.log('Uploaded files:', req.files);

    if (!projectId || !moduleName || !type || !severity || !description) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Generate unique bug ID
    const bugIdResult = await client.query(
      'SELECT COUNT(*) as count FROM issues WHERE project_id = $1',
      [projectId]
    );
    const issueCount = parseInt(bugIdResult.rows[0].count) + 1;
    const bugId = `BUG-${projectId.split('-')[1]}-${String(issueCount).padStart(3, '0')}`;
    
    const issueId = `issue-${Date.now()}`;
    
    // Insert issue
    const result = await client.query(
      `INSERT INTO issues (id, bug_id, project_id, module_name, type, severity, status, description, assigned_to, reported_by, screenshots, related_links)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
       RETURNING *`,
      [issueId, bugId, projectId, moduleName, type, severity, status, description, assignedTo, req.user.id, screenshots, JSON.stringify(relatedLinks || [])]
    );

    // Log activity
    await client.query(
      'INSERT INTO activities (project_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [projectId, req.user.id, 'Issue Created', `Created issue ${bugId}: ${moduleName}`]
    );

    await client.query('COMMIT');
    res.status(201).json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const updateIssue = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;
    const { moduleName, type, severity, status, description, assignedTo, relatedLinks } = req.body;
    
    // Handle uploaded screenshots (if any new files were uploaded)
    const newScreenshots = req.files ? req.files.map(file => `/uploads/${file.filename}`) : null;
    
    console.log('Updating issue with data:', { id, moduleName, type, severity, status, description, assignedTo, newScreenshots });
    console.log('Uploaded files:', req.files);

    const issueCheck = await client.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (issueCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const updates = [];
    const params = [];
    let paramCount = 1;

    if (moduleName !== undefined) {
      updates.push(`module_name = $${paramCount}`);
      params.push(moduleName);
      paramCount++;
    }

    if (type !== undefined) {
      updates.push(`type = $${paramCount}`);
      params.push(type);
      paramCount++;
    }

    if (severity !== undefined) {
      updates.push(`severity = $${paramCount}`);
      params.push(severity);
      paramCount++;
    }

    if (status !== undefined) {
      updates.push(`status = $${paramCount}`);
      params.push(status);
      paramCount++;
    }

    if (description !== undefined) {
      updates.push(`description = $${paramCount}`);
      params.push(description);
      paramCount++;
    }

    if (assignedTo !== undefined) {
      updates.push(`assigned_to = $${paramCount}`);
      params.push(assignedTo);
      paramCount++;
    }

    if (relatedLinks !== undefined) {
      updates.push(`related_links = $${paramCount}`);
      params.push(JSON.stringify(relatedLinks));
      paramCount++;
    }

    if (newScreenshots !== null) {
      updates.push(`screenshots = $${paramCount}`);
      params.push(newScreenshots);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `
      UPDATE issues
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await client.query(query, params);

    // Log activity
    const issue = issueCheck.rows[0];
    await client.query(
      'INSERT INTO activities (project_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [issue.project_id, req.user.id, 'Issue Updated', `Updated issue ${issue.bug_id}`]
    );

    await client.query('COMMIT');
    res.json(result.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Update issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};

export const deleteIssue = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const { id } = req.params;

    const issueCheck = await client.query('SELECT * FROM issues WHERE id = $1', [id]);
    if (issueCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Issue not found' });
    }

    const issue = issueCheck.rows[0];
    
    await client.query('DELETE FROM issues WHERE id = $1', [id]);

    // Log activity
    await client.query(
      'INSERT INTO activities (project_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [issue.project_id, req.user.id, 'Issue Deleted', `Deleted issue ${issue.bug_id}`]
    );

    await client.query('COMMIT');
    res.json({ message: 'Issue deleted successfully' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Delete issue error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
  }
};
