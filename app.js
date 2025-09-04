import express from "express";
import db from "#db/client";
import PgUserRepo from "#db/repo_implementations/PgUserRepo";
import PgTaskRepo from "#db/repo_implementations/PgTaskRepo";
import sanityCheckForRepos from "#middleware/sanityCheckForRepos";
import userRouter from "#middleware/routing/users";
import taskRouter from "#middleware/routing/tasks";

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  req.userRepo = new PgUserRepo({ pgClient: db });
  req.taskRepo = new PgTaskRepo({ pgClient: db });
  next();
});
app.use(sanityCheckForRepos);

app.use("/users", userRouter);
app.use("/tasks", taskRouter);

app.use((err, req, res, next) => {
  switch (err.code) {
    // Invalid type
    case "22P02":
      return res.status(400).send(err.message);
    // Unique constraint violation
    case "23505":
    // Foreign key violation
    case "23503":
      return res.status(400).send(err.detail);
    default:
      next(err);
  }
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).send("Sorry! Something went wrong.");
});

export default app;
