const express = require("express");
const {
  feedParticulars,
  fetchParticulars,
  fetchParticularstemplate,
} = require("../Controllers/particularsController");

const router = express.Router();
router.route("/").post(feedParticulars);
router.route("/").get(fetchParticulars);
router.route("/:pid").get(fetchParticularstemplate);

module.exports = router;
