const { selectTopics, selectArticles, showEndpoints } = require("../models/app.model");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectArticles(article_id)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch(next);
};

exports.getEndpoints = (req, res) => {
  const endpoints = showEndpoints();
  res.status(200).send({ endpoints })
};
