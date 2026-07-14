import pool from '../config/db.js';

export const CommunityModel = {
  findAll: async ({ search = '', status = '', limit = 20, offset = 0 }) => {
    const { rows } = await pool.query(
      `SELECT * FROM communities
       WHERE ($1 = '' OR name ILIKE '%' || $1 || '%')
         AND ($2 = '' OR status = $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [search, status, limit, offset]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      'SELECT * FROM communities WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  create: async (data) => {
    const { name, location, tier, status, about, categories, platforms } = data;
    const { rows } = await pool.query(
      `INSERT INTO communities (name, location, tier, status, about, categories, platforms)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [name, location, tier, status || 'Active', about, categories, platforms]
    );
    return rows[0];
  },

  update: async (id, data) => {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE communities SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return rows[0] || null;
  },

  delete: async (id) => {
    await pool.query('DELETE FROM communities WHERE id = $1', [id]);
  },

  getMembers: async (communityId) => {
    const { rows } = await pool.query(
      `SELECT u.id, u.full_name, u.email, cm.role, cm.joined_at
       FROM community_members cm
       JOIN users u ON u.id = cm.user_id
       WHERE cm.community_id = $1
       ORDER BY cm.joined_at DESC`,
      [communityId]
    );
    return rows;
  },

  addMember: async (communityId, userId, role = 'member') => {
    const { rows } = await pool.query(
      `INSERT INTO community_members (community_id, user_id, role)
       VALUES ($1, $2, $3) RETURNING *`,
      [communityId, userId, role]
    );
    return rows[0];
  },
};
