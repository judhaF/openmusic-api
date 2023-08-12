const { Pool } = require('pg');

class BaseService {
  constructor() {
    this._pool = new Pool();
  }
}

module.exports = BaseService;
