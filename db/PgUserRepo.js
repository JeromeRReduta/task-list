import bcrypt from "bcrypt";

export default class PgUserRepo {
  #db;

  constructor({ pgClient }) {
    this.#db = pgClient;
  }

  async getAllAsync() {
    const { rows: users } = await this.#db.query({
      text: `SELECT * FROM users`,
    });
    return users;
  }

  async getAllWithTasksAsync() {
    const { rows: users } = await this.#db.query({
      text: `
        SELECT u.*, JSON_AGG(t.*) AS tasks
        FROM users AS u
        JOIN tasks AS t ON t.user_id = u.id
        GROUP BY u.id
        ORDER BY u.id
        `,
    });
    return users;
  }

  async getByIdAsync({ id }) {
    const {
      rows: [user],
    } = await this.#db.query({
      text: `
        SELECT * FROM users
        WHERE id = $1
        `,
      values: [id],
    });
    return user;
  }

  async getByIdWithTasksAsync({ id }) {
    const {
      rows: [user],
    } = await this.#db.query({
      text: `
        SELECT u.*, JSON_AGG(t.*) AS tasks
        FROM users AS u
        JOIN tasks AS t ON t.user_id = u.id
        WHERE u.id = $1
        GROUP BY u.id
        `,
      values: [id],
    });
    return user;
  }

  async getByLoginInfoAsync({ loginInfo: { username, password } }) {
    const {
      rows: [user],
    } = await this.#db.query({
      text: `
        SELECT * FROM users
        WHERE username = $1
        `,
      values: [username],
    });
    if (!user) {
      return null;
    }
    const hasMatchingPassword = await bcrypt.compare(password, user.password);
    if (!hasMatchingPassword) {
      return null;
    }
    return user;
  }

  async getByLoginInfoWithTasksAsync({ loginInfo: { username, password } }) {
    const {
      rows: [user],
    } = await this.#db.query({
      text: `
        SELECT u.*, JSON_AGG(t.*) AS tasks
        FROM users AS u
        JOIN tasks AS t ON t.user_id = u.id
        WHERE u.username = $1
        GROUP BY u.id
        `,
      values: [username],
    });
    if (!user) {
      return null;
    }
    const hasMatchingPassword = await bcrypt.compare(password, user.password);
    if (!hasMatchingPassword) {
      return null;
    }
    return user;
  }
}
