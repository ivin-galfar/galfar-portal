const express = require("express");
const { feedReceipt } = require("../Controllers/receiptController");

const router = express.Router();
router.route("/").post(feedReceipt);

module.exports = router;
