const express = require("express");
const router = express.Router();
const SearchController = require("../controllers/search.js");

router.get('/:fileid', SearchController.Getchessboard);
router.get('/list', SearchController.Listchessboards)

module.exports = router;