const pool = require('../config/database');
const bcrypt = require('bcrypt');

const Usuario = {
  async crear(email, password, nombre) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
      INSERT INTO usuarios (email, password, nombre)
      VALUES ($1, $2, $3)
      RETURNING id, email, nombre
    `;
    const values = [email, hashedPassword, nombre];
    const result = await pool.query(query, values);
    return result.rows[0];
  },

  async buscarPorEmail(email) {
    const query = 'SELECT * FROM usuarios WHERE email = $1';
    const result = await pool.query(query, [email]);
    return result.rows[0];
  },

  async buscarPorId(id) {
    const query = 'SELECT id, email, nombre FROM usuarios WHERE id = $1';
    const result = await pool.query(query, [id]);
    return result.rows[0];
  }
};

module.exports = Usuario;