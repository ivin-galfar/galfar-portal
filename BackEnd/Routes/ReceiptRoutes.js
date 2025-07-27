const express = require("express");
const {
  feedReceipt,
  fetchReceipts,
  fetchReceipt,
  updatestatus,
} = require("../Controllers/receiptController");

const router = express.Router();
router.route("/").post(feedReceipt);
router.route("/").get(fetchReceipts);
router.route("/:mrno").get(fetchReceipt);
router.route("/:mrno").put(updatestatus);
module.exports = router;
