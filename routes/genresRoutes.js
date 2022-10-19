const express = require("express");
const router = express.Router();
const { Genre, validateGenre } = require("../model/genre");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const validateObjectId = require("../middleware/validateObjectId");
require("express-async-errors");
require("../middleware/error");

router.use(express.json());

router.get("/", async (req, res, next) => {
  // try {
  const genres = await Genre.find();
  if (genres && genres.length === 0) {
    return res.status(404).send("genres not found");
  }
  res.status(200).send(genres);
  // } catch (err) {
  //   next(err);
  // }
});

router.get("/count", async (req, res) => {
  const totalNoOFGenres = await Genre.find().count();
  return res.status(200).send(totalNoOFGenres + "");
});

router.get("/:id", validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) {
    return res.status(404).send("Genre with given id is not present in DB");
  }
  res.status(200).send(genre);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const genre = new Genre({
    name: req.body.name,
  });

  await genre.save();
  res.status(200).send(genre);
});

router.post("/pfs", async (req, res) => {
  const { currentPage, pageSize, gname } = req.body;
  const skip = (currentPage - 1) * pageSize;
  const limit = pageSize;

  const genres = await Genre.find().limit(limit).skip(skip);
  res.send(genres);
});

router.put("/:id", auth, validateObjectId, async (req, res) => {
  const { error } = validateGenre(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const genre = await Genre.findByIdAndUpdate(
    req.params.id,
    { $set: { name: req.body.name } },
    { new: true, runValidators: true }
  );
  if (!genre) {
    return res.status(404).send("Genre with given id is not present in DB");
  }
  res.status(200).send(genre);
});

router.delete("/:id", auth, admin, validateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);
  if (!genre) {
    return res.status(404).send("Genre with given id is not present in DB");
  }

  await Genre.deleteOne({ _id: req.params.id });
  res.status(200).send(genre);
});

module.exports = router;
