const mongoose = require('mongoose');

const reg = /[(http(s)?)://(www.)?a-zA-Z0-9@:%.+~#=]{2,256}.[a-z]{2,6}([-a-zA-Z0-9@:%+.~#?&//=]*)/i;

const userSchema = new mongoose.Schema({
  name: { // every user has a name field, the requirements for which are described below:
    type: String, // the name is a string
    required: true, // every user has a name, so it's a required field
    minlength: 2, // the minimum length of the name is 2 characters
    maxlength: 30, // the maximum length is 30 characters
  },
  id: {
    type: String,
  },
  about: {
    type: String, // the pronouns are a string
    required: true, // every user has a name, so it's a required field
    minlength: 2, // the minimum length of the name is 2 characters
    maxlength: 30, // the maximum length is 30 characters
  },
  avatar: {
    type: String,
    required: true,
    validate: {
      validator: (v) => {
        reg.test(v);
      },
      message: (props) => `${props.value} is not a valid link!`,
    },
  },
});
const User = mongoose.model('user', userSchema);
module.exports = User;
