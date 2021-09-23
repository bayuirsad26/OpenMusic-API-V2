const ClientError = require('./ClientError');

/**
 * To be responsible of not found error.
 */
class NotFoundError extends ClientError {
  /**
   * Contruct to get data from parent class.
   * @param {*} message Param represent of message.
   */
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = NotFoundError;
