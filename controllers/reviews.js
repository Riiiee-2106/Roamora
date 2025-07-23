const Listing = require("../models/listings");
const Review = require("../models/review");

/* ------------------  Create Review ------------------ */
module.exports.createReview = async (req, res) => {
  const listing = await Listing.findById(req.params.id);
  if (!listing) {
    req.flash("error", "Listing not found.");
    return res.redirect("/listings");
  }

  // Create new review with user as author
  const newReview = new Review(req.body.review);
  newReview.author = req.user._id;

  // Add review to the listing's reviews array
  listing.reviews.push(newReview);

  await newReview.save();
  await listing.save();

  req.flash("success", "Review added!");
  res.redirect(`/listings/${listing._id}`);
};

/* ------------------  Delete Review ------------------ */
module.exports.destroyReview = async (req, res) => {
  const { id, reviewId } = req.params;

  // Ensure review exists before attempting to delete
  const review = await Review.findById(reviewId);
  if (!review) {
    req.flash("error", "Review not found.");
    return res.redirect(`/listings/${id}`);
  }

  // Remove reference to the review from the listing
  await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });

  // Delete the review itself
  await Review.findByIdAndDelete(reviewId);

  req.flash("success", "Review Deleted!");
  res.redirect(`/listings/${id}`);
};
