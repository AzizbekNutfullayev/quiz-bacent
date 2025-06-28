const express = require('express');
const { getphoto, myphoto, adphoto, deletePhoto } = require('../controllers/photocontrollers');
const uploadMiddleware = require('../middlew/uplodisPhoto');

const photoRouter = express.Router();


photoRouter.get('/get',getphoto);
photoRouter.get('/:userid',myphoto);
photoRouter.post('/add',uploadMiddleware, adphoto);
photoRouter.delete('/:id',deletePhoto)

module.exports = photoRouter;
