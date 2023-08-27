const autoBind = require('auto-bind');
const AuthorizationError = require('../../exceptions/AuthorizationError');

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

  async getPlaylistsHandler(request) {
    const { id } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(id);
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
    const { id: userId } = request.auth.credentials;
    await this.verifyPlaylistAccess({ playlistId, userId });
    await this._service.addSongToPlaylist({ playlistId, songId, userId });
    const response = h.response({
      status: 'success',
      message: `Song berhasil ditambahkan ke playlist dengan id ${playlistId}`,
    });
    response.code(201);
    return response;
  }

  async getSongByPlaylistHandler(request) {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    const playlist = await this._service.getSongsByPlaylist(playlistId);
    await this.verifyPlaylistAccess({ playlistId, userId });
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
    const { id: userId } = request.auth.credentials;
    const { songId } = request.payload;
    await this.verifyPlaylistAccess({ playlistId, userId });
    await this._service.deleteSongById({ playlistId, songId, userId });
    return {
      status: 'success',
      message: 'Song berhasil didelete dari playlist',
    };
  }

  async verifyPlaylistAccess({ playlistId, userId }) {
    try {
      await this._service.verifyPlaylistOwner({ playlistId, ownerId: userId });
    } catch (error) {
      if (error instanceof AuthorizationError) {
        await this._collabService.verifyCollaborator({ playlistId, userId });
      } else {
        throw error;
      }
    }
  }

  async getPlaylistActivitiesHandler(request) {
    const { id: playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    await this.verifyPlaylistAccess({ playlistId, userId });
    const result = await this._service.getPlaylistActivities({ playlistId });
    return {
      status: 'success',
      data: result,
    };
  }
}

module.exports = PlaylistsHandler;
