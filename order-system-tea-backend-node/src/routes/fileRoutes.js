const express = require('express');
const router = express.Router();
const FileController = require('../controllers/fileController');
const upload = require('../middleware/upload');

router.post('/upload', upload.single('file'), FileController.upload);

module.exports = router;

