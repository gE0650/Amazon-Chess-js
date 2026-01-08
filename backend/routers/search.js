const express = require("express");
const router = express.Router();
const SearchController = require("../controllers/search.js");

router.get('/list', SearchController.Listchessboards);
router.get('/:fileid', SearchController.Getchessboard);


module.exports = router;