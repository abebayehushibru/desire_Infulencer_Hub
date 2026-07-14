import pool from '../config/db.js';

export const UserModel = {
  findByEmail: async (email) => {
    const { rows } = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email]
    );
    return rows[0] || null;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      'SELECT id, full_name, email, phone, role, status, created_at FROM users WHERE id = $1',
      [id]
    );
    return rows[0] || null;
  },
};
