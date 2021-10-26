const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');
// Defining our own validation to put inside Joi

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '{{#label}} must not include HTML!'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    // nothing is allowed
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if(clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});
const Joi = BaseJoi.extend(extension);

// So we will be creating JOI schema
// We can use postman to check this.
// Next time wrap this in a big model.
module.exports.campgroundSchema = Joi.object({
    // below line means that title must be a string and is required.
    title: Joi.string().required().escapeHTML(),
    // Below line means that price must be a number and is required and also it must have a minimum value of 0.
    price: Joi.number().required().min(0),
    // image: Joi.string().required(),
    location: Joi.string().required().escapeHTML(),
    description: Joi.string().required().escapeHTML(),
    deleteImages: Joi.array()
})


module.exports.reviewSchema = Joi.object({
    body:Joi.string().required().escapeHTML(),
    rating: Joi.number().required().min(1).max(5)
})