/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlist_song_activities', {
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
    user_id: {
      type: 'CHAR(21)',
    },
    action: {
      type: 'TEXT',
    },
    time: {
      type: 'TIMESTAMP',
    },
  });
  pgm.addConstraint(
    'playlist_song_activities',
    'fk_psa_user_id',
    `
    FOREIGN KEY
      (user_id)
    REFERENCES
      users (id)
    ON DELETE CASCADE
    `,
  );
  pgm.addConstraint(
    'playlist_song_activities',
    'fk_psa_playlist_id',
    `
    FOREIGN KEY
      (playlist_id)
    REFERENCES
      playlists (id)
    ON DELETE CASCADE
    `,
  );
  pgm.addConstraint(
    'playlist_song_activities',
    'fk_psa_song_id',
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
    'playlist_song_activities',
    'fk_psa_song_id',
    { ifExists: true },
  );
  pgm.dropConstraint(
    'playlist_song_activities',
    'fk_psa_playlist_id',
    { ifExists: true },
  );
  pgm.dropConstraint(
    'playlist_song_activities',
    'fk_psa_user_id',
    { ifExists: true },
  );
  pgm.dropTable('playlist_song_activities', {
    ifExists: true,
  });
};
