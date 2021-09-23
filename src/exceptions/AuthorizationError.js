const ClientError = require('./ClientError');

/**
 * To be responsible of authorization error.
 */
class AuthorizationError extends ClientError {
  /**
   * Construct to get data from parent class.
   * @param {*} message Param represent of message.
   */
  constructor(message) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

module.exports = AuthorizationError;
