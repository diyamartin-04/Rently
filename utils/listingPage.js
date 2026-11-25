const Listing = require("../models/listing.js");
const Booking = require("../models/booking.js");
const ExpressError = require("./ExpressError.js");
const { isDateKey, todayKey } = require("./dates.js");

// A listing is a "guest favourite" when it has at least 3 reviews averaging 4.5 or higher.
const MIN_REVIEWS_FOR_FAVOURITE = 3;
const MIN_AVERAGE_FOR_FAVOURITE = 4.5;

const ratingStats = (reviews = []) => {
    const count = reviews.length;
    const average = count ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / count : null;
    return {
        count,
        average,
        guestFavourite: count >= MIN_REVIEWS_FOR_FAVOURITE && average >= MIN_AVERAGE_FOR_FAVOURITE,
    };
};

// Loads everything the listing detail page needs.
const loadListingPage = async (id) => {
    const listing = await Listing.findById(id)
        .populate({ path: "reviews", populate: { path: "author" } })
        .populate("owner");

    if (!listing) {
        throw new ExpressError(404, "Listing you are looking for does not exist!");
    }

    // Only bookings that still block nights matter for the calendar
    const today = todayKey();
    const bookings = await Booking.find({ listing: id });
    const booked = bookings
        .filter((b) => b.checkOut > today)
        .map((b) => ({ checkIn: b.checkIn, checkOut: b.checkOut }));

    return {
        listing,
        booked,
        stats: ratingStats(listing.reviews || []),
        host: listing.owner?.name || "Wanderlust host",
    };
};

// Keeps only valid date and guest values from a query string or form body.
const prefillFrom = (source = {}, maxGuests = 20) => {
    const checkIn = isDateKey(source.checkIn) ? source.checkIn : "";
    const checkOut = isDateKey(source.checkOut) ? source.checkOut : "";
    const guests = parseInt(source.guests, 10);
    return {
        checkIn,
        checkOut,
        guests: guests >= 1 && guests <= maxGuests ? guests : 1,
    };
};

module.exports = { ratingStats, loadListingPage, prefillFrom };
