const express = require("express");
const { getTopics, getArticles, getArticle, getEndpoints } = require("./controllers/app.controller");
const { handleCustomErrors, handleServerErrors, handle404, handlePsqlErrors } = require("./errors");
const app = express();

app.get('/api/topics', getTopics)

app.get('/api/articles', getArticles)

app.get('/api/articles/:article_id', getArticle)

app.get('/api', getEndpoints)

app.all('*', handle404)
app.use(handleCustomErrors)
app.use(handlePsqlErrors)
app.use(handleServerErrors)
module.exports = app