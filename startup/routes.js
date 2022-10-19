const express = require("express");
const genres = require("../routes/genresRoutes");
const customers = require("../routes/customerRoutes");
const movies = require("../routes/moviesRoutes");
const rentals = require("../routes/rentalRoutes");
const users = require("../routes/userRoutes");
const login = require("../routes/login");
const error = require("../middleware/error");

module.exports = function (app) {
  app.use(express.json());
  app.use("/api/genres", genres);
  app.use("/api/customers", customers);
  app.use("/api/movies", movies);
  app.use("/api/rentals", rentals);
  app.use("/api/users", users);
  app.use("/api/login", login);
  app.use(error);
};
