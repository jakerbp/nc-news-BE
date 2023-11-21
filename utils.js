exports.formatComment = (newComment, article_id) => {
return [newComment.body, article_id, newComment.username, 0, new Date().toISOString()]
}