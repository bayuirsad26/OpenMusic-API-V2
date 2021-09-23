const ClientError = require('./ClientError');

/**
 * To be responsible of authentication error.
 */
class AuthenticationError extends ClientError {
  /**
   * Construct to get data from parent class.
   * @param {*} message Param represent of message.
   */
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

module.exports = AuthenticationError;
