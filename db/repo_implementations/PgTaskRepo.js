export default class TaskRepo {
  #db;

  constructor({ pgClient }) {
    this.#db = pgClient;
  }

  async getAllAsync() {
    const { rows } = await this.#db.query({
      text: `SELECT * FROM tasks`,
    });
    return rows.map((row) => mapPostgresToTask({ postgres: row }));
  }

  async getAllByUserIdAsync({ userId }) {
    const { rows } = await this.#db.query({
      text: `
        SELECT * FROM tasks
        WHERE user_id = $1
        `,
      values: [userId],
    });
    return rows.map((row) => mapPostgresToTask({ postgres: row }));
  }

  async getByIdAsync({ id }) {
    const {
      rows: [row],
    } = await this.#db.query({
      text: `SELECT * FROM tasks
            WHERE id = $1`,
      values: [id],
    });
    return mapPostgresToTask({ postgres: row });
  }

  async createAsync({ title, done = false, userId }) {
    const {
      rows: [row],
    } = await this.#db.query({
      text: `
                INSERT INTO tasks (title, done, user_id)
                VALUES ($1, $2, $3)
                RETURNING *
                `,
      values: [title, done, userId],
    });
    return mapPostgresToTask({ postgres: row });
  }

  async updateByIdAsync({ id, title, done }) {
    const {
      rows: [row],
    } = await this.#db.query({
      /** For now, let's not give repo the ability to change userId for task */
      text: `
                UPDATE tasks SET (title, done)
                            = ($1,    $2)
                WHERE id = $3
                RETURNING *
            `,
      values: [title, done, id],
    });
    return mapPostgresToTask({ postgres: row });
  }

  async deleteByIdAsync({ id }) {
    const {
      rows: [row],
    } = await this.#db.query({
      text: `
            DELETE FROM tasks
            WHERE id = $1
            RETURNING *
        `,
      values: [id],
    });
    return mapPostgresToTask({ postgres: row });
  }
}

export function mapPostgresToTask({
  postgres: { id, title, done, user_id: userId },
}) {
  return createTask({
    id,
    title,
    done,
    userId,
  });
}
