const autoBind = require('auto-bind');

class PlaylistsHandler {
  constructor(playlistsService, collaborationsService, validator) {
    this._service = playlistsService;
    this._collabService = collaborationsService;
    this._validator = validator;

    autoBind(this);
  }

  async postPlaylistHandler(request, h) {
    this._validator.validatePlaylistPayload(request.payload);

    const { name } = request.payload;
    const { id: ownerId } = request.auth.credentials;
    const playlistId = await this._service.addPlaylist({ ownerId, name });
    const response = h.response({
      status: 'success',
      message: 'Playlist berhasil ditambahkan',
      data: {
        playlistId,
      },
    });
    response.code(201);
    return response;
  }

  async getPlaylistsHandler() {
    const playlists = await this._service.getPlaylists();
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request) {
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner({ playlistId, ownerId });
    await this._service.deleteById(playlistId);
    return {
      status: 'success',
      message: 'Playlist berhasil didelete',
    };
  }

  async postSongToPlaylistHandler(request, h) {
    this._validator.validateSongPlaylistPayload(request.payload);
    const { songId } = request.payload;
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;
    await this._service.addSongToPlaylist({ playlistId, songId, ownerId });
    const response = h.response({
      status: 'success',
      message: `Song berhasil ditambahkan ke playlist dengan id ${playlistId}`,
    });
    response.code(201);
    return response;
  }

  async getSongByPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner({ playlistId, ownerId });
    const playlist = await this._service.getSongsByPlaylist(playlistId);
    return {
      status: 'success',
      data: {
        playlist,
      },
    };
  }

  async deletePlaylistSongByIdHandler(request) {
    this._validator.validateSongPlaylistPayload(request.payload);
    const { id: playlistId } = request.params;
    const { id: ownerId } = request.auth.credentials;
    await this._service.verifyPlaylistOwner({ playlistId, ownerId });
    const { songId } = request.payload;
    await this._service.deleteSongById({ playlistId, songId });
    return {
      status: 'success',
      message: 'Playlist berhasil didelete',
    };
  }

  async verifyPlaylistAccess({ playlistId, userId }) {
    try {
      await this._service.verifyPlaylistOwner({ playlistId, userId });
    } catch (error) {
      console.log('Not owner');
    }
    await this._collabService.verifyCollaborator({ playlistId, userId });
  }
}

module.exports = PlaylistsHandler;
