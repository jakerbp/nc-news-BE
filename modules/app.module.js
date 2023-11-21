const db = require('../db/connection')

exports.selectTopics = () => {
    let queryString = `SELECT * FROM topics `
    return db.query(queryString).then(({ rows }) => {
        return rows
    })
}

exports.selectArticles = () => {
    let queryString = `SELECT articles.article_id, articles.title, articles.topic, articles.author, articles.created_at, articles.votes, articles.article_img_url, COUNT(comments.article_id)::int AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC `
    return db.query(queryString).then(({ rows }) => {
        return rows
    })
}