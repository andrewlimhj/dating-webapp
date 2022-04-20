/* eslint-disable consistent-return */
/* eslint-disable class-methods-use-this */
import pool from '../initPool.js';

class MessageService {
  constructor() {
    this.pool = pool;
  }

  async listMessagesByRoom(roomId) {
    try {
      const resp = await pool.query('SELECT * FROM messages WHERE roomid=$1', [
        roomId,
      ]);
      return resp.rows.length === 0 ? [] : resp.rows;
    } catch (err) {
      console.error(err);
    }
  }

  async createMessage(roomId, sender, message) {
    try {
      const resp = await pool.query(
        'INSERT INTO messages (roomid, sender, message) VALUES ($1, $2, $3) RETURNING *',
        [roomId, sender, message]
      );
      return resp.rows.length === 0 ? null : resp.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

  async getUserDataA(userId) {
    try {
      const resp = await pool.query(
        'SELECT * FROM user_account WHERE user_account.id=$1',
        [userId]
      );
      return resp.rows.length === 0 ? null : resp.rows[0];
    } catch (err) {
      console.error(err);
    }
  }

  async getUserDataB(id) {
    try {
      const resp = await pool.query(
        'SELECT * FROM user_account WHERE user_account.id=$1',
        [id]
      );
      return resp.rows.length === 0 ? null : resp.rows[0];
    } catch (err) {
      console.error(err);
    }
  }
}

export default MessageService;
