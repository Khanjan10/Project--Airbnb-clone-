const Review = require("../models/review.js");
const Listing = require("../models/listing.js");

module.exports.createReview = async (req, res, next) => {
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);
    newReview.author = req.user._id;
    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);
};

module.exports.destroyReview = async (req, res) => {
    let {id, reviewId} = req.params;

    let d = await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    let r = await Review.findByIdAndDelete(reviewId);

    console.log(d);
    console.log(r);
    res.redirect(`/listings/${id}`);
};