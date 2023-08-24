/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('users', {
    id: {
      type: 'CHAR(21)',
      primaryKey: true,
    },
    username: {
      type: 'VARCHAR(50)',
      unique: true,
    },
    password: {
      type: 'TEXT',
    },
    fullname: {
      type: 'TEXT',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('users', { ifExists: true });
};
