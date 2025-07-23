const Listing = require("./models/listings");
const Review = require("./models/review");
const ExpressError = require("./utils/ExpressError.js");
const{listingSchema,reviewSchema}=require("./schema.js");
const mongoose = require("mongoose");

module.exports.isLoggedIn =(req,res,next)=>{
if (!req.isAuthenticated()){
      req.session.redirectUrl =req.originalUrl;

        req.flash("error","you must be logged in to create listing");
       return res.redirect("/login");
 }
 next();
};


module.exports.saveRedirectUrl = (req,res,next)=>{
      if(req.session.redirectUrl){
            res.locals.redirectUrl =req.session.redirectUrl;
      }
      next();
};




module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid Listing ID");
    return res.redirect("/listings");
  }

  let listing = await Listing.findById(id);
  if (!listing || !listing.owner._id.equals(res.locals.currUser._id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }

  next();
};




//validate listing
module.exports.validateListing = (req,res,next)=>{
   let{error} = listingSchema.validate(req.body);
   console.log("Validation check:", req.body);


    if(error){
        let errorMsg = error.details.map((el)=>el.message).join(",");
        throw new ExpressError(400, errorMsg);
    }
   else{
     console.log("Validation passed");
    next();
   }
    };



       //validate review
   module.exports.validateReview = (req,res,next)=>{
       let{error} = reviewSchema.validate(req.body);
       console.log("Validation check:", req.body);
        if(error){
            let errorMsg = error.details.map((el)=>el.message).join(",");
            throw new ExpressError(400, errorMsg);
        }
       else{
         console.log("Validation passed");
        next();
       }
        };


        module.exports.isReviewAuthor = async(req,res,next)=>{
      let{id,reviewId} =req.params;
      let review = await Review.findById(reviewId);
       if (!review.author.equals(res.locals.currUser._id)) {
  req.flash("error", "You did not made this review");
  return res.redirect(`/listings/${id}`); }
next();
}