require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');

const ClientError = require('./exceptions/ClientError');

// Playlists
const playlist = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistValidator = require('./validator/playlists');
const CollaborationsService = require('./services/postgres/CollaborationsService');

// Songs
const songs = require('./api/songs');
const SongsService = require('./services/postgres/SongsService');
const SongsValidator = require('./validator/songs');

// Albums
const albums = require('./api/albums');
const AlbumsService = require('./services/postgres/AlbumsService');
const AlbumsValidator = require('./validator/albums');

// Users
const users = require('./api/users');
const UsersService = require('./services/postgres/UsersService');
const UsersValidator = require('./validator/users');

// Authentication
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
  const playlistService = new PlaylistsService();
  const collaborationsService = new CollaborationsService();

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  server.ext('onPreResponse', (request, h) => {
    const { response } = request;
    if (response instanceof Error) {
      if (response instanceof ClientError) {
        const newResponse = h.response({
          status: 'fail',
          message: response.message,
        });
        newResponse.code(response.statusCode);
        return newResponse;
      }
      if (!response.isServer) {
        return h.continue;
      }
      console.log(response.table);
      if ((response.code === '23503') && response.table === 'playlist_songs') {
        const newResponse = h.response({
          status: 'fail',
          message: 'Id Song/Playlist tidak ditemukan',
        });
        newResponse.code(404);
        return newResponse;
      }
      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server',
      });
      console.error(response);
      newResponse.code(500);
      return newResponse;
    }
    return h.continue;
  });
  // Registrasi Plugin Ekternal
  await server.register([
    {
      plugin: Jwt,
    },
  ]);

  // Strategi Autentikasi
  server.auth.strategy('openmusic_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  // Registrasi Plugin Internal
  await server.register(
    [
      {
        plugin: albums,
        options: {
          service: albumsService,
          validator: AlbumsValidator,
        },
      },
      {
        plugin: songs,
        options: {
          service: songsService,
          validator: SongsValidator,
        },
      },
      {
        plugin: playlist,
        options: {
          playlistService,
          collaborationsService,
          validator: PlaylistValidator,
        },
      },
      {
        plugin: users,
        options: {
          service: usersService,
          validator: UsersValidator,
        },
      },
      {
        plugin: authentications,
        options: {
          authenticationsService,
          usersService,
          tokenManager: TokenManager,
          validator: AuthenticationsValidator,
        },
      },
    ],
  );
  await server.start();
  console.log(`Listening at ${server.info.uri}`);
};

init();
