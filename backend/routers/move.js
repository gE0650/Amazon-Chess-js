const express = require("express");
const router = express.Router();
const Movecontroller = require("../controllers/move.js");

router.post('/:fileid', Movecontroller.Movepiece);

// 对应前端 fetch(`${API_URL}/move/block/${FileID}`)
router.post("/block/:fileid", Movecontroller.PlaceBlock);

module.exports = router;
