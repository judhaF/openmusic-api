const { nanoid } = require('nanoid');
const BaseService = require('./BaseService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class CollaborationsService extends BaseService {
  constructor() {
    super();
    this._table = 'collaborations';
  }

  async addCollaboration({ playlistId, userId }) {
    const id = `collab-${nanoid(16)}`;

    const query = {
      text: `INSERT INTO ${this._table} VALUES($1,$2,$3) RETURNING id`,
      values: [id, playlistId, userId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: `DELETE FROM ${this._table} WHERE playlist_id=$1 AND user_id=$2 RETURNING id`,
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Kolaborasi Tidak Ditemukan');
    }
  }

  async verifyCollaborator({ playlistId, userId }) {
    const query = {
      text: `SELECT id FROM ${this._table} WHERE playlist_id=$1 AND user_id=$2`,
      values: [playlistId, userId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new AuthorizationError('Tidak masuk kedalam collaborasi');
    }
  }
}

module.exports = CollaborationsService;
