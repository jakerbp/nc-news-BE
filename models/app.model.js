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
  let queryString = `SELECT articles.*, COUNT(comments.article_id)::int AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id;`;
  const queryValues = [article_id];

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

exports.selectArticles = (topic, sort_by = 'created_at', order = 'desc') => {
  const upperOrder = order.toUpperCase();
  const lowerSortBy = sort_by.toLowerCase();
  const validOrder = ["ASC", "DESC"]
  const validSortBy = ["article_id", "title", "topic", "author", "created_at", "votes", "comment_count"]
  let queryString = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::int AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id `;
  const queryValues = [];
  let errMsg = []
  if (lowerSortBy && !validSortBy.includes(lowerSortBy)) {
    errMsg.push(`Bad request! ${sort_by} is not a valid sort field.`)
  }
  if (upperOrder && !validOrder.includes(upperOrder)) {
    errMsg.push(`Bad request! ${order} is not a valid order type.`)
  }
  if(errMsg.length !== 0){
   errString = errMsg.join(' ')
  return Promise.reject({ status: 400, msg: errString });
  }

  if (topic) {
    let lowerTopic = topic.toLowerCase();
    queryValues.push(lowerTopic);
    queryString += `WHERE topic = $1`;
  }

  let queryStringEnd = `GROUP BY articles.article_id ORDER BY ${lowerSortBy} ${upperOrder} `;

  return db
    .query(queryString + queryStringEnd, queryValues)
    .then(({ rows }) => {
      return rows;
    });
};

exports.showEndpoints = () => {
  return endpoints;
};

exports.updateArticle = (article_id, updateVotes) => {
  if (!updateVotes) {
    return Promise.reject({ status: 400, msg: "Bad request!" });
  }
  let queryString = `UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *;`;
  const queryValues = [updateVotes, article_id];
  return db.query(queryString, queryValues).then(({ rows }) => {
    if (rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Article not found!" });
    }
    return rows[0];
  });
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

exports.selectUsers = () => {
  let queryString = `SELECT * FROM users `;
  return db.query(queryString).then(({ rows }) => {
    return rows;
  });
};

exports.deleteCommentById = (comment_id) => {
  return db
    .query(`DELETE from comments WHERE comment_id = $1 RETURNING *;`, [
      comment_id,
    ])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({
          status: 404,
          msg: `Comment with id ${comment_id} does not exist!`,
        });
      }
    });
};
