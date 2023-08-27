const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(
    playlistsService,
    collaborationsService,
    validator,
  ) {
    this._service = collaborationsService;
    this._playlistService = playlistsService;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validatePostCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: ownerId } = request.auth.credentials;
    await this._playlistService.verifyPlaylistOwner({ playlistId, ownerId });
    const collaborationId = await this._service.addCollaboration({ playlistId, userId });
    const response = h.response({
      status: 'success',
      message: 'Collaboration berhasil ditambahkan',
      data: {
        collaborationId,
      },
    });
    response.code(201);
    return response;
  }

  async deleteCollaborationHandler(request) {
    this._validator.validateDeleteCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const { id: ownerId } = request.auth.credentials;
    await this._playlistService.verifyPlaylistOwner({ playlistId, ownerId });
    await this._service.deleteCollaboration({ playlistId, userId });
    return {
      status: 'success',
      message: 'Collaboration berhasil dihapus',
    };
  }
}
module.exports = CollaborationsHandler;
