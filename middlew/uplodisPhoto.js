const multer = require('multer');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uplodes/");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "_" + file.originalname);
    },
});
const upload = multer({ storage });
const uploadMiddleware = upload.single('photo');
console.log(uploadMiddleware);
module.exports = uploadMiddleware;