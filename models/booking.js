const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    listing: {
      type: Schema.Types.ObjectId,
      ref: "Listing",
      required: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // "YYYY-MM-DD". The guest stays the nights from checkIn up to (not including) checkOut.
    checkIn: { type: String, required: true },
    checkOut: { type: String, required: true },
    guests: { type: Number, required: true, min: 1 },
    nights: { type: Number, required: true, min: 1 },
    total: { type: Number, required: true, min: 0 },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
