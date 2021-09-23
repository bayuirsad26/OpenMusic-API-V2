const ClientError = require('../../exceptions/ClientError');

/**
 * To be responsible of collaborations handler.
 */
class CollaborationsHandler {
  /**
   * Construct to declare and bind variable.
   * @param {*} collaborationsService Param represent of collaborations service.
   * @param {*} playlistsService Param represent of playlists service.
   * @param {*} validator Param represent of validator.
   */
  constructor(collaborationsService, playlistsService, validator) {
    this._collaborationsService = collaborationsService;
    this._playlistsService = playlistsService;
    this._validator = validator;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    // eslint-disable-next-line max-len
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  /**
   * Post collaboration handler.
   * @param {*} request Param represent of request.
   * @param {*} h Param represent of response.
   * @return {*} Return is response of code.
   */
  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);
      const {id: credentialId} = request.auth.credentials;
      const {playlistId, userId} = request.payload;
      await this._playlistsService.verifyPlaylistOwner(
          playlistId,
          credentialId,
      );
      // eslint-disable-next-line max-len
      const collaborationId = await this._collaborationsService.addCollaboration(
          playlistId,
          userId,
      );

      const response = h.response({
        status: 'success',
        message: 'Kolaborasi berhasil ditambahkan',
        data: {
          collaborationId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  /**
   * Delete collaboration handler.
   * @param {*} request Param represent of request.
   * @param {*} h Param represent of response.
   * @return {*} Return is response of code.
   */
  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);
      const {id: credentialId} = request.auth.credentials;
      const {playlistId, userId} = request.payload;
      await this._playlistsService.verifyPlaylistOwner(
          playlistId,
          credentialId,
      );
      await this._collaborationsService.deleteCollaboration(playlistId, userId);
      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = CollaborationsHandler;
