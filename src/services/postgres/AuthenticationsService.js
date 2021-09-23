const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');

/**
 * To be responsible of authentications service.
 */
class AuthenticationsService {
  /**
   * Construct to get access in database.
   */
  constructor() {
    this._pool = new Pool();
  }

  /**
   * Add refresh token into database.
   * @param {*} token Param represent of token.
   */
  async addRefreshToken(token) {
    const query = {
      text: 'INSERT INTO authentications VALUES($1)',
      values: [token],
    };

    await this._pool.query(query);
  }

  /**
   * Verify refresh token from database.
   * @param {*} token Param represent of token.
   */
  async verifyRefreshToken(token) {
    const query = {
      text: 'SELECT token FROM authentications WHERE token = $1',
      values: [token],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Refresh token tidak valid');
    }
  }

  /**
   * Delete refresh token from database.
   * @param {*} token Param represent of token.
   */
  async deleteRefreshToken(token) {
    await this.verifyRefreshToken(token);

    const query = {
      text: 'DELETE FROM authentications WHERE token = $1',
      values: [token],
    };
    await this._pool.query(query);
  }
}

module.exports = AuthenticationsService;
