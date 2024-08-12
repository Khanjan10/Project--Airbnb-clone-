if(process.env.NODE_ENV != 'production') {
    require('dotenv').config();
}
// console.log(process.env.secret);

const express = require("express");
const app = express();
const mongoose = require("mongoose");
//const Listing = require("./models/listing.js");
const path = require("path");
const methodOverride= require("method-override");
const ejsMate = require("ejs-mate");
//const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
//const {listingSchema, reviewSchema} = require("./schema.js");
//const Review = require("./models/review.js");
const cookieParser = require("cookie-parser");
const session = require("express-session");
const MongoStore = require('connect-mongo');

const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingsRouter = require("./routes/listing.js");
const reviewsRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connection successful");
}) .catch((err) => {
    console.log(err);
});

async function main() {
    await mongoose.connect(dbUrl);
}



app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine('ejs', ejsMate);
app.use(express.static(path.join(__dirname, "/public")));

app.use(cookieParser("secretcode"));

const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: process.env.SECRET,
    },
    touchAfter: "24 * 3600",
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true
    },
};

app.get("/", (req, res) => {
    res.redirect("/listings");
});



app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    next();
});

app.get("/demouser", async (req, res) => {
    let fakeUser = new User ({
        email: "student@gmail.com",
        username: "delta"
    });

    let registeredUser = await User.register(fakeUser, "hello");
    res.send(registeredUser);
})

app.use("/listings", listingsRouter);
app.use("/listings/:id/reviews/", reviewsRouter);
app.use("/", userRouter);

// app.get("/getcookies", (req, res) => {
//     res.cookie("greet", "hello", {signed: true});
//     res.send("Sent some cookies");
// });

app.get("/verify", (req, res) => {
    console.log(req.signedCookies);
    res.send("verified");
});

app.get("/greet", (req, res) => {
    let {greet} = req.cookies;
    res.send(`${greet}`);
})





// app.get("/testListing", async (req, res) => {
//     let sampleListing = new Listing ({
//         title: "New Villa",
//         description: "Natural  view",
//         price: 1200,
//         location: "Goa",
//         country: "India",
//     });

//     await sampleListing.save();
//     console.log("Sample was saved");
//     res.send("Successful");
// });

app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page Not Found"));
});

app.use((err, req, res, next) => {
    let {status=500, message="Something went wrong"} = err;
    res.status(status).render("error.ejs", {err});
    //res.status(status).send(message);
});

app.listen(8080, () => {
    console.log("listening on server");
});