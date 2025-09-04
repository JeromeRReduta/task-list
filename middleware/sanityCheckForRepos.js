export default function sanityCheckForRepos(req, res, next) {
  if (!req.taskRepo || !req.userRepo) {
    res.status(500).send("Guess who forgot to set up the repos");
  }
  next();
}
