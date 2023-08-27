const { nanoid } = require('nanoid');
const BaseService = require('./BaseService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { mapSongsModel } = require('../../utils/map/songs');

class SongsService extends BaseService {
  constructor() {
    super();
    this._table = 'songs';
  }

  async addSong({
    title,
    year,
    genre,
    performer,
    duration,
    albumId,
  }) {
    const id = `song-${nanoid(16)}`;
    const query = {
      text:
      `
      INSERT INTO
        ${this._table}
      VALUES ($1,$2,$3,$4,$5,$6,$7)
      RETURNING id
      `,
      values: [id, title, year, genre, performer, duration, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal insert Song ke database');
    }

    return result.rows[0].id;
  }

  async getSongs() {
    const result = await this._pool.query(`SELECT id, title, performer FROM ${this._table}`);
    return result.rows;
  }

  async getSongById(id) {
    const query = {
      text: `SELECT * FROM ${this._table} WHERE id=$1`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal mengambil Song, id tidak ditemukan');
    }
    return result.rows.map(mapSongsModel)[0];
  }

  async updateSongById(
    id,
    {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    },
  ) {
    const query = {
      text: `
      UPDATE
        ${this._table}
      SET
        title=$2,
        year=$3,
        genre=$4,
        performer=$5,
        duration=$6,
        album_id=$7
      WHERE
        id=$1
      RETURNING
        id`,
      values: [id, title, year, genre, performer, duration, albumId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal memperbarui Song, id tidak ditemukan');
    }
  }

  async deleteSongById(id) {
    const query = {
      text: `DELETE FROM ${this._table} WHERE id=$1 RETURNING id`,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus Song, id tidak ditemukan');
    }
  }

  async searchSongs(search) {
    const cols = Object.keys(search);
    const values = Object.values(search);
    let querySearch = '';
    cols.forEach((element, index) => {
      values[index] = `%${values[index]}%`;
      querySearch += `${element} ILIKE $${index + 1} `;
      if (cols.length > 1 && (index !== cols.length - 1)) {
        querySearch += 'AND ';
      }
    });
    const query = {
      text: `SELECT id,title,performer FROM songs WHERE ${querySearch}`,
      values,
    };
    const result = await this._pool.query(query);
    return result.rows.map(mapSongsModel);
  }
}

module.exports = SongsService;
