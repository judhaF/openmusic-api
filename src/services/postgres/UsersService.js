const bcrypt = require('bcrypt');
const { nanoid } = require('nanoid');
const AuthenticationError = require('../../exceptions/AuthenticationError');
const BaseService = require('./BaseService');
const InvariantError = require('../../exceptions/InvariantError');

class UsersService extends BaseService {
  constructor() {
    super();
    this._table = 'users';
  }

  async verifyNewUsername(username) {
    const query = {
      text: `SELECT username FROM ${this._table} WHERE username=$1`,
      values: [username],
    };
    const result = await this._pool.query(query);
    if (result.rows.length > 0) {
      throw new InvariantError('Gagal menambahkan user. Username sudah digunakan');
    }
  }

  async addUser({ username, password, fullname }) {
    await this.verifyNewUsername(username);
    const id = `user-${nanoid(16)}`;
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = {
      text: `INSERT INTO ${this._table} VALUES ($1, $2, $3, $4) RETURNING id`,
      values: [id, username, hashedPassword, fullname],
    };
    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Gagal memasukan user ke database');
    }
    return result.rows[0].id;
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
