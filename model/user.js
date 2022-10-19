const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");
const jwt = require("jsonwebtoken");
const config = require("config");

const userSchema = new Schema({
  name: {
    type: String,
    minLength: 5,
    maxLength: 50,
    required: true,
  },
  email: {
    type: String,
    minLength: 5,
    maxLength: 50,
    required: true,
  },
  password: {
    type: String,
    minLength: 5,
    maxLength: 1024,
    required: true,
  },
  isAdmin: {
    type: Boolean,
    default: false,
  },
});

userSchema.methods.getAuthToken = function () {
  return jwt.sign(
    { _id: this._id, isAdmin: this.isAdmin },
    config.get("jwtPrivateKey")
  );
};
const User = mongoose.model("user", userSchema);
function validateUser(user) {
  const schema = Joi.object({
    name: Joi.string().min(5).max(50).required(),
    email: Joi.string().required().email(),
    password: Joi.string().min(5).max(1024).required(),
    isAdmin: Joi.boolean(),
  });
  return schema.validate(user);
}

module.exports.User = User;
module.exports.userSchema = userSchema;
module.exports.validateUser = validateUser;
