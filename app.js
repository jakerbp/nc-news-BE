const express = require("express");
const app = express();

const apiRouter = require("./routes/api-router");
const articlesRouter = require("./routes/articles-router");
const topicsRouter = require("./routes/topics-router");
const usersRouter = require("./routes/users-router");
const commentsRouter = require("./routes/comments-router");

const {
  handleCustomErrors,
  handleServerErrors,
  handle404,
  handlePsqlErrors,
} = require("./errors");

app.use(express.json());
app.use("/api", apiRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/users", usersRouter);
app.use("/api/comments", commentsRouter);

app.all("*", handle404);
app.use(handleCustomErrors);
app.use(handlePsqlErrors);
app.use(handleServerErrors);
module.exports = app;
