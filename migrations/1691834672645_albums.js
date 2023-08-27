exports.up = (pgm) => {
  pgm.createTable('albums', {
    id: {
      type: 'CHAR(22)',
      primaryKey: true,
    },
    name: {
      type: 'TEXT',
      notNull: true,
    },
    year: {
      type: 'INTEGER',
      notNull: true,
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('albums', {
    ifExist: true,
  });
};
