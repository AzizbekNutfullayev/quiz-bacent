const express = require('express');
const { sigup, login, getuser } = require('../controllers/usercontroles');
const userRouter= express.Router();

userRouter.get('/',getuser)
userRouter.post('/singup',sigup)
userRouter.post('/login',login)

module.exports = userRouter;