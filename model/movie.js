
const {genreSchema}=require("../model/genre")
const Joi = require("joi");

const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movieSchema = new Schema({
    title:{
        type:String,
        required:true,
        minLength:5,
        maxLength:50,
    },
    genre:{
        type:genreSchema,
        required:true,
    },
    dailyRentalRate:{
        type:Number,
        required:true,
        min:0,
        max:50,
    },
    numberInStock:{
        type:Number,
        required:true,
        min:0,
        max:50,
    },
    liked:{
        type:Boolean,
        default:false,
    }
});

const Movie = mongoose.model("movie", movieSchema);

function validateMovie(movie)
{
    const schema = Joi.object({
        title: Joi.string().min(5).max(50).required(),
        genreId:Joi.string().required(),
        dailyRentalRate:Joi.number().min(0).max(50).required(),
        numberInStock:Joi.number().min(0).max(50).required(),
        liked:Joi.boolean().default(false),
      });
      return schema.validate(movie);    
}

module.exports.Movie=Movie;
module.exports.validateMovie=validateMovie;
module.exports.movieSchema=movieSchema;
