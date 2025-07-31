const express = require("express");
const {
  feedParticulars,
  fetchParticulars,
} = require("../Controllers/particularsController");

const router = express.Router();
router.route("/").post(feedParticulars);
router.route("/").get(fetchParticulars);

module.exports = router;
