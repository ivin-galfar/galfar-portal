const express = require("express");
const {
  feedReceipt,
  fetchReceipts,
  fetchReceipt,
  updatestatus,
  updateApprovalstatus,
  removeReceipt,
} = require("../Controllers/receiptController");

const router = express.Router();
router.route("/").post(feedReceipt);
router.route("/").get(fetchReceipts);
router.route("/:mrno").get(fetchReceipt);
router.route("/:mrno").delete(removeReceipt);
router.route("/:mrno").put(updatestatus);
router.route("/approver/:mrno").put(updateApprovalstatus);

module.exports = router;
