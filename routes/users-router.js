const usersRouter = require("express").Router();
const { getUsers, getUser } = require("../controllers/app.controller");

usersRouter.get("/", getUsers);
usersRouter.route("/:username").get(getUser)

module.exports = usersRouter;
