const autoBind = require('auto-bind');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    autoBind(this);
  }

  async postSongHandler(request, h) {
    this._validator.validateSongPayload(request.payload);
    const {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    } = request.payload;

    const songId = await this._service.addSong(
      {
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
      },
    );
    const response = h.response({
      status: 'success',
      message: 'Song berhasil ditambahkan',
      data: {
        songId,
      },
    });
    response.code(201);
    return response;
  }

  async getSongsHandler(request) {
    const search = {};
    if (request.query.title) {
      search.title = request.query.title;
    }
    if (request.query.performer) {
      search.performer = request.query.performer;
    }
    if (Object.keys(search).length > 0) {
      const songs = await this._service.searchSongs(search);
      return {
        status: 'success',
        data: {
          songs,
        },
      };
    }

    const songs = await this._service.getSongs();
    return {
      status: 'success',
      data: {
        songs,
      },
    };
  }

  async getSongByIdHandler(request) {
    const { id } = request.params;
    const song = await this._service.getSongById(id);
    return {
      status: 'success',
      data: {
        song,
      },
    };
  }

  async putSongByIdHandler(request) {
    this._validator.validateSongPayload(request.payload);
    const { id } = request.params;
    const {
      title,
      year,
      genre,
      performer,
      duration,
      albumId,
    } = request.payload;
    await this._service.updateSongById(
      id,
      {
        title,
        year,
        genre,
        performer,
        duration,
        albumId,
      },
    );
    return {
      status: 'success',
      message: 'Song berhasil diperbarui',
    };
  }

  async deleteSongByIdHandler(request) {
    const { id } = request.params;
    await this._service.deleteSongById(id);
    return {
      status: 'success',
      message: 'Song berhasil didelete',
    };
  }
}

module.exports = SongsHandler;
