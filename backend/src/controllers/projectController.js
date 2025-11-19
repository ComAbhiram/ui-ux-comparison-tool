import pool from '../config/database.js';

export const getAllProjects = async (req, res) => {
  try {
    const { status, search } = req.query;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    let query = `
      SELECT p.*, 
             u.name as created_by_name,
             COUNT(DISTINCT pm.user_id) as member_count,
             COUNT(DISTINCT i.id) as total_issues,
             COUNT(DISTINCT CASE WHEN i.status IN ('Fixed', 'Closed') THEN i.id END) as completed_issues
      FROM projects p
      LEFT JOIN users u ON p.created_by = u.id
      LEFT JOIN project_members pm ON p.id = pm.project_id
      LEFT JOIN issues i ON p.id = i.project_id
      WHERE 1=1
    `;
    const params = [];
    let paramCount = 1;

    // Role-based access control:
    // Admin: See all projects
    // QA/Developer: Only see projects they ARE assigned to as members
    if (userRole !== 'Admin') {
      query += ` AND p.id IN (
        SELECT project_id FROM project_members WHERE user_id = $${paramCount}
      )`;
      params.push(userId);
      paramCount++;
    }

    if (status) {
      query += ` AND p.status = $${paramCount}`;
      params.push(status);
      paramCount++;
    }

    if (search) {
      query += ` AND (p.name ILIKE $${paramCount} OR p.description ILIKE $${paramCount})`;
      params.push(`%${search}%`);
      paramCount++;
    }

    query += ' GROUP BY p.id, u.name ORDER BY p.created_at DESC';

    const result = await pool.query(query, params);
    
    // Get members for each project and transform to camelCase
    const projects = await Promise.all(result.rows.map(async (project) => {
      const membersResult = await pool.query(
        `SELECT u.id, u.name, u.email, u.role, u.avatar, u.status, pm.role as project_role
         FROM project_members pm
         JOIN users u ON pm.user_id = u.id
         WHERE pm.project_id = $1`,
        [project.id]
      );

      // Calculate progress based on completed issues
      const totalIssues = parseInt(project.total_issues) || 0;
      const completedIssues = parseInt(project.completed_issues) || 0;
      const progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

      return {
        id: project.id,
        name: project.name,
        description: project.description,
        status: project.status,
        startDate: project.start_date,
        endDate: project.end_date,
        progress: progress,
        issueCount: totalIssues,
        members: membersResult.rows.map(m => ({
          id: m.id,
          name: m.name,
          email: m.email,
          role: m.role,
          avatar: m.avatar,
          status: m.status
        }))
      };
    }));

    res.json(projects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProjectById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const projectResult = await pool.query(
      `SELECT p.*, u.name as created_by_name,
              COUNT(DISTINCT i.id) as total_issues,
              COUNT(DISTINCT CASE WHEN i.status IN ('Fixed', 'Closed') THEN i.id END) as completed_issues
       FROM projects p
       LEFT JOIN users u ON p.created_by = u.id
       LEFT JOIN issues i ON p.id = i.project_id
       WHERE p.id = $1
       GROUP BY p.id, u.name`,
      [id]
    );

    if (projectResult.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const project = projectResult.rows[0];

    // Check if user is a member (for non-Admin users)
    if (userRole !== 'Admin') {
      const memberCheck = await pool.query(
        'SELECT 1 FROM project_members WHERE project_id = $1 AND user_id = $2',
        [id, userId]
      );
      
      if (memberCheck.rows.length === 0) {
        return res.status(403).json({ error: 'Access denied. You can only view projects you are assigned to as a member.' });
      }
    }

    // Calculate progress based on completed issues
    const totalIssues = parseInt(project.total_issues) || 0;
    const completedIssues = parseInt(project.completed_issues) || 0;
    const progress = totalIssues > 0 ? Math.round((completedIssues / totalIssues) * 100) : 0;

    // Get project members
    const membersResult = await pool.query(
      `SELECT u.id, u.name, u.email, u.role, u.avatar, u.status
       FROM project_members pm
       JOIN users u ON pm.user_id = u.id
       WHERE pm.project_id = $1`,
      [id]
    );

    const transformedProject = {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status,
      startDate: project.start_date,
      endDate: project.end_date,
      progress: progress,
      issueCount: totalIssues,
      members: membersResult.rows.map(m => ({
        id: m.id,
        name: m.name,
        email: m.email,
        role: m.role,
        avatar: m.avatar,
        status: m.status
      }))
    };

    res.json(transformedProject);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createProject = async (req, res) => {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    const {
      name,
      description,
      clientName,
      startDate,
      endDate,
      status = 'Planning',
      members = []
    } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Project name is required' });
    }

    const projectId = `project-${Date.now()}`;
    
    // Insert project
    const projectResult = await client.query(
      `INSERT INTO projects (id, name, description, client_name, start_date, end_date, status, progress, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 0, $8)
       RETURNING *`,
      [projectId, name, description, clientName, startDate, endDate, status, req.user.id]
    );

    // Add project members
    if (members && members.length > 0) {
      for (const member of members) {
        await client.query(
          'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3)',
          [projectId, member.userId, member.role || 'Member']
        );
      }
    }

    // Log activity
    await client.query(
      'INSERT INTO activities (project_id, user_id, action, details) VALUES ($1, $2, $3, $4)',
      [projectId, req.user.id, 'Project Created', `Created project: ${name}`]
    );

    await client.query('COMMIT');
    
    // Return transformed project
    const transformedProject = {
      id: projectResult.rows[0].id,
      name: projectResult.rows[0].name,
      description: projectResult.rows[0].description,
      status: projectResult.rows[0].status,
      startDate: projectResult.rows[0].start_date,
      endDate: projectResult.rows[0].end_date,
      progress: projectResult.rows[0].progress,
      issueCount: 0,
      members: members.map(m => ({
        id: m.userId,
        name: m.name || '',
        email: m.email || '',
        role: m.role,
        avatar: m.avatar || '',
        status: 'Active'
      }))
    };
    
    res.status(201).json(transformedProject);
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Create project error:', error);
    console.error('Error details:', error.message);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: 'Internal server error', details: error.message });
  } finally {
    client.release();
  }
};

export const updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, clientName, startDate, endDate, status, progress } = req.body;

    const projectCheck = await pool.query('SELECT id FROM projects WHERE id = $1', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

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

    if (clientName !== undefined) {
      updates.push(`client_name = $${paramCount}`);
      params.push(clientName);
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

    if (progress !== undefined) {
      updates.push(`progress = $${paramCount}`);
      params.push(progress);
      paramCount++;
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No fields to update' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    params.push(id);

    const query = `
      UPDATE projects
      SET ${updates.join(', ')}
      WHERE id = $${paramCount}
      RETURNING *
    `;

    const result = await pool.query(query, params);
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteProject = async (req, res) => {
  try {
    const { id } = req.params;

    const projectCheck = await pool.query('SELECT id FROM projects WHERE id = $1', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    await pool.query('DELETE FROM projects WHERE id = $1', [id]);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addProjectMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role = 'Member' } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    // Check if project exists
    const projectCheck = await pool.query('SELECT id FROM projects WHERE id = $1', [id]);
    if (projectCheck.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user exists
    const userCheck = await pool.query('SELECT id FROM users WHERE id = $1', [userId]);
    if (userCheck.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Add member
    await pool.query(
      'INSERT INTO project_members (project_id, user_id, role) VALUES ($1, $2, $3) ON CONFLICT (project_id, user_id) DO NOTHING',
      [id, userId, role]
    );

    res.status(201).json({ message: 'Member added successfully' });
  } catch (error) {
    console.error('Add project member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const removeProjectMember = async (req, res) => {
  try {
    const { id, userId } = req.params;

    await pool.query(
      'DELETE FROM project_members WHERE project_id = $1 AND user_id = $2',
      [id, userId]
    );

    res.json({ message: 'Member removed successfully' });
  } catch (error) {
    console.error('Remove project member error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};