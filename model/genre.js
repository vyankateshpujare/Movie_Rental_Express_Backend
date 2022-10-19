const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Joi = require("joi");


const genreSchema = new Schema({
  name: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 50,
  },
});

const Genre = mongoose.model("genre", genreSchema);

function validateGenre(genre) {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required(),
  });
  return schema.validate(genre);
}

module.exports.Genre = Genre;
module.exports.validateGenre = validateGenre;
module.exports.genreSchema = genreSchema;
