/* eslint-disable camelcase */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.createTable('collaborations', {
    id: {
      type: 'CHAR(22)',
      primaryKey: true,
    },
    playlist_id: {
      type: 'CHAR(25)',
    },
    user_id: {
      type: 'CHAR(21)',
    },
  });
};

exports.down = (pgm) => {
  pgm.dropTable('collaborations', {
    ifExists: true,
  });
};
