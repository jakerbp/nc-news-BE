const db = require("../db/connection");

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
    if (rows.length === 1) {
        return rows[0]
    }
    return rows;
  });
};
