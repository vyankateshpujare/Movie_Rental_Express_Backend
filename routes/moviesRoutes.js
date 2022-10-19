const express = require("express");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();
const { Genre } = require("../model/genre");
const { Movie, validateMovie } = require("../model/movie");

router.use(express.json());

router.get("/", async (req, res) => {
  const movies = await Movie.find();
  if (movies && movies.length === 0)
    return res.status(404).send("movies not found");
  res.status(200).send(movies);
});

router.post("/count", async (req, res) => {
  const { title, genreName } = req.body;
  let query = {};
  if (title) {
    let regex = new RegExp(`^${title}`, "i");
    query = { title: regex };
  }
  if (genreName) {
    query["genre.name"] = genreName;
  }
  const totlaNoOfMovies = await Movie.find(query).count();
  return res.status(200).send(totlaNoOfMovies + "");
});

router.get("/:id", validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  if (!movie) return res.status(404).send("movie with given id not found");
  res.status(200).send(movie);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateMovie(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genreId);

  if (!genre) return res.status(404).send("genre with given id not found");

  const movie = new Movie({
    title: req.body.title,
    dailyRentalRate: req.body.dailyRentalRate,
    numberInStock: req.body.numberInStock,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    // liked: req.body.liked,
  });

  await movie.save();
  res.status(200).send(movie);
});

router.post("/pfs", async (req, res) => {
  const { pageSize, currentPage, title, genreName, sortColumn } = req.body;
  const skip = (currentPage - 1) * pageSize;
  const limit = pageSize;
  let query = {};
  let sortQuery = {};
  if (title) {
    let regex = new RegExp(`^${title}`, "i");
    query = { title: regex };
  }
  if (genreName) {
    query["genre.name"] = genreName;
  }
  const {path,order}=sortColumn;
  const movies = await Movie.find(query).limit(limit).skip(skip).sort({[path]:order});
  res.send(movies);
});

router.put("/:id", auth, validateObjectId, async (req, res) => {
  const { error } = validateMovie(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(404).send("genre with given id not found");

  const movie = await Movie.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        title: req.body.title,
        dailyRentalRate: req.body.dailyRentalRate,
        numberInStock: req.body.numberInStock,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        // liked: req.body.liked,
      },
    },
    { new: true, runValidators: true }
  );

  if (!movie) return res.status(404).send("movie with given id not found");

  res.status(200).send(movie);
});

router.patch("/:id", auth, validateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);
  console.log(movie);
  if (!movie) return res.status(404).send("movie with given id is not found");

  movie.liked = movie.liked ? false : true;
  await movie.save();
  console.log(movie);

  res.status(200).send(movie);
});

router.delete("/:id", auth, admin, validateObjectId, async (req, res) => {
  const movie = await Movie.findByIdAndDelete(req.params.id);
  if (!movie) return res.status(404).send("movie with given id is not found");
  res.status(200).send(movie);
});

module.exports = router;
