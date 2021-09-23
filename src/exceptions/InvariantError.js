const ClientError = require('./ClientError');

/**
 * To be responsible of invariant error.
 */
class InvariantError extends ClientError {
  /**
   * Construct to get data from parent class.
   * @param {*} message Param represent of message.
   */
  constructor(message) {
    super(message);
    this.name = 'InvariantError';
  }
}

module.exports = InvariantError;
