const express = require('express')
const { togleLike } = require('../controllers/likecontroles')

const likeRouter = express.Router()

likeRouter.post('/',togleLike)


module.exports = likeRouter