const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const listings = require("./routes/listing.js");
const reviews = require("./routes/review.js");
const pages = require("./routes/pages.js");
const authRoutes = require("./routes/auth.js");
const bookingRoutes = require("./routes/bookings.js");
const Listing = require("./models/listing");
const User = require("./models/user.js");
const { COOKIE_NAME, parseCookies, readSessionValue } = require("./utils/auth.js");


const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

async function main() {
    await mongoose.connect(MONGO_URL);
    console.log("Connected to DB");

    const result = await Listing.updateMany(
        { $or: [{ image: { $exists: false } }, { "image.url": { $exists: false } }] },
        {
            $set: {
                image: {
                    filename: "listingimage",
                    url: "https://images.unsplash.com/photo-1755289445810-bfe6381d51c4?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
                }
            }
        }
    );

    console.log(`Auto-fixed ${result.modifiedCount} listings with missing images`);

    const guestResult = await Listing.updateMany(
        { guests: { $exists: false } },
        { $set: { guests: 2 } }
    );
    console.log(`Set default guest capacity on ${guestResult.modifiedCount} listings`);
}

main().catch(err => console.log(err));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "public")));

// Reads the session cookie on every page request and exposes the logged-in user to templates
app.use(async (req, res, next) => {
    res.locals.currentUser = null;
    try {
        const userId = readSessionValue(parseCookies(req.headers.cookie)[COOKIE_NAME]);
        if (userId) {
            const user = await User.findById(userId);
            if (user) {
                res.locals.currentUser = { id: String(user._id), name: user.name };
            }
        }
    } catch (err) {
        console.log("Session lookup failed:", err.message);
    }
    next();
});

app.use("/", authRoutes);
app.use("/", bookingRoutes);
app.use("/listings", listings);
app.use("/listings/:id/reviews", reviews);

// Home, Privacy Policy and Terms & Conditions pages
app.use("/", pages);


app.all(/.*/, (req, res, next) => {
    next(new ExpressError(404, "Page Not Found!"));
});

app.use((err, req, res, next) => {
    let { statusCode = 500, message = "Something went wrong!" } = err;
    res.status(statusCode).render("listings/error", { message });
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});