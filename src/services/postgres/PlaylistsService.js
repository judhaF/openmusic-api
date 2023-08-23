const { nanoid } = require('nanoid');
const BaseService = require('./BaseService');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class PlaylistsService extends BaseService {
  constructor() {
    super();
    this._table = 'playlists';
  }

  async addPlaylist({ ownerId, name }) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: `INSERT INTO ${this._table} VALUES ($1, $2, $3) RETURNING id`,
      values: [id, ownerId, name],
    };
    const playlistId = await this._pool.query(query);
    if (!playlistId.rows[0].id) {
      throw new InvariantError('Gagal insert playlist ke database');
    }

    return playlistId.rows[0].id;
  }

  async getPlaylists(id) {
    const result = await this._pool.query(
      `
      SELECT
        p.id as id, p.name as name, u.username as username
      FROM
        ${this._table} as p
      LEFT JOIN users as u
      ON p.owner_id=u.id
      LEFT JOIN collaborations as c
      ON c.playlist_id=p.id
      WHERE
        p.owner_id=$1 OR c.user_id=$1
      `,
      [id],
    );
    return result.rows;
  }

  async addSongToPlaylist({ playlistId, songId }) {
    const id = `ps-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlist_songs VALUES ($1, $2, $3) RETURNING id',
      values: [id, playlistId, songId],
    };
    const result = await this._pool.query(query);
    console.log(result.rows);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal insert song ke playlist');
    }
    return result.rows[0].id;
  }

  async getSongsByPlaylist(id) {
    const query = {
      text: `
      SELECT
        p.id as id,
        p.name as name,
        u.username as username,
        array(
          SELECT
          json_build_object(
          'id',s.id,
            'title',s.title,
          'performer',s.performer
          )
          FROM
            songs s
          INNER JOIN
            playlist_songs as ps
          ON (ps.song_id=s.id AND ps.playlist_id=p.id)
        ) as songs
      FROM
        playlists as p
      LEFT JOIN
        users u
      ON p.owner_id=u.id
      WHERE
        p.id=$1
      `,
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal mengambil playlist, id tidak ditemukan');
    }
    return result.rows[0];
  }

  async deleteSongById({ playlistId, songId }) {
    const query = {
      text: 'DELETE FROM playlist_songs WHERE playlist_id=$1 AND song_id=$2 RETURNING id',
      values: [playlistId, songId],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Gagal menghapus, id tidak ditemukan');
    }
  }

  async verifyPlaylistOwner({ playlistId, ownerId }) {
    const query = {
      text: `SELECT id, owner_id FROM ${this._table} WHERE id=$1`,
      values: [playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    console.log(result.rows);
    console.log(ownerId);
    if (result.rows[0].owner_id !== ownerId) {
      throw new AuthorizationError('Tidak berhak mengakses');
    }
  }
}

module.exports = PlaylistsService;
