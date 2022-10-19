const express = require("express");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();
const { Customer } = require("../model/customer");
const { Movie } = require("../model/movie");
const { Rental, validateRental } = require("../model/rental");

router.use(express.json());

router.get("/", async (req, res) => {
  const rentals = await Rental.find();
  if (rentals && rentals.length == 0)
    return res.status(404).send("Rentals not found");
  res.status(200).send(rentals);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) return res.status(404).send("Rental with given id not found");
  res.status(200).send(rental);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateRental(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const customer = await Customer.findById(req.body.customerId);
  if (!customer)
    return res.status(404).send("customer with given id not found");

  const movie = await Movie.findById(req.body.movieId);
  if (!movie) return res.status(404).send("movie with given id not found");

  if (movie.numberInStock == 0) {
    return res.status(400).send("movie is not in stock");
  }

  const rental = new Rental({
    customer: {
      _id: customer._id,
      name: customer.name,
      phone: customer.phone,
    },
    movie: {
      _id: movie._id,
      title: movie.title,
      dailyRentalRate: movie.dailyRentalRate,
      numberInStock: movie.numberInStock - 1,
    },
    rentalFee: movie.dailyRentalRate * 10,
  });

  const session = await Rental.startSession();
  session.startTransaction();

  try {
    await rental.save();
    movie.numberInStock = movie.numberInStock - 1;
    await movie.save();
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
  res.status(200).send(rental);
});

router.patch("/:id", auth, validateObjectId, async (req, res) => {
  const rental = await Rental.findById(req.params.id);
  if (!rental) {
    return res.status(404).send("rental with given id not found");
  }
  const session = await Rental.startSession();
  session.startTransaction();

  try {
    rental.dateIn = new Date();

    rental.movie.numberInStock = rental.movie.numberInStock + 1;
    await rental.save();
    await Movie.findByIdAndUpdate(rental.movie._id, {
      $inc: {
        numberInStock: 1,
      },
    });
  } catch (err) {
    session.abortTransaction();
    throw err;
  }
  session.commitTransaction();
  session.endSession();
  res.status(200).send(rental);
});

router.delete("/:id", auth, admin, validateObjectId, async (req, res) => {
  const session = await Rental.startSession();
  session.startTransaction();
  try {
    const rental = await Rental.findByIdAndDelete(req.params.id);
    rental.movie.numberInStock = rental.movie.numberInStock + 1;
    rental.save();
    await Movie.findByIdAndUpdate(rental.movie._id, {
      $inc: {
        numberInStock: 1,
      },
    });
    res.status(200).send(rental);
  } catch (err) {
    res.status(404).send("Rental with given id not found");
  }
});
module.exports = router;
