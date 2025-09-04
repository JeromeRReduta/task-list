import express from "express";
import requireBody from "#middleware/requireBody";
import requireUser from "#middleware/requireUser";
import { createToken } from "#utils/jwt";

/**
 * Preconditions:
 * 1. req.userRepo and req.taskRepo exist
 */
const router = express.Router();

router
  .route("/register")
  .post(
    requireBody(["username", "password"]),
    registerUser,
    requireUser,
    serveToken({ isNewAccount: true })
  );

router
  .route("/login")
  .post(
    requireBody(["username", "password"]),
    requireRegistered,
    serveToken({ isNewAccount: false })
  );

/** Preconditions:
 * req.body.username and .password exists
 */
async function registerUser(req, res, next) {
  const { username, password } = req.body;
  req.user = await req.userRepo.createAsync({ username, password });
  next();
}

/** Preconditions:
 * 1. req.body.username and .password exists
 * 2. req.userRepo exists
 */
async function requireRegistered(req, res, next) {
  const { username, password } = req.body;
  const user = await req.userRepo.getByLoginInfoAsync({
    loginInfo: { username, password },
  });
  if (!user) {
    return res.status(401).send("Username or password don't match!");
  }
  req.user = user;
  next();
}

/** Preconditions:
 * req.user exists
 */
function serveToken({ isNewAccount }) {
  return async (req, res) => {
    const code = isNewAccount ? 201 : 200;
    const data = createToken({ id: req.user.id });
    return res.status(code).send(data);
  };
}

export default router;
