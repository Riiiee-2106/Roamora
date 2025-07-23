const mongoose = require("mongoose");
const Listing = require("../models/listings");
const axios = require("axios");

/* ------------------  Utility: Geocode location using Nominatim API ------------------ */
async function getCoordinates(location) {
  const response = await axios.get('https://nominatim.openstreetmap.org/search', {
    params: {
      q: location,
      format: 'json',
      limit: 1
    },
    headers: {
      'User-Agent': 'RoamoreoApp/1.0' // Required by Nominatim API
    }
  });

  const [result] = response.data;
  if (!result) throw new Error('Location not found');

  return {
    latitude: result.lat,
    longitude: result.lon
  };
}

/* ------------------ Index Page: Show all listings ------------------ */
module.exports.index = async (req, res) => {
  const allListing = await Listing.find({});
  res.render("listings/index.ejs", { allListing });
};

/* ------------------ Render New Listing Form ------------------ */
module.exports.renderNewForm = (req, res) => {
  res.render("listings/new.ejs");
};

/* ------------------  Create New Listing ------------------ */
module.exports.createListing = async (req, res, next) => {
  try {
    const { location } = req.body.listing;
    const newListing = new Listing(req.body.listing);
    newListing.owner = req.user._id;

    // If image file is uploaded
    if (req.file) {
      newListing.image = {
        url: req.file.path,
        filename: req.file.filename
      };
    }

    // Add geolocation (lat/lon) using Nominatim
    const coordinates = await getCoordinates(location);
    newListing.latitude = coordinates.latitude;
    newListing.longitude = coordinates.longitude;

    await newListing.save();

    req.flash("success", "New Listing Created!");
    res.redirect("/listings");
  } catch (err) {
    next(err);
  }
};

/* ------------------  Show Listing Details ------------------ */
module.exports.showListing = async (req, res) => {
  const { id } = req.params;

  // Validate ObjectId
  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid Listing ID");
    return res.redirect("/listings");
  }

  const listing = await Listing.findById(id)
    .populate({
      path: "reviews",
      populate: { path: "author" }
    })
    .populate("owner");

  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  res.render("listings/show.ejs", { listing });
};

/* ------------------  Render Edit Listing Form ------------------ */
module.exports.renderEditForm = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid Listing ID");
    return res.redirect("/listings");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  // Use Cloudinary transformation for smaller preview image
  let originalImageUrl = listing.image.url;
  originalImageUrl = originalImageUrl.replace('/upload', '/upload/w_250');

  res.render("listings/edit.ejs", { listing, originalImageUrl });
};

/* ------------------  Update Listing ------------------ */
module.exports.updateListing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid Listing ID");
    return res.redirect("/listings");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing you requested for does not exist!");
    return res.redirect("/listings");
  }

  await Listing.findByIdAndUpdate(id, { ...req.body.listing });

  // Update image if new file uploaded
  if (req.file) {
    listing.image = {
      url: req.file.path,
      filename: req.file.filename
    };
    await listing.save();
  }

  req.flash("success", "Listing Updated!");
  res.redirect(`/listings/${id}`);
};

/* ------------------  Delete Listing ------------------ */
module.exports.destroyListing = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    req.flash("error", "Invalid Listing ID");
    return res.redirect("/listings");
  }

  const listing = await Listing.findById(id);
  if (!listing) {
    req.flash("error", "Listing not found!");
    return res.redirect("/listings");
  }

  await Listing.findByIdAndDelete(id);

  req.flash("success", "Listing Deleted!");
  res.redirect("/listings");
};

/* ------------------  Search Listings by Location ------------------ */
module.exports.searchListings = async (req, res) => {
  const { location } = req.query;
  let allListing = [];

  if (location) {
    allListing = await Listing.find({
      location: { $regex: new RegExp(location, "i") }
    });
  }

  res.render("listings/index.ejs", { allListing });
};
