import pool from '../config/db.js';

export const CampaignModel = {
  findAll: async ({ search = '', status = '', limit = 20, offset = 0 }) => {
    const { rows } = await pool.query(
      `SELECT * FROM campaigns
       WHERE ($1 = '' OR title ILIKE '%' || $1 || '%')
         AND ($2 = '' OR status = $2)
       ORDER BY created_at DESC
       LIMIT $3 OFFSET $4`,
      [search, status, limit, offset]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      'SELECT * FROM campaigns WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },

  create: async (data) => {
    const { title, type, description, start_date, end_date, total_budget, status } = data;
    const { rows } = await pool.query(
      `INSERT INTO campaigns (title, type, description, start_date, end_date, total_budget, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [title, type, description, start_date, end_date, total_budget, status || 'Draft']
    );
    return rows[0];
  },

  update: async (id, data) => {
    const fields = Object.keys(data);
    const values = Object.values(data);
    const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
    const { rows } = await pool.query(
      `UPDATE campaigns SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1} RETURNING *`,
      [...values, id]
    );
    return rows[0] || null;
  },

  delete: async (id) => {
    await pool.query('DELETE FROM campaigns WHERE id = $1', [id]);
  },

  count: async ({ search = '', status = '' }) => {
    const { rows } = await pool.query(
      `SELECT COUNT(*) FROM campaigns
       WHERE ($1 = '' OR title ILIKE '%' || $1 || '%')
         AND ($2 = '' OR status = $2)`,
      [search, status]
    );
    return parseInt(rows[0].count, 10);
  },
};
