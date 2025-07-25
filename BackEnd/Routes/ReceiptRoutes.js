const express = require("express");
const {
  feedReceipt,
  fetchReceipts,
  fetchReceipt,
} = require("../Controllers/receiptController");

const router = express.Router();
router.route("/").post(feedReceipt);
router.route("/").get(fetchReceipts);
router.route("/:mrno").get(fetchReceipt);

module.exports = router;
