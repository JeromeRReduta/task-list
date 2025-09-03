/**
 * @typedef User
 * @property {Number} id
 * @property {String} username
 * @property {String} password
 */

export function createUser({ id, username, password }) {
  return { id, username, password };
}

/**
 * @typedef UserWithTasks
 * @property {Number} id
 * @property {String} username
 * @property {String} password
 * @property {Task[]} tasks
 */

export function createUser({ id, username, password, tasks }) {
  return { id, username, password, tasks };
}

/**
 * @typedef Task
 * @property {Number} id
 * @property {String} title
 * @property {boolean} done
 * @property {Number} userId
 */

export function createTask({ id, title, done, userId }) {
  return { id, title, done, userId };
}
