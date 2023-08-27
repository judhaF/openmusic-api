/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('playlist_songs', {
    id: {
      type: 'CHAR(19)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'CHAR(25)',
    },
    song_id: {
      type: 'CHAR(21)',
    },
  });
  pgm.addConstraint(
    'playlist_songs',
    'fk_playlist_id',
    `
    FOREIGN KEY
      (playlist_id)
    REFERENCES
      playlists (id)
    ON DELETE CASCADE
    `,
  );
  pgm.addConstraint(
    'playlist_songs',
    'fk_song_id',
    `
    FOREIGN KEY
      (song_id)
    REFERENCES
      songs (id)
    ON DELETE CASCADE
    `,
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'playlist_songs',
    'fk_playlist_id',
    {
      ifExists: true,
    },
  );
  pgm.dropConstraint(
    'playlist_songs',
    'fk_song_id',
    {
      ifExists: true,
    },
  );
  pgm.dropTable('playlist_songs', { ifExists: true });
};
