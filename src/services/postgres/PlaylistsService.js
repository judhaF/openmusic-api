const { nanoid } = require('nanoid');
const BaseService = require('./BaseService');
const InvariantError = require('../../exceptions/InvariantError');

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

  async addSongToPlaylist({}) {}

  async getPlaylists() {}

  async getSongsByPlaylist(id) {}
}

module.exports = PlaylistsService;
