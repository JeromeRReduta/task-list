import bcrypt from "bcrypt";
import { createUser } from "#domain/entities";

const numSaltRounds = 10;

export default class PgUserRepo {
  #db;

  constructor({ pgClient }) {
    this.#db = pgClient;
  }

  async getAllAsync() {
    const { rows } = await this.#db.query({
      text: `SELECT * FROM users`,
    });
    return rows.map((row) => mapPostgresToUser({ postgres: row }));
  }

  async getAllWithTasksAsync() {
    const { rows } = await this.#db.query({
      text: `
        SELECT u.*, JSON_AGG(t.*) AS tasks
        FROM users AS u
        JOIN tasks AS t ON t.user_id = u.id
        GROUP BY u.id
        ORDER BY u.id
        `,
    });
    return rows.map((row) => mapPostgresToUserWithTasks({ postgres: row }));
  }

  async getByIdAsync({ id }) {
    const {
      rows: [row],
    } = await this.#db.query({
      text: `
        SELECT * FROM users
        WHERE id = $1
        `,
      values: [id],
    });
    return mapPostgresToUser({ postgres: row });
  }

  async getByIdWithTasksAsync({ id }) {
    const {
      rows: [row],
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
    return mapPostgresToUserWithTasks({ postgres: row });
  }

  async getByLoginInfoAsync({ loginInfo: { username, password } }) {
    const {
      rows: [row],
    } = await this.#db.query({
      text: `
        SELECT * FROM users
        WHERE username = $1
        `,
      values: [username],
    });
    if (!row) {
      return null;
    }
    const hasMatchingPassword = await bcrypt.compare(password, row.password);
    if (!hasMatchingPassword) {
      return null;
    }
    return mapPostgresToUser({ postgres: row });
  }

  async getByLoginInfoWithTasksAsync({ loginInfo: { username, password } }) {
    const {
      rows: [row],
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
    if (!row) {
      return null;
    }
    const hasMatchingPassword = await bcrypt.compare(password, row.password);
    if (!hasMatchingPassword) {
      return null;
    }
    return mapPostgresToUser({ postgres: row });
  }

  async createAsync({ username, password }) {
    const hash = await bcrypt.hash(password, numSaltRounds);
    const {
      rows: [row],
    } = await this.#db.query({
      text: `
            INSERT INTO users (username, password)
            VALUES ($1, $2)
            RETURNING *
            `,
      values: [username, hash],
    });
    return mapPostgresToUser({ postgres: row });
  }

  async deleteByIdAsync({ id }) {
    const {
      rows: [row],
    } = await this.#db.query({
      text: `
            DELETE FROM users
            WHERE id = $1
            RETURNING *
        `,
      values: [id],
    });
    return mapPostgresToUser({ postgres: row });
  }
}

export function mapPostgresToUser({ postgres: { id, username, password } }) {
  return createUser({ id, username, password });
}

export function mapPostgresToUserWithTasks({
  postgres: { id, username, password, tasks },
}) {
  return createUserWithTracks({ id, username, password, tasks });
}
