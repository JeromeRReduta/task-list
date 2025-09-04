import express from "express";
import getUserFromToken from "#middleware/getUserFromToken";
import requireUser from "#middleware/requireUser";
import requireBody from "#middleware/requireBody";

/** Preconditions:
 * 1. req.userRepo and taskRepo exist
 */
const router = express.Router();

router.use(getUserFromToken);
router.use(requireUser);

router
  .route("/")
  .get(getOwnedTasks)
  .post(requireBody(["title", "done"]), createTask);
router.param("id", requireValidNum);

router
  .route("/:id")
  .put(requireAuthorized, requireBody(["title", "done"]), updateTask)
  .delete(requireAuthorized, deleteTask);

async function getOwnedTasks(req, res) {
  const tasks = await req.taskRepo.getAllByUserIdAsync({ userId: req.user.id });
  if (!tasks) {
    return res
      .status(404)
      .send(
        "User doesn't exist! (Actually, this shouldn't run - how did you get here?)"
      );
  }
  res.status(200).send(tasks);
}

/** Preconditions:
 * 1. req.taskRepo exists
 * 2. req.body.title and .done exist
 * 3. req.user.id exists
 */
async function createTask(req, res) {
  const { title, done } = req.body;
  const { userId } = req.user;
  const newTask = await req.taskRepo.createAsync({ title, done, userId });
  return res.status(201).send(newTask);
}

/** Preconditions:
 * 1. req.params.id exists (by default, as a string)
 */
function requireValidNum(req, res, next, id) {
  const SQL_MAX = 2147483647;
  const parsed = +id;
  if (isNaN(id)) {
    return res.status(400).send(`${req.params.id} isn't a number!`);
  }
  if (id < 1 || id > SQL_MAX) {
    return res.status(400).send(`${req.params.id} isn't an allowed number!`);
  }
  console.log(
    "id before:",
    req.params.id,
    "with type of",
    typeof req.params.id
  );

  req.params.id = parsed;
  console.log("id after:", req.params.id, "with type of", typeof req.params.id);
  next();
}

/** Preconditions:
 * 1. req.taskRepo exists
 * 2. req.user.id exists
 */
async function requireAuthorized(req, res, next) {
  const { id } = req.params;
  const task = await req.taskRepo.getByIdAsync({ id });
  if (!task) {
    return res.status(404).send("Task w/ this id doesn't exist");
  }
  if (task.userId !== req.user.id) {
    return res.status(403).send("You don't own this task!");
  }
  next();
}

/** Preconditions:
 * 1. req.taskRepo exists
 * 2. req.body.title and .done exist
 * 3. req.params.id exists AND is a valid int
 * 4. user is authorized (i.e. their id is the same as task's user id)
 */
async function updateTask(req, res) {
  const { title, done } = req.body;
  const { id } = req.params;
  const updatedTask = await req.taskRepo.updateByIdAsync({ id, title, done });
  if (!updatedTask) {
    return res.status(404).send("No task with this id found");
  }
  return res.status(200).send(updatedTask);
}

/**
 * Preconditions:
 * 1. req.taskRepo exists
 * 2. req.params.id exists AND is a valid int
 * 3. user is authorized (i.e. their id is the same as task's user id)
 */
async function deleteTask(req, res) {
  const { id } = req.params;
  const deletedTask = await req.taskRepo.deleteByIdAsync({ id });
  if (!deletedTask) {
    return res.status(404).send("No task with this id found");
  }
  return res.status(200).send(deletedTask);
}

export default router;
