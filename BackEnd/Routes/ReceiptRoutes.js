const express = require("express");
const {
  feedReceipt,
  fetchReceipts,
} = require("../Controllers/receiptController");

const router = express.Router();
router.route("/").post(feedReceipt);
router.route("/").get(fetchReceipts);

module.exports = router;
