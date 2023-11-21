const db = require("../db/connection");
const endpoints = require('../endpoints.json')

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

exports.selectArticles = () => {
  let queryString = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::int AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC `
  return db.query(queryString).then(({ rows }) => {
      return rows
  })
}

exports.showEndpoints = () => {
    return endpoints
}

