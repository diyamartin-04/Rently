const express = require("express");
const router = express.Router({mergeParams: true});
const Review = require("../models/review.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const Listing = require("../models/listing");


const validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        return next(new ExpressError(400, errMsg));
    }
    next();
};

//Post Review Routes
router.post("/", validateReview, wrapAsync(async(req, res) =>{
    let listing = await Listing.findById(req.params.id);
    let newReview = new Review(req.body.review);

    // Attach the logged-in user as the author when there is one
    if (res.locals.currentUser) {
        newReview.author = res.locals.currentUser.id;
    }

    listing.reviews.push(newReview);

    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${listing._id}`);

}));

//Delete Routes
router.delete("/:reviewId", wrapAsync(async(req,res) =>{
    let {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});
    await Review.findByIdAndDelete(reviewId);

    res.redirect(`/listings/${id}`);
}));

module.exports = router;
