const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const reg = /[(http(s)?)://(www.)?a-zA-Z0-9@:%.+~#=]{2,256}.[a-z]{2,6}([-a-zA-Z0-9@:%+.~#?&//=]*)/i;

const userSchema = new mongoose.Schema({
    name: { // every user has a name field, the requirements for which are described below:
        type: String, // the name is a string
        minlength: 2, // the minimum length of the name is 2 characters
        maxlength: 30, // the maximum length is 30 characters
        required: false,
        default: 'Jacques Cousteau',
    },
    id: {
        type: String,
    },
    about: {
        type: String, // the pronouns are a string
        minlength: 2, // the minimum length of the name is 2 characters
        maxlength: 30, // the maximum length is 30 characters
        default: 'Explorerr',
        required: false,
    },
    avatar: {
        type: String,
        default: 'https://i.pinimg.com/564x/71/f3/51/71f3519243d136361d81df71724c60a0.jpg',
        validate: {
            validator: (v) => {
                reg.test(v);
            },
            message: (props) => `${props.value} is not a valid link!`,
        },
        required: false,
    },
    email: {
        type: String,
        unique: true,
        required: true,
        validate: {
            validator: (v) => validator.isEmail(v),
            message: 'Valid email is required',
        },
    },
    password: {
        type: String,
        required: true,
        select: false,
    },
});
userSchema.statics.findUserByCredentials = function(email, password) {
    return this.findOne({ email }).select("+password")
        .then((user) => {
            if (!user) {
                return Promise.reject(new Error('Incorrect email or password user'));
            }

            return bcrypt.compare(password, user.password)
                .then((matched) => {
                    if (!matched) {
                        return Promise.reject(new Error('Incorrect email or password password'));
                    }
                    return user; // now user is available
                });
        });
};

const User = mongoose.model('user', userSchema);
module.exports = User;