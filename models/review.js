const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const reviewSchema = new Schema({
    comment: String,
    rating: {
        type:Number,
        min:1,
        max:5
    },
    // The logged-in user who wrote the review (optional for older reviews)
    author: {
        type: Schema.Types.ObjectId,
        ref: "User",
    },
    createdAt: {
        type: Date,
        default: Date.now()

    }
});

module.exports = mongoose.model("Review", reviewSchema);
