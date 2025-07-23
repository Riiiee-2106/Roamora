// Load environment variables (only in development)
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

// External modules
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const session = require("express-session");
const MongoStore = require("connect-mongo")
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const expressLayouts = require("express-ejs-layouts");

// Models and utils
const User = require("./models/user.js");
const ExpressError = require("./utils/ExpressError.js");

// Routes
const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");


// Middleware
const { saveRedirectUrl } = require("./middleware.js");

const app = express();
const db_URL = process.env.ATLASDB_URL;

// Database connection
async function main() {
    await mongoose.connect(db_URL);
    console.log("Connected to MongoDB");
}
main().catch(err => console.log(err));

// App settings
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);
app.use(expressLayouts);
app.set("layout", "layouts/boilerplate");
app.set("views", "./views");

app.use(express.static("public"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.static('public'));


const store = MongoStore.create({
    mongoUrl:db_URL,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter:24*3600,
});


store.on("error",()=>{
    console.log("ERROR in MONGO SESSION STORE",err);
});


// Session config
const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    }
};



app.use(session(sessionOptions));
app.use(flash());

// Passport config
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// Flash + user middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

// Routes
app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews", reviewsRouter);
app.use("/", saveRedirectUrl, userRouter);



// 404 handler
app.use((req, res) => {
    res.status(404).render("error", { message: "Page Not Found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.log("Error caught in middleware:", err.message);
    if (res.headersSent) return next(err);
    req.flash("error", "Something went wrong!");
    res.redirect("/listings");
});

// Server
app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});










