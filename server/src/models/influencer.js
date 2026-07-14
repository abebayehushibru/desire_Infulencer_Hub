import pool from '../config/db.js';

export const InfluencerModel = {
  findAll: async ({ search = '', platform = '', level = '', limit = 20, offset = 0 }) => {
    const { rows } = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.status,
              ip.main_platform, ip.profile_link, ip.followers_count, ip.level, ip.bio, ip.address
       FROM users u
       JOIN influencer_profiles ip ON ip.user_id = u.id
       WHERE u.role = 'influencer'
         AND ($1 = '' OR u.full_name ILIKE '%' || $1 || '%')
         AND ($2 = '' OR ip.main_platform = $2)
         AND ($3 = '' OR ip.level = $3)
       ORDER BY u.created_at DESC
       LIMIT $4 OFFSET $5`,
      [search, platform, level, limit, offset]
    );
    return rows;
  },

  findById: async (id) => {
    const { rows } = await pool.query(
      `SELECT u.id, u.full_name, u.email, u.phone, u.status,
              ip.main_platform, ip.profile_link, ip.followers_count, ip.level, ip.bio, ip.address
       FROM users u
       JOIN influencer_profiles ip ON ip.user_id = u.id
       WHERE u.id = $1`,
      [id]
    );
    return rows[0] || null;
  },

  create: async (userData, profileData) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      const { rows: userRows } = await client.query(
        `INSERT INTO users (full_name, email, phone, password_hash, role, status)
         VALUES ($1, $2, $3, $4, 'influencer', $5) RETURNING *`,
        [userData.fullName, userData.email, userData.phone, userData.passwordHash, userData.status || 'Active']
      );
      const user = userRows[0];
      const { rows: profileRows } = await client.query(
        `INSERT INTO influencer_profiles (user_id, main_platform, profile_link, followers_count, level, bio, address)
         VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
        [user.id, profileData.main_platform, profileData.profile_link,
          profileData.followers_count, profileData.level, profileData.bio, profileData.address]
      );
      await client.query('COMMIT');
      return { ...user, ...profileRows[0] };
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  update: async (id, userData, profileData) => {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      if (Object.keys(userData).length > 0) {
        const fields = Object.keys(userData);
        const values = Object.values(userData);
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        await client.query(
          `UPDATE users SET ${setClause}, updated_at = NOW() WHERE id = $${fields.length + 1}`,
          [...values, id]
        );
      }
      if (Object.keys(profileData).length > 0) {
        const fields = Object.keys(profileData);
        const values = Object.values(profileData);
        const setClause = fields.map((f, i) => `${f} = $${i + 1}`).join(', ');
        await client.query(
          `UPDATE influencer_profiles SET ${setClause} WHERE user_id = $${fields.length + 1}`,
          [...values, id]
        );
      }
      await client.query('COMMIT');
      return await InfluencerModel.findById(id);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  },

  delete: async (id) => {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
  },
};
