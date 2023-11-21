const express = require("express");
const { getTopics, getArticles } = require("./controllers/app.controller");
const { handleCustomErrors, handleServerErrors, handle404 } = require("./errors");
const app = express();

app.get('/api/topics', getTopics)

app.get('/api/articles', getArticles)

app.all('*', handle404)
app.use(handleCustomErrors)
app.use(handleServerErrors)
module.exports = app