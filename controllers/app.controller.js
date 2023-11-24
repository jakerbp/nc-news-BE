const {
  selectTopics,
  selectArticles,
  showEndpoints,
  selectArticle,
  selectArticleComments,
  insertComment,
  selectUsers,
  deleteCommentById,
  updateArticle,
} = require("../models/app.model");

const { checkExists } = require("../utils");

exports.getTopics = (req, res, next) => {
  selectTopics()
    .then((topics) => {
      res.status(200).send({ topics });
    })
    .catch(next);
};

exports.getArticles = (req, res, next) => {
  const { topic, sort_by, order } = req.query;
  const articlePromises = [selectArticles(topic, sort_by, order)];
  if (topic) {
    let lowerTopic = topic.toLowerCase();
    articlePromises.push(checkExists("topics", "slug", lowerTopic));
  }
  Promise.all(articlePromises)
    .then((resolvedPromises) => {
      const articles = resolvedPromises[0];
      res.status(200).send({ articles });
    })
    .catch(next);
};

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
  const commentPromises = [
    selectArticleComments(article_id),
    checkExists("articles", "article_id", article_id),
  ];
  Promise.all(commentPromises)
    .then((resolvedPromises) => {
      const articleComments = resolvedPromises[0];
      res.status(200).send({ articleComments });
    })
    .catch(next);
};

exports.getEndpoints = (req, res) => {
  const endpoints = showEndpoints();
  res.status(200).send({ endpoints });
};

exports.patchArticle = (req, res, next) => {
  const { article_id } = req.params;
  const { inc_votes } = req.body;
  updateArticle(article_id, inc_votes)
    .then((updatedArticle) => {
      res.status(200).send({ updatedArticle });
    })
    .catch(next);
};

exports.postComment = (req, res, next) => {
  const newComment = req.body;
  const { article_id } = req.params;
  insertComment(newComment, article_id)
    .then((addedComment) => {
      res.status(201).send({ addedComment: addedComment[0] });
    })
    .catch(next);
};

exports.getUsers = (req, res, next) => {
  selectUsers()
    .then((users) => {
      res.status(200).send({ users });
    })
    .catch(next);
};

exports.deleteComment = (req, res, next) => {
  const { comment_id } = req.params;
  deleteCommentById(comment_id)
    .then(() => {
      res.sendStatus(204);
    })
    .catch(next);
};
