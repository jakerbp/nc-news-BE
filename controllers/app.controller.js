const { selectTopics, selectArticles, showEndpoints, selectArticle, selectArticleComments, insertComment, deleteCommentById } = require("../models/app.model");
const { checkExists } = require("../utils");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
    selectArticles().then((articles) => {
        res.status(200).send({ articles })
    })
    .catch(next)
}

exports.getArticle = (req, res, next) => {
  const { article_id } = req.params;
  selectArticle(article_id)
    .then((article) => {
      res.status(200).send({ article: article[0] });
    })
    .catch(next);
};

exports.getArticleComments = (req, res, next) => {
    const { article_id } = req.params;
    const commentPromises = [selectArticleComments(article_id), checkExists('articles', 'article_id', article_id)]
    Promise.all(commentPromises)
      .then((resolvedPromises) => {
        const articleComments = resolvedPromises[0]
        res.status(200).send({ articleComments });
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

exports.deleteComment = (req, res, next) => {
    const { comment_id } = req.params
    deleteCommentById(comment_id).then(()=>{
        res.sendStatus(204)
    })
    .catch(next)
}