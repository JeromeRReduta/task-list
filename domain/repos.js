/**
 * UserRepo:
 *
 * + getAllAsync(): User[]
 * + getAllWithTasksAsync(): UserWithTasks[]
 * + getByIdAsync({id}): User
 * + getByIdWithTasksAsync({id}): UserWithTasks
 * + getByLoginInfo({username, password}): User
 * + getByLoginInfoWithTasksAsync({username, password}): UserWithTasks
 * + createAsync({username, password}): User
 * + deleteByIdAsync({userId}): User
 * (no update - users are not editable)
 */

/**
 * TaskRepo
 * + getAllAsync(): Task[]
 * + getByIdAsync({id}): Task
 * + updateByIdAsync({id, title, done}): Task
 * + deleteByIdAsync({id}): Task
 */
