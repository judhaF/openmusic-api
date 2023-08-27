/* eslint-disable camelcase */

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'CHAR(23)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'CHAR(25)',
    },
    user_id: {
      type: 'CHAR(21)',
    },
  });
  pgm.addConstraint(
    'collaborations',
    'fk_collab_playlist_id',
    `
    FOREIGN KEY
      (playlist_id)
    REFERENCES
      playlists (id)
    ON DELETE CASCADE
    `,
  );
  pgm.addConstraint(
    'collaborations',
    'fk_collab_user_id',
    `
    FOREIGN KEY
      (user_id)
    REFERENCES
      users (id)
    ON DELETE CASCADE
    `,
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'collaborations',
    'fk_collab_playlist_id',
    { ifExists: true },
  );
  pgm.dropConstraint(
    'collaborations',
    'fk_collab_user_id',
    { ifExists: true },
  );
  pgm.dropTable('collaborations', {
    ifExists: true,
  });
};
