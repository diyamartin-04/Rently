const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const wrapAsync = require("../utils/wrapAsync.js");
const ExpressError = require("../utils/ExpressError.js");
const { isDateKey, todayKey, nightsBetween } = require("../utils/dates.js");
const { loadListingPage, prefillFrom } = require("../utils/listingPage.js");
const { iconFor } = require("../utils/amenities.js");

const MAX_NIGHTS = 30;
const OBJECT_ID = /^[a-f\d]{24}$/i;

const requireLogin = (req, res, next) => {
    if (!res.locals.currentUser) {
        return res.redirect(`/login?next=${encodeURIComponent(req.originalUrl)}`);
    }
    next();
};

const assertValidId = (id) => {
    if (!OBJECT_ID.test(id)) {
        throw new ExpressError(404, "Listing you are looking for does not exist!");
    }
};

//Reserve a listing
router.post("/listings/:id/bookings", wrapAsync(async (req, res) => {
    const { id } = req.params;
    assertValidId(id);

    // Not logged in: go to log in, then come back to this listing with the same dates
    if (!res.locals.currentUser) {
        const query = new URLSearchParams({
            checkIn: typeof req.body.checkIn === "string" ? req.body.checkIn : "",
            checkOut: typeof req.body.checkOut === "string" ? req.body.checkOut : "",
            guests: typeof req.body.guests === "string" ? req.body.guests : "",
        }).toString();
        return res.redirect(`/login?next=${encodeURIComponent(`/listings/${id}?${query}`)}`);
    }

    const listing = await Listing.findById(id);
    if (!listing) {
        throw new ExpressError(404, "Listing you are looking for does not exist!");
    }

    const { checkIn, checkOut } = req.body;
    const guests = parseInt(req.body.guests, 10);
    const maxGuests = listing.guests || 2;

    let error = null;
    if (!isDateKey(checkIn) || !isDateKey(checkOut)) {
        error = "Please choose your check-in and check-out dates.";
    } else if (checkIn < todayKey()) {
        error = "Check-in can't be in the past.";
    } else if (checkOut <= checkIn) {
        error = "Check-out must be after check-in.";
    } else if (nightsBetween(checkIn, checkOut) > MAX_NIGHTS) {
        error = `You can book up to ${MAX_NIGHTS} nights at a time.`;
    } else if (!(guests >= 1 && guests <= maxGuests)) {
        error = `This place fits up to ${maxGuests} guests.`;
    } else {
        // Any existing booking whose nights overlap the requested nights blocks it
        const clash = await Booking.findOne({
            listing: id,
            checkIn: { $lt: checkOut },
            checkOut: { $gt: checkIn },
        });
        if (clash) {
            error = "Those dates are no longer available. Please choose different dates.";
        }
    }

    if (error) {
        const data = await loadListingPage(id);
        return res.status(400).render("listings/show", {
            ...data,
            prefill: prefillFrom(req.body, maxGuests),
            amenityIcon: iconFor,
            bookingError: error,
        });
    }

    const nights = nightsBetween(checkIn, checkOut);
    const booking = new Booking({
        listing: id,
        user: res.locals.currentUser.id,
        checkIn,
        checkOut,
        guests,
        nights,
        total: (listing.price ?? 0) * nights,
    });
    await booking.save();

    res.redirect(`/bookings/${booking._id}`);
}));

//My trips
router.get("/bookings", requireLogin, wrapAsync(async (req, res) => {
    const bookings = await Booking.find({ user: res.locals.currentUser.id })
        .populate("listing")
        .sort({ checkIn: -1 });
    res.render("listings/bookings", { bookings });
}));

//Booking confirmation (only the guest who booked can see it)
router.get("/bookings/:id", requireLogin, wrapAsync(async (req, res) => {
    const { id } = req.params;
    assertValidId(id);

    const booking = await Booking.findById(id).populate("listing");
    if (!booking || String(booking.user) !== res.locals.currentUser.id) {
        throw new ExpressError(404, "Booking not found!");
    }

    res.render("listings/booking", { booking });
}));

module.exports = router;
