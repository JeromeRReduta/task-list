export default class TaskRepo {
  #db;

  constructor({ pgClient }) {
    this.#db = pgClient;
  }

  async getAllAsync() {
    const { rows: tasks } = await this.#db.query({
      text: `SELECT * FROM tasks`,
    });
    return tasks;
  }

  async getAllByUserIdAsync({ userId }) {
    const { rows: tasks } = await this.#db.query({
      text: `
        SELECT * FROM tasks
        WHERE user_id = $1
        `,
      values: [userId],
    });
    return tasks;
  }

  async getByIdAsync({ id }) {
    const {
      rows: [task],
    } = await this.#db.query({
      text: `SELECT * FROM tasks
            WHERE id = $1`,
      values: [id],
    });
    return task;
  }

  async createAsync({ title, done = false, userId }) {
    const {
      rows: [task],
    } = await this.#db.query({
      text: `
                INSERT INTO tasks (title, done, user_id)
                VALUES ($1, $2, $3)
                RETURNING *
                `,
      values: [title, done, userId],
    });
  }

  async updateByIdAsync({ id, title, done }) {
    const {
      rows: [task],
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
    return task;
  }

  async deleteByIdAsync({ id }) {
    const {
      rows: [user],
    } = await this.#db.query({
      text: `
            DELETE FROM tasks
            WHERE id = $1
            RETURNING *
        `,
      values: [id],
    });
    return user;
  }
}
