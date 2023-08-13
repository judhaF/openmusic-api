const { nanoid } = require('nanoid');
const BaseService = require('./BaseService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');

class AlbumsService extends BaseService {
  constructor() {
    super();
    this._table = 'albums';
  }

  async addAlbum({ name, year }) {
    const id = `album-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO ${this._table} VALUES ($1,$2,$3) RETURNING id`,
      values: [id, name, year],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal insert album ke database');
    }

    return result.rows[0].id;
  }

  async getAlbums() {
    const result = await this._pool.query(`SELECT * FROM ${this._table}`);
    return result.rows;
  }

  async getAlbumById(id) {
    const query = {
      text: `SELECT * FROM ${this._table} WHERE id=$1`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal mengambil album, id tidak ditemukan');
    }
    return result.rows[0];
  }

  async updateAlbumById(id, { name, year }) {
    const query = {
      text: `
      UPDATE
        ${this._table}
      SET
        name=$2,
        year=$3
      WHERE
        id=$1
      RETURNING
        id`,
      values: [id, name, year],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui album, id tidak ditemukan');
    }
  }

  async deleteAlbumById(id) {
    const query = {
      text: `DELETE FROM ${this._table} WHERE id=$1 RETURNING id`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus album, id tidak ditemukan');
    }
  }

  async getSongsByAlbumId(id) {
    const query = {
      text: `
        SELECT
        a.id as id,
        a.name as name,
        a.year as year,
          array(
          SELECT
            json_build_object(
              'id',s.id,
              'title',s.title,
              'performer',s.performer
            )
          FROM
            songs s
              WHERE
                  s.album_id=a.id
        ) as songs
      FROM
        ${this._table} a
      WHERE
        a.id=$1       
      `,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal mengambil album, id tidak ditemukan');
    }
    return result.rows[0];
  }
}

module.exports = AlbumsService;
