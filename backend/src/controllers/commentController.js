import pool from '../config/database.js';

// Get all comments for an issue
export const getCommentsByIssue = async (req, res) => {
  try {
    const { issueId } = req.params;
    
    const result = await pool.query(
      `SELECT c.*, 
              u.id as user_id, u.name as user_name, u.email as user_email, 
              u.avatar as user_avatar, u.role as user_role
       FROM comments c
       LEFT JOIN users u ON c.user_id = u.id
       WHERE c.issue_id = $1
       ORDER BY c.created_at ASC`,
      [issueId]
    );

    const comments = result.rows.map(row => ({
      id: row.id,
      issueId: row.issue_id,
      user: {
        id: row.user_id,
        name: row.user_name,
        email: row.user_email,
        avatar: row.user_avatar,
        role: row.user_role
      },
      content: row.content,
      createdAt: row.created_at,
      updatedAt: row.updated_at
    }));

    res.json(comments);
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Create a new comment
export const createComment = async (req, res) => {
  try {
    const { issueId, content } = req.body;

    if (!issueId || !content) {
      return res.status(400).json({ error: 'Issue ID and content are required' });
    }

    const commentId = `comment-${Date.now()}`;
    
    const result = await pool.query(
      `INSERT INTO comments (id, issue_id, user_id, content)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [commentId, issueId, req.user.id, content]
    );

    // Get user info
    const userResult = await pool.query(
      'SELECT id, name, email, avatar, role FROM users WHERE id = $1',
      [req.user.id]
    );

    const comment = {
      id: result.rows[0].id,
      issueId: result.rows[0].issue_id,
      user: userResult.rows[0],
      content: result.rows[0].content,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.status(201).json(comment);
  } catch (error) {
    console.error('Create comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Update a comment
export const updateComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // Check if user owns the comment
    const checkResult = await pool.query(
      'SELECT user_id FROM comments WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (checkResult.rows[0].user_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized to edit this comment' });
    }

    const result = await pool.query(
      `UPDATE comments
       SET content = $1, updated_at = CURRENT_TIMESTAMP
       WHERE id = $2
       RETURNING *`,
      [content, id]
    );

    const userResult = await pool.query(
      'SELECT id, name, email, avatar, role FROM users WHERE id = $1',
      [result.rows[0].user_id]
    );

    const comment = {
      id: result.rows[0].id,
      issueId: result.rows[0].issue_id,
      user: userResult.rows[0],
      content: result.rows[0].content,
      createdAt: result.rows[0].created_at,
      updatedAt: result.rows[0].updated_at
    };

    res.json(comment);
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Delete a comment
export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user owns the comment
    const checkResult = await pool.query(
      'SELECT user_id FROM comments WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    if (checkResult.rows[0].user_id !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    await pool.query('DELETE FROM comments WHERE id = $1', [id]);

    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
