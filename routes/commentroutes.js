const express = require('express');
const { getComments, likeComment, commentOnPost } = require('../controllers/comentcontrollers');
const commentRouter = express.Router()

commentRouter.post('/',commentOnPost)
commentRouter.get('get',getComments)
commentRouter.post('/like',likeComment)

module.exports = commentRouter;