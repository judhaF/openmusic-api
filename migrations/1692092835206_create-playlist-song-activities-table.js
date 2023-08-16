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
};

exports.down = (pgm) => {
  pgm.dropTable('playlist_song_activities', {
    ifExists: true,
  });
};
