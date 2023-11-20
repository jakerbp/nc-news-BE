const db = require('../db/connection')
const endpoints = require('../endpoints.json')

exports.selectTopics = () => {
    let queryString = `SELECT * FROM topics `
    return db.query(queryString).then(({ rows }) => {
        return rows
    })
}

exports.showEndpoints = () => {
    return endpoints
}