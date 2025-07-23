const express = require("express");
const router = express.Router({ mergeParams: true }); 
const Review = require("../models/review.js");
const Listing = require("../models/listings.js");
const { isLoggedIn, validateReview, isReviewAuthor } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync.js");



const reviewController =require("../controllers/reviews.js");


//Reviews
//Get Route
router.get("/", wrapAsync(async (req, res) => {
  const listing = await Listing.findById(req.params.id).populate("reviews");
res.redirect(`/listings/${req.params.id}`);
}));

//Post Route
router.post("/", isLoggedIn, validateReview, wrapAsync(reviewController.createReview));


//Delete review route
router.delete("/:reviewId",
    isLoggedIn,
    isReviewAuthor,
    wrapAsync(reviewController.destroyReview));



module.exports = router;