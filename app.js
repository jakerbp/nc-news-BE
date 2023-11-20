const express = require("express");
const { getTopics } = require("./controllers/app.controller");
const { handleCustomErrors, handleServerErrors } = require("./errors");
const app = express();
app.use(express.json())

app.get('/api/topics', getTopics)

app.use(handleCustomErrors)
app.use(handleServerErrors)
module.exports = app