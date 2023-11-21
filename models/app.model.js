const db = require("../db/connection");
const endpoints = require("../endpoints.json");
const {formatComment} = require("../utils")
exports.selectTopics = () => {
  let queryString = `SELECT * FROM topics `;
  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

exports.selectArticles = (article_id) => {
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

exports.showEndpoints = () => {
  return endpoints;
};

exports.insertComment = (newComment, article_id) => {
  if(!newComment.username || !newComment.body){
    return Promise.reject({ status: 400, msg: "Bad request!" })
  }
  const formattedComment = formatComment(newComment, article_id)
  let queryString = `SELECT * FROM articles WHERE article_id = $1 `;

  return db.query(queryString, [article_id]).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found!" });
    } else {
  return db
    .query(`INSERT INTO comments (body, article_id, author, votes, created_at) VALUES ($1, $2, $3, $4, $5) RETURNING * ;`, formattedComment)
    .then(({ rows }) => {
      return rows;
    });
    }
  })
};
