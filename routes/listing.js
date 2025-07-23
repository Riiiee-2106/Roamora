const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const{listingSchema}=require("../schema.js");
const Listing = require("../models/listings.js");
const {isLoggedIn,isOwner,validateListing} = require("../middleware.js")

const listingController = require("../controllers/listings.js");
const multer = require('multer');

const {storage} = require("../cloudConfig.js");
const upload = multer({storage});





//index and create route
router.route("/")
.get(wrapAsync (listingController.index))
.post(isLoggedIn,
  upload.single("listing[image]"),
    validateListing,
  wrapAsync (listingController.createListing));




//New Route
router.get("/new",isLoggedIn,listingController.renderNewForm);


router.get("/:id", wrapAsync(listingController.showListing));


//update and delete route
router.route("/:id")
.put(
    isLoggedIn,
    isOwner,
    upload.single("listing[image]"),
    validateListing,wrapAsync (listingController.updateListing))
   .delete(
  isLoggedIn,
  isOwner,
  wrapAsync(listingController.destroyListing)
);




//Edit Route
router.get("/:id/edit",
    isLoggedIn,
    isOwner, wrapAsync(listingController.renderEditForm));



// Search listings by location
router.get("/search", async (req, res) => {
  const { q } = req.query;

  if (!q || q.trim() === "") {
    req.flash("error", "Please enter a location to search.");
    return res.redirect("/listings");
  }

  try {
    const regex = new RegExp(q, "i"); // case-insensitive
    const allListing = await Listing.find({ location: regex });

    if (allListing.length === 0) {
      req.flash("error", `No places found for "${q}"`);
      return res.redirect("/listings");
    }

    res.render("listings/index", { allListing });
  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong while searching.");
    res.redirect("/listings");
  }
});

module.exports = router;
