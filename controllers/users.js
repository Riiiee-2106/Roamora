const User = require("../models/user");

/* ------------------  Render Sign Up Form ------------------ */
module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

/* ------------------  Handle User Sign Up ------------------ */
module.exports.signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Create a new user instance (username & email)
    const newUser = new User({ email, username });

    // Register user with password hashing
    const registeredUser = await User.register(newUser, password);
    console.log(registeredUser);

    // Auto login after registration
    await req.login(registeredUser, err => {
      if (err) throw err;
      req.flash("success", "Welcome to Roamora!");
      res.redirect("/listings");
    });

  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/signup");
  }
};

/* ------------------  Render Log In Form ------------------ */
module.exports.renderLogInForm = (req, res) => {
  res.render("users/login.ejs");
};

/* ------------------  Handle User Log In ------------------ */
module.exports.login = async (req, res) => {
  req.flash("success", "Welcome back to Roamora!");
  res.redirect(res.locals.redirectUrl || "/listings");
};

/* ------------------  Handle User Logout ------------------ */
module.exports.logout = (req, res, next) => {
  req.logout(err => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are logged out!");
    res.redirect("/listings");
  });
};
