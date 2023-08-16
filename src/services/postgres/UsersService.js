const bcrypt = require('bcrypt');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const BaseService = require('./BaseService');

class UsersService extends BaseService {
  constructor() {
    super();
    this._table = 'users';
  }

  async verifyUserCredential(username, password) {
    const query = {
      text: 'SELECT id, password FROM users WHERE username=$1',
      values: [username],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new AuthenticationError('Kredensial yang anda berikan salah');
    }

    const { id, password: hashedPassword } = result.rows[0];

    const match = await bcrypt.compare(password, hashedPassword);
    if (!match) {
      throw new AuthenticationError('Kredensial yang anda berikan salah');
    }
    return id;
  }
}

module.exports = UsersService;
