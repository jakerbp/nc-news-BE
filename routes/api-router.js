const apiRouter = require('express').Router();
const { getEndpoints } =  require("../controllers/app.controller");

apiRouter.get('/', getEndpoints)

module.exports = apiRouter;