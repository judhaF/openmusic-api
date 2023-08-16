const { default: autoBind } = require('auto-bind');

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  postUserHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const { username, password, fullname } = request.payload;
    const userId = this._service.addUser({ username, password, fullname });
    const response = h.response({
      status: 'success',
      message: 'User berhasil ditambahkan',
      data: {
        userId,
      },
    });
    response.code(201);
    return response;
  }
}

module.exports = UsersHandler;
