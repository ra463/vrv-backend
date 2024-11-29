const express = require("express");
const {
  registerUser,
  loginUser,
  googleLogin,
} = require("../controllers/userController.js");
const { getAllUsers } = require("../controllers/noteController.js");
const { adminAuth } = require("../middlewares/auth.js");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.get("/google-login", googleLogin);

router.get("/get-all-users", adminAuth, getAllUsers);

module.exports = router;
