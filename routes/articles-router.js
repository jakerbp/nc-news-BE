const articlesRouter = require("express").Router();
const {
  getArticles,
  getArticle,
  getArticleComments,
  patchArticle,
  postComment,
} = require("../controllers/app.controller");

articlesRouter.get("", getArticles);
articlesRouter.route("/:article_id").get(getArticle).patch(patchArticle);
articlesRouter
  .route("/:article_id/comments")
  .get(getArticleComments)
  .post(postComment);

module.exports = articlesRouter;
