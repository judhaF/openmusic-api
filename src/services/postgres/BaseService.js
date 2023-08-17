const { Pool } = require('pg');
const NotFoundError = require('../../exceptions/NotFoundError');

class BaseService {
  constructor() {
    this._pool = new Pool(
      {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
      },
    );
    this._table = '';
  }

  async getAll() {
    this._pool.query(`SELECT * FROM ${this._table}`);
  }

  async deleteById(id) {
    const query = {
      text: `DELETE FROM ${this._table} WHERE id=$1 RETURNING id`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus, id tidak ditemukan');
    }
  }
}

module.exports = BaseService;
