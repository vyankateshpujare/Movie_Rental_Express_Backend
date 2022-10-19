const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");

const custSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: [3, "name should be at least 3 character long"],
    maxLength: [50, "name should be at most 50 character long"],
  },
  phone: {
    type: String,
    required: true,
    minLength: [7, "phone number should not be less than 10 digit"],
    maxLength: [10, "phone number should not be more than 10 digit"],
  },
  isGold: {
    type: Boolean,
    default: false,
  },
});

const Customer = mongoose.model("customer", custSchema);

function validateCustomer(customer) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
    phone: Joi.string().min(7).max(10).required(),
    isGold: Joi.boolean(),
  });
  return schema.validate(customer);
}

module.exports.Customer = Customer;
module.exports.validateCustomer = validateCustomer;
