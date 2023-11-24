const db = require("../db/connection");
const endpoints = require("../endpoints.json");
const { formatPostedComment } = require("../utils");

exports.selectTopics = () => {
  let queryString = `SELECT * FROM topics `;
  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticle = (article_id) => {
  let queryString = `SELECT * FROM articles `;
  const queryValues = [];

  if (article_id) {
    queryValues.push(article_id);
    queryString += `WHERE article_id = $1 `;
  }

  return db.query(queryString, queryValues).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found!" });
    }
    return rows;
  });
};

exports.selectArticleComments = (article_id) => {
  let queryString = `SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC`;
  const queryValues = [article_id];

  return db.query(queryString, queryValues).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticles = (topic) => {
  let queryString = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::int AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id `;
  const queryValues = [];
 
  if (topic) {
    let lowerTopic = topic.toLowerCase()
    queryValues.push(lowerTopic);
    queryString += `WHERE topic = $1`;
  }
  
  let queryStringEnd = `GROUP BY articles.article_id ORDER BY articles.created_at DESC `;
  
  return db
    .query(queryString + queryStringEnd, queryValues)
    .then(({ rows }) => {
      return rows;
    });
};

exports.showEndpoints = () => {
  return endpoints;
};

exports.insertComment = (newComment, article_id) => {
  if (!newComment.username || !newComment.body) {
    return Promise.reject({ status: 400, msg: "Bad request!" });
  }
  const formattedComment = formatPostedComment(newComment, article_id);

  return db
    .query(
      `INSERT INTO comments (body, article_id, author, votes, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING * ;`,
      formattedComment
    )
    .then(({ rows }) => {
      return rows;
    });
};
