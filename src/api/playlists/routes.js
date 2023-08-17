const routes = (handler) => [
  {
    method: 'POST',
    path: '/playlists',
    handler: handler.postPlaylistHandler,
  },
  {
    method: 'POST',
    path: '/playlists/{id}/songs',
    handler: handler.postSongToPlaylistHandler,
  },
  {
    method: 'GET',
    path: '/playlists',
    handler: handler.getSongsHandler,
  },
  {
    method: 'GET',
    path: '/playlists/{id}/songs',
    handler: handler.getSongByPlaylistHandler,
  },
  {
    method: 'PUT',
    path: '/songs/{id}',
    handler: handler.putSongByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}',
    handler: handler.deletePlaylistByIdHandler,
  },
  {
    method: 'DELETE',
    path: '/playlists/{id}/songs',
    handler: handler.deletePlaylistSongByIdHandler,
  },
];

module.exports = routes;
