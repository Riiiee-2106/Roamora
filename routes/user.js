const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const { saveRedirectUrl } = require("../middleware.js");

const userController = require("../controllers/users.js");

/* ------------------  Sign Up Routes ------------------ */
router.route("/signup")
  .get(userController.renderSignUpForm)                    // Show signup form
  .post(wrapAsync(userController.signup));                 // Handle signup form submission

/* ------------------  Log In Routes ------------------ */
router.route("/login")
  .get(userController.renderLogInForm)                    // Show login form
  .post(
    saveRedirectUrl,                                      // Save the requested URL before login
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true
    }),
    userController.login                                  // Handle successful login
  );

/* ------------------  Log Out Route ------------------ */
router.get("/logout", userController.logout);              // Handle logout

module.exports = router;
