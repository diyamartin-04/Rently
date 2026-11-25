const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema, reviewSchema } = require("../schema.js");
const escapeRegex = require("../utils/escapeRegex.js");
const { loadListingPage, prefillFrom } = require("../utils/listingPage.js");
const { iconFor } = require("../utils/amenities.js");



const validateListing = (req, res, next) => {
    const { error } = listingSchema.validate(req.body, { abortEarly: false });

    if (error) {
        const errMsg = error.details.map(el => el.message).join(", ");
        return next(new ExpressError(400, errMsg));
    }
    next();
};

// The form sends amenities as "Wifi, Kitchen, Pool"; store them as an array
const normalizeListing = (data = {}) => {
    const cleaned = { ...data };
    if (typeof cleaned.amenities === "string") {
        cleaned.amenities = cleaned.amenities
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 80);
    }
    return cleaned;
};


//Index Route
router.get("/", wrapAsync(async (req, res) => {
    // Optional ?q= search across title, location and country
    const q = typeof req.query.q === "string" ? req.query.q.trim().slice(0, 100) : "";

    // Optional ?guests= filter: only listings that fit at least this many guests
    const guests = parseInt(req.query.guests, 10);
    const guestCount = guests >= 1 && guests <= 20 ? guests : 0;

    let filter = {};
    if (q) {
        const pattern = new RegExp(escapeRegex(q), "i");
        filter.$or = [{ title: pattern }, { location: pattern }, { country: pattern }];
    }
    if (guestCount) {
        filter.guests = { $gte: guestCount };
    }

    const allListings = await Listing.find(filter);
    res.render("listings/index", { allListings, q, guests: guestCount });
}));

//New Route
router.get("/new", (req, res) => {
    res.render("listings/new");
});

//Show Route
router.get("/:id", wrapAsync(async (req, res) => {
    const data = await loadListingPage(req.params.id);
    const prefill = prefillFrom(req.query, data.listing.guests || 2);

    res.render("listings/show", {
        ...data,
        prefill,
        amenityIcon: iconFor,
        bookingError: null,
    });
}));

//Edit Route
router.get("/:id/edit", wrapAsync(async (req, res) => {
    let { id } = req.params;
    const listing = await Listing.findById(id);

    if (!listing) {
        throw new ExpressError(404, "Listing not found!");
    }

    res.render("listings/edit", { listing });
}));

//Create Route
router.post("/", validateListing, wrapAsync(async (req, res) => {
    const data = normalizeListing(req.body.listing);
    if (res.locals.currentUser) {
        data.owner = res.locals.currentUser.id;
    }
    const newListing = new Listing(data);
    await newListing.save();
    res.redirect("/listings");
}));

//Update Route
router.put("/:id", validateListing, wrapAsync(async (req, res) => {
    await Listing.findByIdAndUpdate(req.params.id, normalizeListing(req.body.listing));
    res.redirect(`/listings/${req.params.id}`);
}));

//Delete Route
router.delete("/:id", wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
}));


module.exports = router;
