const ClientError = require('../../exceptions/ClientError');

/**
 * To be responsible of playlists handler.
 */
class PlaylistsHandler {
  /**
   * Construct to declare and bind variable.
   * @param {*} service Param represent of service.
   * @param {*} validator Param represent of validator.
   */
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
    this.getUsersByUsernameHandler = this.getUsersByUsernameHandler.bind(this);
  }

  /**
   * Post playlist handler response.
   * @param {*} request Param represent of request.
   * @param {*} h Param represent of response.
   * @return {*} Return is response of code.
   */
  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePostPlaylistPayload(request.payload);
      const {name} = request.payload;
      const {id: credentialId} = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({
        name, owner: credentialId,
      });

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
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
   * Get playlists handler response.
   * @param {*} request Param represent of request.
   * @return {*} Return is response of code.
   */
  async getPlaylistsHandler(request) {
    try {
      const {id: credentialId} = request.auth.credentials;
      const playlists = await this._service.getPlaylists(credentialId);
      return {
        status: 'success',
        data: {
          playlists,
        },
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

  /**
   * Delete playlist by id handler.
   * @param {*} request Param represent of request.
   * @param {*} h Param represent of response.
   * @return {*} Return is response of code.
   */
  async deletePlaylistByIdHandler(request, h) {
    try {
      const {playlistId} = request.params;
      const {id: credentialId} = request.auth.credentials;
      await this._service.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deletePlaylistById(playlistId);
      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
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

  /**
   * Post song handler.
   * @param {*} request Param represent of request.
   * @param {*} h Param represent of response.
   * @return {*} Return is response of code.
   */
  async postSongHandler(request, h) {
    try {
      this._validator.validatePostSongPayload(request.payload);
      const {playlistId} = request.params;
      const {songId} = request.payload;
      const {id: credentialId} = request.auth.credentials;
      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.addSongToPlaylist(playlistId, songId);

      const response = h.response({
        status: 'success',
        message: 'Lagu berhasil ditambahkan ke playlist',
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
   * Get songs handler.
   * @param {*} request Param represent of request.
   * @param {*} h Param represent of response.
   * @return {*} Return is response of code.
   */
  async getSongsHandler(request, h) {
    try {
      const {playlistId} = request.params;
      const {id: credentialId} = request.auth.credentials;
      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      const songs = await this._service.getSongsFromPlaylist(playlistId);
      return {
        status: 'success',
        data: {
          songs,
        },
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

  /**
   * Delete song by id handler.
   * @param {*} request Param represent of request.
   * @param {*} h Param represent of response.
   * @return {*} Return is response of code.
   */
  async deleteSongByIdHandler(request, h) {
    try {
      const {playlistId} = request.params;
      const {songId} = request.payload;
      const {id: credentialId} = request.auth.credentials;
      await this._service.verifyPlaylistAccess(playlistId, credentialId);
      await this._service.deleteSongFromPlaylist(playlistId, songId);
      return {
        status: 'success',
        message: 'Lagu berhasil dihapus dari playlist',
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

  /**
   * Get user by username handler.
   * @param {*} request Param represent of request.
   * @param {*} h Param represent of response.
   * @return {*} Return is response of code.
   */
  async getUsersByUsernameHandler(request, h) {
    try {
      const {username = ''} = request.query;
      const users = await this._service.getUsersByUsername(username);
      return {
        status: 'success',
        data: {
          users,
        },
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

module.exports = PlaylistsHandler;
