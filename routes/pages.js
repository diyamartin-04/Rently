const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");
const wrapAsync = require("../utils/wrapAsync.js");

const DEFAULT_IMAGE =
    "https://images.unsplash.com/photo-1755289445810-bfe6381d51c4?q=80&w=1974&auto=format&fit=crop";

const FEATURED_COUNT = 6;
const GUEST_FAVOURITE_COUNT = 10;
const DESTINATION_COUNT = 4;
const COUNTRY_COUNT = 10;

// A listing is a "guest favourite" when it has at least 3 reviews averaging 4.5 or higher.
const MIN_REVIEWS_FOR_FAVOURITE = 3;
const MIN_AVERAGE_FOR_FAVOURITE = 4.5;

// Turns a listing (with populated reviews) into the plain object the templates use.
const toCard = (listing) => {
    const reviews = listing.reviews || [];
    const reviewCount = reviews.length;
    const average = reviewCount
        ? reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount
        : null;

    return {
        _id: String(listing._id),
        title: listing.title,
        price: listing.price ?? 0,
        guests: listing.guests ?? 2,
        location: listing.location || "",
        country: listing.country || "",
        image: { url: listing.image?.url || DEFAULT_IMAGE },
        reviewCount,
        average,
        guestFavourite: reviewCount >= MIN_REVIEWS_FOR_FAVOURITE && average >= MIN_AVERAGE_FOR_FAVOURITE,
    };
};

//Home Route
router.get("/", wrapAsync(async (req, res) => {
    const allListings = await Listing.find({}).populate("reviews");
    const cards = allListings.map(toCard);

    // Featured: newest listings first
    const featured = [...cards].reverse().slice(0, FEATURED_COUNT);

    // Guest favourites: highest rated first, then most reviewed
    const guestFavourites = cards
        .filter((c) => c.guestFavourite)
        .sort((a, b) => b.average - a.average || b.reviewCount - a.reviewCount)
        .slice(0, GUEST_FAVOURITE_COUNT);

    // Popular destinations: group listings by location
    const byLocation = new Map();
    // Browse by country: group listings by country
    const byCountry = new Map();

    for (const card of cards) {
        if (card.location) {
            const entry = byLocation.get(card.location) || {
                location: card.location,
                country: card.country,
                image: card.image.url,
                count: 0,
            };
            entry.count += 1;
            byLocation.set(card.location, entry);
        }

        if (card.country) {
            byCountry.set(card.country, (byCountry.get(card.country) || 0) + 1);
        }
    }

    const destinations = [...byLocation.values()]
        .sort((a, b) => b.count - a.count)
        .slice(0, DESTINATION_COUNT);

    const countries = [...byCountry.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name))
        .slice(0, COUNTRY_COUNT);

    res.render("listings/home", { listings: featured, guestFavourites, destinations, countries });
}));

//Privacy Policy Route
router.get("/privacy", (req, res) => {
    res.render("listings/privacy");
});

//Terms & Conditions Route
router.get("/terms", (req, res) => {
    res.render("listings/terms");
});

module.exports = router;
