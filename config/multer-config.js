const multer= require('multer');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage, limits: {
    fieldSize: 10 * 1024 * 1024, // 10 MB field size limit for text fields
    fileSize: 5 * 1024 * 1024}, });

module.exports = upload;