const express = require("express");
const router = express.Router();
const AmazonCreateController = require("../controllers/amazonCreate.js");

router.post('/:fileid', AmazonCreateController.createAmazonBoard);

module.exports = router;
