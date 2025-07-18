const express = require("express");
const { registerUser, authUser } = require("../Controllers/userContoller");

const router = express.Router();
router.post("/login", authUser);
router.post("/register", registerUser);

module.exports = router;
