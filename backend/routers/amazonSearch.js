const express = require("express");
const router = express.Router();
const AmazonSearchController = require("../controllers/amazonSearch.js");

router.get('/list', AmazonSearchController.listAmazonBoards);
router.get('/:fileid', AmazonSearchController.getAmazonBoard);

module.exports = router;
