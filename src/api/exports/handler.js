const autoBind = require('auto-bind');
const AuthorizationError = require('../../exceptions/AuthorizationError');

class ExportsHandler {
  constructor(service, playlistsService, collaborationsService, validator) {
    this._service = service;
    this._psService = playlistsService;
    this._collabService = collaborationsService;
    this._validator = validator;

    autoBind(this);
  }

  async postExportPlaylistsHandler(request, h) {
    this._validator.validateExportPlaylistsPayload(request.payload);
    const { playlistId } = request.params;
    const { id: userId } = request.auth.credentials;
    await this.verifyPlaylistAccess({ playlistId, userId });
    const message = {
      playlistId,
      targetEmail: request.payload.targetEmail,
    };
    await this._service.sendMessage('export:playlists', JSON.stringify(message));

    const response = h.response({
      status: 'success',
      message: 'Permintaan Anda dalam antrean',
    });
    response.code(201);
    return response;
  }

  async verifyPlaylistAccess({ playlistId, userId }) {
    console.log(playlistId);
    try {
      await this._psService.verifyPlaylistOwner({ playlistId, ownerId: userId });
    } catch (error) {
      console.log(error);
      if (error instanceof AuthorizationError) {
        await this._collabService.verifyCollaborator({ playlistId, userId });
      } else {
        throw error;
      }
    }
  }
}

module.exports = ExportsHandler;
