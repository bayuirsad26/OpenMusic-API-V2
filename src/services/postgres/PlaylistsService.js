const {Pool} = require('pg');
const {nanoid} = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');

/**
 * To be responsible of playlists service.
 */
class PlaylistsService {
  /**
   * Construct to get access in database.
   * @param {*} collaborationService Param to declare variable.
   */
  constructor(collaborationService) {
    this._pool = new Pool();
    this._collaborationService = collaborationService;
  }

  /**
   * Add playlist into database.
   * @param {*} param0 Group of params.
   * @return {*} Return is result of query.
   */
  async addPlaylist({name, owner}) {
    const id = `playlist-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  /**
   * Get playlists from database.
   * @param {*} user Param represent of user.
   * @return {*} Return is result of query.
   */
  async getPlaylists(user) {
    const query = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists 
      LEFT JOIN users ON users.id = playlists.owner
      LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id  
      WHERE playlists.owner = $1 OR collaborations.user_id = $1;`,
      values: [user],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  /**
   * Delete playlist by id from database.
   * @param {*} id Param represent of id.
   */
  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  /**
   * Add song to playlist database.
   * @param {*} playlistId Param represent of playlist id.
   * @param {*} songId Param represent of song id.
   */
  async addSongToPlaylist(playlistId, songId) {
    const query = {
      text: `INSERT INTO playlistsongs(playlist_id, song_id) 
      VALUES($1, $2) RETURNING id`,
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rows[0].id) {
      throw new InvariantError('Lagu gagal ditambahkan ke playlist');
    }
  }

  /**
   * Get songs from playlist database.
   * @param {*} playlistId Param represent of playlist id.
   * @return {*} Return is result of query.
   */
  async getSongsFromPlaylist(playlistId) {
    const query = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM songs
      JOIN playlistsongs
      ON songs.id = playlistsongs.song_id WHERE playlistsongs.playlist_id = $1`,
      values: [playlistId],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }

  /**
   * Delete song from playlist database.
   * @param {*} playlistId Param represent of playlist id.
   * @param {*} songId Param represent of song id.
   */
  async deleteSongFromPlaylist(playlistId, songId) {
    const query = {
      text: `DELETE FROM playlistsongs 
      WHERE playlist_id = $1 AND song_id = $2 RETURNING id`,
      values: [playlistId, songId],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new InvariantError('Lagu gagal dihapus');
    }
  }

  /**
   * Verify playlist owner from database.
   * @param {*} id Param represent of id.
   * @param {*} owner Param represent of owner.
   */
  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };

    const result = await this._pool.query(query);
    if (!result.rowCount) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  /**
   * Verify playlist access from database.
   * @param {*} playlistId Represent of playlist id.
   * @param {*} userId Represent of user id.
   */
  async verifyPlaylistAccess(playlistId, userId) {
    try {
      await this.verifyPlaylistOwner(playlistId, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      try {
        await this._collaborationService.verifyCollaborator(playlistId, userId);
      } catch {
        throw error;
      }
    }
  }

  /**
   * Get users by username from database.
   * @param {*} username Param represent of username.
   * @return {*} Return is result of query.
   */
  async getUsersByUsername(username) {
    const query = {
      text: 'SELECT id, username, fullname FROM users WHERE username LIKE $1',
      values: [`%${username}%`],
    };

    const result = await this._pool.query(query);
    return result.rows;
  }
}

module.exports = PlaylistsService;
