const { selectTopics, selectArticles } = require("../models/app.model");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticle = (req, res, next) => {
    const {article_id} = req.params
  selectArticles(article_id)
    .then((article) => {
        console.log({article})
      res.status(200).send({ article });
    })
    .catch(next);
};
