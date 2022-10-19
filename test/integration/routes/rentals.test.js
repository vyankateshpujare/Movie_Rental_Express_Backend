const mongoose = require("mongoose");
const app = require("../../../index");
const supertest = require("supertest");
const { iteratee } = require("lodash");
const { Rental } = require("../../../model/rental");
const { Genre } = require("../../../model/genre");
const { Movie } = require("../../../model/movie");
const { Customer } = require("../../../model/customer");
const { User } = require("../../../model/user");
const req = supertest(app);

describe("/api/rentals", () => {
  afterEach(async () => {
    await Genre.collection.deleteMany({});
    await Movie.collection.deleteMany({});
    await Customer.collection.deleteMany({});
    await Rental.collection.deleteMany({});
  });
  describe("/GET", () => {
    it("should return all rentals", async () => {
      const genre = new Genre({
        name: "comedy",
      });
      await genre.save();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
        isGold: false,
      });
      await customer.save();

      const movie = new Movie({
        title: "Golmaal",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        dailyRentalRate: 5,
        numberInStock: 46,
        liked: false,
      });
      await movie.save();

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
      await rental.save();

      const res = await req.get("/api/rentals");
      expect(res.status).toBe(200);
    });

    it("should return 404 if rentals are not found", async () => {
      const res = await req.get("/api/rentals");
      expect(res.status).toBe(404);
    });
  });

  describe("/:id GET", () => {
    it("should return 400 if objectId is invalid", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/rentals/" + 5);
      expect(res.status).toBe(400);
    });

    it("should return 404 if rental with given id not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/rentals/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 if rental found", async () => {
      const genre = new Genre({
        name: "comedy",
      });
      await genre.save();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
        isGold: false,
      });
      await customer.save();

      const movie = new Movie({
        title: "Golmaal",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        dailyRentalRate: 5,
        numberInStock: 46,
        liked: false,
      });
      await movie.save();

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
      await rental.save();

      const res = await req.get("/api/rentals/" + rental._id);
      expect(res.status).toBe(200);
    });
  });
  describe("/POST", () => {
    it("should return 401 if no token provided", async () => {
      const res = await req.post("/api/rentals");
      expect(res.status).toBe(401);
    });

    it("should return 400 if customer id is provided", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const genre = new Genre({
        name: "comedy",
      });
      await genre.save();

      const movie = new Movie({
        title: "Golmaal",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        dailyRentalRate: 5,
        numberInStock: 46,
        liked: false,
      });
      await movie.save();

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ movieId: movie._id });

      expect(res.status).toBe(400);
    });

    it("should return 400 if movie id is not provided", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
        isGold: true,
      });
      await customer.save();

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId: customer._id });

      expect(res.status).toBe(400);
    });

    it("should return 404 if customer with given id not found", async () => {
      const token = new User().getAuthToken();
      const customer_id = new mongoose.Types.ObjectId(1);
      const movie_id = new mongoose.Types.ObjectId(2);

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId: customer_id, movieId: movie_id });

      expect(res.status).toBe(404);
    });

    it("should return 404 if movie with given id not found", async () => {
      const token = new User().getAuthToken();
      const movie_id = new mongoose.Types.ObjectId(2);

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
        isGold: true,
      });
      await customer.save();

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId: customer._id, movieId: movie_id });

      expect(res.status).toBe(404);
    });

    it("should return 400 if numberInStock is equal to zero", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({
        name: "comedy",
      });
      await genre.save();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
        isGold: false,
      });
      await customer.save();

      const movie = new Movie({
        title: "Golmaal",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        dailyRentalRate: 5,
        numberInStock: 0,
        liked: false,
      });
      await movie.save();

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId: customer._id, movieId: movie._id });

      expect(res.status).toBe(400);
    });

    it("should return 200 if data is valid", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({
        name: "comedy",
      });
      await genre.save();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
        isGold: false,
      });
      await customer.save();

      const movie = new Movie({
        title: "Golmaal",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        dailyRentalRate: 5,
        numberInStock: 33,
        liked: false,
      });
      await movie.save();

      const res = await req
        .post("/api/rentals/")
        .set("x-auth-token", token)
        .send({ customerId: customer._id, movieId: movie._id });

      expect(res.status).toBe(200);
    });
  });

  describe(":id PATCH", () => {
    it("should return 401 if no token provided", async () => {
      const res = await req.patch("/api/rentals/" + 5);
      expect(res.status).toBe(401);
    });

    it("should return 400 if objectId is invalid", async () => {
      const token = new User().getAuthToken();
      const id = new mongoose.Types.ObjectId();

      const res = await req
        .patch("/api/rentals/" + 6)
        .set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if rental with given id not found", async () => {
      const token = new User().getAuthToken();
      const id = new mongoose.Types.ObjectId();

      const res = await req
        .patch("/api/rentals/" + id)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should update the rental if data is valid", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({
        name: "comedy",
      });
      await genre.save();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
        isGold: false,
      });
      await customer.save();

      const movie = new Movie({
        title: "Golmaal",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        dailyRentalRate: 5,
        numberInStock: 33,
        liked: false,
      });
      await movie.save();

      let rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
          _id: customer._id,
        },
        movie: {
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate,
          numberInStock: movie.numberInStock,
          _id: movie._id,
        },
        rentalFee: 45,
      });
      await rental.save();

      const res = await req
        .patch("/api/rentals/" + rental._id)
        .set("x-auth-token", token)
        .send({ dateIn: new Date() });
      rental = await Rental.findOne({ "movie.title": "Golmaal" });
      expect(rental.dateIn).not.toBeNull();
    });

    it("should 200 if data is updated", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({
        name: "comedy",
      });
      await genre.save();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
        isGold: false,
      });
      await customer.save();

      const movie = new Movie({
        title: "Golmaal",
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        dailyRentalRate: 5,
        numberInStock: 33,
        liked: false,
      });
      await movie.save();

      let rental = new Rental({
        customer: {
          name: customer.name,
          phone: customer.phone,
          _id: customer._id,
        },
        movie: {
          title: movie.title,
          dailyRentalRate: movie.dailyRentalRate,
          numberInStock: movie.numberInStock,
          _id: movie._id,
        },
        rentalFee: 10 * movie.dailyRentalRate,
      });
      await rental.save();

      const res = await req
        .patch("/api/rentals/" + rental._id)
        .set("x-auth-token", token)
        .send({ dateIn: new Date() });

      movie.numberInStock = movie.numberInStock + 1;

      expect(rental.dateIn).not.toBeNull();
      rental = await Rental.findOne({ "movie.title": "Golmaal" });
      expect(movie.numberInStock).toBe(34);
      expect(rental.movie.numberInStock).toBe(34);
      expect(res.status).toBe(200);
    });
  });

  describe("/:id DELETE", () => {
    it("should return 401 if no token provided", async () => {
      const res = await req.delete("/api/rentals/" + 67);
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not Admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const res = await req
        .delete("/api/rentals/" + 45)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if objectID is not valid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId();

      const res = await req
        .delete("/api/rentals/" + 4)
        .set("x-auth-token", token);
      expect(res.status).toBe(400);
    });
  });
});
