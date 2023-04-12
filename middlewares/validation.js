const { celebrate, Joi, errors } = require('celebrate');
const validator = require('validator');
const { ObjectId } = require('mongoose').Types;

// validate a url link
const validateUrl = (value, helpers) => {
    if (validator.isURL(value)) {
        return value;
    }
    return helpers.error('string.uri');
};

// validate email and password
const validateAuthentication = celebrate({
    body: Joi.object({
        email: Joi.string()
            .required()
            .email()
            .message('Valid email is required')
            .messages({
                'string.required': 'Email is required',
                'string.email': 'Valid email is required',
            }),
        password: Joi.string().required().messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
        }),
    }),
});

// validate name, about, and avatar image with validateURL, email, and password
const validateUserBody = celebrate({
    body: Joi.object({
        name: Joi.string().min(2).max(30).messages({ 'string.min': 'Name must be longer then 2 letters', 'string.max': 'Name must be shorter then 30 letters' }),
        about: Joi.string().min(2).max(30).messages({ 'string.min': 'about must be longer then 2 letters', 'string.max': 'about must be shorter then 30 letters' }),
        avatar: Joi.string().custom(validateUrl).message('Invalid URL for avatar link'),
        email: Joi.string().required().email().message('Valid email is required').messages({
            'string.required': 'Email is required',
            'string.email': 'Valid email is required',
        }),
        password: Joi.string().min(8).required().messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
        }),
    }),
});

// validate name and about
const validateProfile = celebrate({
    body: Joi.object({
        name: Joi.string().min(2).max(30).required(),
        about: Joi.string().min(2).max(30).required(),
    }),
});

// validate image link with validateURL
const validateAvatar = celebrate({
    body: Joi.object({
        avatar: Joi.string().custom(validateUrl).required(),
    }),
});

// check if id is valid


const validateObjectId = celebrate({
    params: Joi.object().keys({
        _id: Joi.string()
            .required()
            .custom((value, helpers) => {
                if (ObjectId.isValid(value)) {
                    return value;
                }
                return helpers.message('Invalid id');
            }),
    }),
});
const validateObjectIdCard = celebrate({
    params: Joi.object().keys({
        cardId: Joi.string()
            .required()
            .custom((value, helpers) => {
                if (ObjectId.isValid(value)) {
                    return value;
                }
                return helpers.message('Invalid id');
            }),
    }),
});
// validate name and link for card that have text and image via link
const validateCard = celebrate({
    body: Joi.object({
        name: Joi.string().min(2).max(30).required(),
        link: Joi.string().required().custom(validateUrl).messages({
            'string.empty': 'Link is required',
            'string.uri': 'Invalid URL for card link',
        }),
    }),
});


module.exports = {
    validateAuthentication,
    validateUserBody,
    validateProfile,
    validateAvatar,
    validateObjectId,
    validateCard,
    validateObjectIdCard,
};