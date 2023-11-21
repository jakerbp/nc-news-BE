const { selectTopics, selectArticles, showEndpoints, insertComment } = require("../models/app.model");

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

exports.postComment = (req, res, next) => {
const newComment = req.body;
const { article_id } = req.params
 insertComment(newComment, article_id).then((addedComment)=>{
     res.status(201).send({addedComment: addedComment[0]})
 })
 .catch(next)
}
