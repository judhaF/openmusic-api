exports.up = (pgm) => {
  pgm.createTable('user_album_likes', {
    id: {
      type: 'CHAR(22)',
      primaryKey: true,
    },
    user_id: {
      type: 'CHAR(21)',
    },
    album_id: {
      type: 'CHAR(22)',
    },
  });
  pgm.addConstraint(
    'user_album_likes',
    'fk_ual_album_id',
    `
    FOREIGN KEY
      (album_id)
    REFERENCES
      albums (id)
    ON DELETE CASCADE
    `,
  );
  pgm.addConstraint(
    'user_album_likes',
    'fk_ual_user_id',
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
  pgm.dropConstraint('fk_ual_album_id', { ifExists: true });
  pgm.dropConstraint('fk_ual_user_id', { ifExists: true });
  pgm.dropTable('user_album_likes', { ifExists: true });
};
