require('dotenv').config();

const Hapi = require('@hapi/hapi');
const songs = require('./api/songs');
const albums = require('./api/albums');
const SongsService = require('./services/postgres/SongsService');
const AlbumsService = require('./services/postgres/AlbumsService');

const init = async () => {
  const songsService = new SongsService();
  const albumsService = new AlbumsService();
  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });
  await server.register(
    {
      plugin: songs,
      options: {
        service: songsService,
      },
    },
    {
      plugin: albums,
      options: {
        service: albumsService,
      },
    },
  );
  await server.start();
  console.log(`Listening at ${server.info.uri}`);
};

init();
