/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('playlists', {
    id: {
      type: 'CHAR(25)',
      primaryKey: true,
    },
    owner_id: {
      type: 'CHAR(21)',
    },
    name: {
      type: 'TEXT',
    },
  });
  pgm.addConstraint(
    'playlists',
    'fk_owner_id',
    `
    FOREIGN KEY
      (owner_id)
    REFERENCES
      users (id)
    ON DELETE CASCADE
    `,
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'playlists',
    'fk_owner_id',
    {
      ifExists: true,
    },
  );
  pgm.dropTable('playlists', { ifExists: true });
};
