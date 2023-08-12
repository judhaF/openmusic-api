/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('songs', {
    id: {
      type: 'TEXT',
      primaryKey: true,
    },
    title: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
    genre: {
      type: 'TEXT',
      notNull: true,
    },
    performer: {
      type: 'TEXT',
      notNull: true,
    },
    duration: {
      type: 'INTEGER',
    },
    album_id: {
      type: 'CHAR(22)',
    },
  });
  pgm.addConstraint(
    'songs',
    'fk_album_id',
    `
    FOREIGN KEY
      (album_id)
    REFERENCES
      albums (id)
    ON DELETE SET NULL
    `,
  );
};

exports.down = (pgm) => {
  pgm.dropConstraint(
    'songs',
    'fk_album_id',
    {
      ifExists: true,
    },
  );
  pgm.dropTable('songs', { ifExists: true });
};
