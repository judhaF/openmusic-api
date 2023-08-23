const autoBind = require('auto-bind');

class CollaborationsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postCollaborationHandler(request, h) {
    this._validator.validatePostCollaborationPayload(request.payload);

    const { playlistId, userId } = request.payload;
    const collaborationId = await this._service.addCollaboration({ playlistId, userId });
    const response = h.response({
      status: 'success',
      message: 'Authentication berhasil ditambahkan',
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
    await this._service.deleteCollaboration({ playlistId, userId });
    return {
      status: 'success',
      message: 'Refresh token berhasil dihapus',
    };
  }
}
module.exports = CollaborationsHandler;
