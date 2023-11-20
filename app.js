const express = require("express");
const { getTopics, getEndpoints } = require("./controllers/app.controller");
const { handleCustomErrors, handleServerErrors } = require("./errors");
const app = express();
app.use(express.json())

app.get('/api/topics', getTopics)

app.get('/api', getEndpoints)

app.use(handleCustomErrors)
app.use(handleServerErrors)
module.exports = app