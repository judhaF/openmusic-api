require('dotenv').config();

const path = require('path');
const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const Inert = require('@hapi/inert');
const ClientError = require('./exceptions/ClientError');

// Playlists
const playlist = require('./api/playlists');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const PlaylistValidator = require('./validator/playlists');

// Collaborations
const CollaborationsService = require('./services/postgres/CollaborationsService');
const collaborations = require('./api/collaborations');
const CollaborationValidator = require('./validator/collaborations');

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

// Authentications
const authentications = require('./api/authentications');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const TokenManager = require('./tokenize/TokenManager');
const AuthenticationsValidator = require('./validator/authentications');

// Exports
const _exports = require('./api/exports');
const ProducerService = require('./services/rabbitmq/ProducerService');
const ExportsValidator = require('./validator/exports');

// Storage
const StorageService = require('./services/storage/StorageService');

const init = async () => {
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const authenticationsService = new AuthenticationsService();
  const usersService = new UsersService();
  const playlistsService = new PlaylistsService();
  const collaborationsService = new CollaborationsService();
  const albumsStorageService = new StorageService(path.resolve(__dirname, 'public/images/AlbumCover'));

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
      if ((response.code === '23503')) {
        if (response.table === 'playlist_songs') {
          const newResponse = h.response({
            status: 'fail',
            message: 'Id Song/Playlist tidak ditemukan',
          });
          newResponse.code(404);
          return newResponse;
        }
        if (response.table === 'collaborations') {
          const newResponse = h.response({
            status: 'fail',
            message: 'Id User/Playlist tidak ditemukan',
          });
          newResponse.code(404);
          return newResponse;
        }
      }
      const newResponse = h.response({
        status: 'error',
        message: 'Terjadi kegagalan pada server',
      });
      newResponse.code(500);
      console.error(response);
      return newResponse;
    }
    return h.continue;
  });
  // Registrasi Plugin Ekternal
  await server.register([
    {
      plugin: Jwt,
    },
    {
      plugin: Inert,
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
          storageService: albumsStorageService,
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
        plugin: collaborations,
        options: {
          playlistsService,
          collaborationsService,
          validator: CollaborationValidator,
        },
      },
      {
        plugin: playlist,
        options: {
          playlistsService,
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
      {
        plugin: _exports,
        options: {
          service: ProducerService,
          playlistsService,
          collaborationsService,
          validator: ExportsValidator,
        },
      },
    ],
  );
  await server.start();
  console.log(`Listening at ${server.info.uri}`);
};

init();
