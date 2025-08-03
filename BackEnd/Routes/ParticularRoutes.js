const express = require("express");
const {
  feedParticulars,
  fetchParticulars,
  fetchParticularstemplate,
  deleteparticular,
} = require("../Controllers/particularsController");

const router = express.Router();
router.route("/").post(feedParticulars);
router.route("/").get(fetchParticulars);
router.route("/:pid").get(fetchParticularstemplate);
router.route("/:pid").delete(deleteparticular);

module.exports = router;
