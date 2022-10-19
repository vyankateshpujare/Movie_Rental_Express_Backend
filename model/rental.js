const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");
const { movieSchema } = require("./movie");

const rentalSchema = new Schema({
  customer: {
    type: new Schema({
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
    }),
    required: true,
  },
  movie: {
    type: new Schema({
      title: {
        type: String,
        required: true,
        minLength: 5,
        maxLength: 50,
      },
      dailyRentalRate: {
        type: Number,
        required: true,
        min: 0,
        max: 50,
      },
      numberInStock: {
        type: Number,
        required: true,
        min: 0,
        max: 50,
      },
    }),
    required: true,
  },
  rentalFee: {
    type: Number,
    required: true,
    min: 0,
  },
  dateOut: {
    type: Date,
    default: Date.now(),
  },
  dateIn: {
    type: Date,
    default: null,
  },
});
const Rental = mongoose.model("rental", rentalSchema);

function validateRental(rental) {
  const schema = new Joi.object({
    customerId: Joi.string().required(),
    movieId: Joi.string().required(),
  });
  return schema.validate(rental);
}

module.exports.Rental = Rental;
module.exports.validateRental = validateRental;
module.exports.rentalSchema = rentalSchema;
