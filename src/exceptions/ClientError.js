/**
 * To be responsible of client error.
 */
class ClientError extends Error {
  /**
   * Constuct to get data from parent class.
   * @param {*} message Param represent of message.
   * @param {*} statusCode Param represent of status code.
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.name = 'ClientError';
  }
}

module.exports = ClientError;
