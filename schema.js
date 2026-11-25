const Joi = require("joi");

module.exports.listingSchema = Joi.object({
    listing: Joi.object({
        title: Joi.string().trim().required(),
        description: Joi.string().trim().required(),
        location: Joi.string().trim().required(),
        country: Joi.string().trim().required(),
        price: Joi.number().min(0).required(),
        guests: Joi.number().integer().min(1).max(20).optional(),
        bedrooms: Joi.number().integer().min(1).max(50).optional(),
        beds: Joi.number().integer().min(1).max(50).optional(),
        bathrooms: Joi.number().integer().min(1).max(50).optional(),
        amenities: Joi.string().allow("", null).max(2000).optional(),
        image: Joi.object({
            url: Joi.string().allow("", null)
        }).optional()
    }).required()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().min(1).max(5).required(),
        comment: Joi.string().trim().required(),
    }).required()
});

module.exports.signupSchema = Joi.object({
    name: Joi.string().trim().min(2).max(50).required().label("Name"),
    email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required().label("Email"),
    password: Joi.string().min(8).max(128).required().label("Password"),
    next: Joi.string().allow("").optional(),
    confirmPassword: Joi.any()
        .valid(Joi.ref("password"))
        .required()
        .messages({ "any.only": "Passwords do not match.", "any.required": "Please confirm your password." }),
});

module.exports.loginSchema = Joi.object({
    email: Joi.string().trim().lowercase().email({ tlds: { allow: false } }).required().label("Email"),
    password: Joi.string().required().label("Password"),
    next: Joi.string().allow("").optional(),
});
