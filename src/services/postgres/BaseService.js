const { Pool } = require('pg');

class BaseService {
  constructor() {
    this._pool = new Pool(
      {
        host: process.env.PGHOST,
        user: process.env.PGUSER,
        password: process.env.PGPASSWORD,
        database: process.env.PGDATABASE,
        port: process.env.PGPORT,
      },
    );
  }
}

module.exports = BaseService;
