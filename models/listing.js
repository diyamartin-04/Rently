const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const listingSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: String,
  image: {
    filename: { type: String, default: "listingimage" },
    url: {
      type: String,
      default: "https://images.unsplash.com/photo-1755289445810-bfe6381d51c4?q=80&w=1974&auto=format&fit=crop",
      set: (v) => v === ""
        ? "https://images.unsplash.com/photo-1755289445810-bfe6381d51c4?q=80&w=1974&auto=format&fit=crop"
        : v
    },
  },
  price: Number,
  guests: { type: Number, default: 2, min: 1, max: 20 },
  bedrooms: { type: Number, default: 1, min: 1 },
  beds: { type: Number, default: 1, min: 1 },
  bathrooms: { type: Number, default: 1, min: 1 },
  amenities: { type: [String], default: [] },
  location: String,
  country: String,

  // The logged-in user who created the listing (optional for older listings)
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review"
    }
  ],
});

// Removes the listing's reviews and bookings when the listing is deleted
listingSchema.post("findOneAndDelete", async (listing) => {
  if (listing) {
    const Review = require("./review.js");
    const Booking = require("./booking.js");
    await Review.deleteMany({ _id: { $in: listing.reviews } });
    await Booking.deleteMany({ listing: listing._id });
  }
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
