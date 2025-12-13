const express = require("express");
const router = express.Router();
const Createcontroller = require("../controllers/create.js");

router.post('/:fileid', Createcontroller.Addchessboard);

module.exports = router;
