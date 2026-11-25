const express = require("express");
const router = express.Router();
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync.js");
const {
  COOKIE_NAME,
  COOKIE_OPTIONS,
  hashPassword,
  verifyPassword,
  createSessionValue,
  safeNext,
} = require("../utils/auth.js");
const { signupSchema, loginSchema } = require("../schema.js");

const startSession = (res, user) => {
  res.cookie(COOKIE_NAME, createSessionValue(user._id.toString()), COOKIE_OPTIONS);
};

const messagesFrom = (error) => error.details.map((d) => d.message);

//Sign Up Page
router.get("/signup", (req, res) => {
  if (res.locals.currentUser) return res.redirect("/");
  res.render("listings/auth", { mode: "signup", errors: [], values: {}, next: safeNext(req.query.next) });
});

//Sign Up Submit
router.post("/signup", wrapAsync(async (req, res) => {
  const next = safeNext(req.body.next);
  const { error, value } = signupSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).render("listings/auth", {
      mode: "signup",
      errors: messagesFrom(error),
      values: { name: req.body.name, email: req.body.email },
      next,
    });
  }

  const { name, email, password } = value;
  const duplicateMessage = "An account with this email already exists. Try logging in instead.";

  const existing = await User.findOne({ email });
  if (existing) {
    return res.status(409).render("listings/auth", {
      mode: "signup",
      errors: [duplicateMessage],
      values: { name, email },
      next,
    });
  }

  const user = new User({ name, email, passwordHash: await hashPassword(password) });
  try {
    await user.save();
  } catch (err) {
    // Handles a race where two sign-ups use the same email at once
    if (err.code === 11000) {
      return res.status(409).render("listings/auth", {
        mode: "signup",
        errors: [duplicateMessage],
        values: { name, email },
        next,
      });
    }
    throw err;
  }

  startSession(res, user);
  res.redirect(next);
}));

//Log In Page
router.get("/login", (req, res) => {
  if (res.locals.currentUser) return res.redirect("/");
  res.render("listings/auth", { mode: "login", errors: [], values: {}, next: safeNext(req.query.next) });
});

//Log In Submit
router.post("/login", wrapAsync(async (req, res) => {
  const next = safeNext(req.body.next);
  const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).render("listings/auth", {
      mode: "login",
      errors: messagesFrom(error),
      values: { email: req.body.email },
      next,
    });
  }

  const { email, password } = value;
  const user = await User.findOne({ email });
  const valid = user && (await verifyPassword(password, user.passwordHash));

  if (!valid) {
    // Same message for unknown email and wrong password, so accounts can't be probed
    return res.status(401).render("listings/auth", {
      mode: "login",
      errors: ["Incorrect email or password."],
      values: { email },
      next,
    });
  }

  startSession(res, user);
  res.redirect(next);
}));

//Log Out
router.post("/logout", (req, res) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.redirect("/");
});

module.exports = router;
