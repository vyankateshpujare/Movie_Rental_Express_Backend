const mongoose = require("mongoose");
const app = require("../../../index");
const supertest = require("supertest");
const { iteratee } = require("lodash");
const { Genre } = require("../../../model/genre");
const { Movie } = require("../../../model/movie");
const { User } = require("../../../model/user");
const req = supertest(app);

describe("/api/movies", () => {
  afterEach(async () => {
    await Genre.deleteMany({});
    await Movie.deleteMany({});
  });
  describe("/GET", () => {
    it("should return all movies from database", async () => {
      const genre = new Genre({
        name: "Action",
      });
      await genre.save();
      await Movie.insertMany([
        {
          title: "suryavanshi",
          dailyRentalRate: 5,
          numberInStock: 10,
          genre: { name: genre.name, _id: genre._id },
        },
        {
          title: "singham",
          dailyRentalRate: 6,
          numberInStock: 15,
          genre: { name: genre.name, _id: genre._id },
        },
      ]);
      const res = await req.get("/api/movies");
      expect(res.status).toBe(200);
      expect(res.body.some((s) => s.title === "suryavanshi")).toBeTruthy();
      expect(res.body.some((s) => s.title === "singham")).toBeTruthy();
    });

    it("should return 404 if movies not found", async () => {
      const res = await req.get("/api/movies");
      expect(res.status).toBe(404);
    });
  });
  describe("/:id GET", () => {
    it("should return 400 if ID is invalid", async () => {
      const res = await req.get("/api/movies/" + 3);
      expect(res.status).toBe(400);
    });

    it("should return 404 if movie with given Id not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/movies/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 if movie with given Id found", async () => {
      const genre = new Genre({
        name: "Drama",
      });
      await genre.save();

      const movie = new Movie({
        title: "De Dhakka2",
        dailyRentalRate: 5,
        numberInStock: 13,
        genre: { name: genre.name, _id: genre._id },
      });
      await movie.save();
      const res = await req.get("/api/movies/" + movie._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", "De Dhakka2");
      expect(res.body).toHaveProperty("dailyRentalRate", 5);
    });
  });
  describe("/POST", () => {
    it("should return 401 if token is not provided", async () => {
      const res = await req.post("/api/movies"); //.send({title:"Dhoom"});
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is not a valid", async () => {
      const token = "abcdefghijklmnopqrstuvwxyz";
      const res = await req.post("/api/movies").set("x-auth-token", token); //.send({title:"Dhoom"});
      expect(res.status).toBe(400);
    });

    it("should return 400 if title is less than 5 character ", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({
          title: "ad",
          dailyRentalRate: 6,
          numberInStock: 34,
          genreId: genre._id,
          liked: true,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if title is greater than 50 character", async () => {
      const token = new User().getAuthToken();
      const title = await new Array(55).join("a");

      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();

      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({
          title,
          dailyRentalRate: 1,
          numberInStock: 5,
          genreId: genre._id,
          liked: false,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is less than 1", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();

      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({
          title: "Hera Pheri",
          dailyRentalRate: -67,
          numberInStock: 5,
          genreId: genre._id,
          liked: false,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is greater than 10", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();

      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({
          title: "Hera Pheri",
          dailyRentalRate: 12,
          numberInStock: 5,
          genreId: genre._id,
          liked: false,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if NumberInStock is less than 1", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();

      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({
          title: "Hera Pheri",
          dailyRentalRate: 5,
          numberInStock: 0,
          genreId: genre._id,
          liked: false,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if NumberInStock is greater than 50", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();

      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({
          title: "Hera Pheri",
          dailyRentalRate: 5,
          numberInStock: 78,
          genreId: genre._id,
          liked: false,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if genreId is not a valid", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();

      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({
          title: "Hera Pheri",
          dailyRentalRate: 5,
          numberInStock: 25,
          genreId: 1, //return 200 if pass valid id ie. genre._id
          liked: false,
        });
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre with given Id not found", async () => {
      const token = new User().getAuthToken();
      const id = new mongoose.Types.ObjectId();

      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();

      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({
          title: "Hera Pheri",
          dailyRentalRate: 5,
          numberInStock: 25,
          genreId: id,
          liked: false,
        });
      expect(res.status).toBe(404);
    });

    it("should return 200 if movie is saved ", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({
        name: "Comedy",
      });
      await genre.save();

      const res = await req
        .post("/api/movies")
        .set("x-auth-token", token)
        .send({
          title: "Golmaal",
          dailyRentalRate: 7,
          numberInStock: 35,
          genreId: genre._id,
          liked: true,
        });
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", "Golmaal");
    });
  });
  describe("/:id PUT", () => {
    it("should return 401 if token is not is not provided", async () => {
      const res = await req.put("/api/movies/" + 2);
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is not a valid", async () => {
      const token = "abcdefghijklmnopqrstuvwxyz";
      const res = await req.put("/api/movies/" + 34).set("x-auth-token", token); //.send({title:"Dhoom"});
      expect(res.status).toBe(400);
    });

    it("should return 400 if objectID is not valid", async () => {
      const token = new User().getAuthToken();
      //const id = new mongoose.Types.ObjectId();
      const id = 4154;
      const res = await req.put("/api/movies/" + id).set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 400 if title is less than 5 character ", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "abc",
          dailyRentalRate: 7,
          numberInStock: 34,
          genreId: genre._id,
          liked: true,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if title is greater than 50 character ", async () => {
      const token = new User().getAuthToken();
      const title = new Array(60).join("v");

      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title,
          dailyRentalRate: 7,
          numberInStock: 34,
          genreId: genre._id,
          liked: true,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is less than 1 ", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "Bahubali",
          dailyRentalRate: -6,
          numberInStock: 34,
          genreId: genre._id,
          liked: true,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if dailyRentalRate is greater than 10 ", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "Bahubali",
          dailyRentalRate: 26,
          numberInStock: 34,
          genreId: genre._id,
          liked: true,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is less than 1 ", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "Bahubali",
          dailyRentalRate: 6,
          numberInStock: -34,
          genreId: genre._id,
          liked: true,
        });
      expect(res.status).toBe(400);
    });

    it("should return 400 if numberInStock is greater than 50 ", async () => {
      const token = new User().getAuthToken();
      const id = new mongoose.Types.ObjectId();
      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "Bahubali",
          dailyRentalRate: 6,
          numberInStock: 75,
          genreId: genre._id,
          liked: true,
        });
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre with given Id not found", async () => {
      const token = new User().getAuthToken();
      const movie_id = new mongoose.Types.ObjectId();
      const genre_id = new mongoose.Types.ObjectId();

      const res = await req
        .put("/api/movies/" + movie_id)
        .set("x-auth-token", token)
        .send({
          title: "Pushpa",
          dailyRentalRate: 3,
          numberInStock: 45,
          genreId: genre_id,
          liked: false,
        });

      expect(res.status).toBe(404);
    });

    it("should return 404 if movie with given Id not found", async () => {
      const token = new User().getAuthToken();
      const movie_id = new mongoose.Types.ObjectId();

      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .put("/api/movies/" + movie_id)
        .set("x-auth-token", token)
        .send({
          title: "Ganapat",
          dailyRentalRate: 5,
          numberInStock: 33,
          genreId: genre._id,
          liked: false,
        });
      expect(res.status).toBe(404);
    });

    it("should update the movie if everything is valid", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      let movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "Ganapat",
          dailyRentalRate: 5,
          numberInStock: 33,
          genreId: genre._id,
          liked: false,
        });

      movie = await Movie.collection.findOne({ title: "Ganapat" });
      expect(movie).not.toBeNull();
      expect(movie).toHaveProperty("title", "Ganapat");
    });

    it("should return 200 if movie is updated", async () => {
      const token = new User().getAuthToken();

      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .put("/api/movies/" + movie._id)
        .set("x-auth-token", token)
        .send({
          title: "Ganapat",
          dailyRentalRate: 5,
          numberInStock: 33,
          genreId: genre._id,
          liked: false,
        });

      expect(res.status).toBe(200);
      expect(res.body).not.toBeNull();
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("title", "Ganapat");
    });
  });
  describe("/:id DELETE", () => {
    it("should return 401 if token is not provided", async () => {
      const res = await req.delete("/api/movies/" + 45); //.send({title:"Dhoom"});
      expect(res.status).toBe(401);
    });

    it("should return 400 if token is not a valid", async () => {
      //const token=new User().getAuthToken();
      const token = "abcdefghijklmnopqrstuvwxyz";
      const res = await req
        .delete("/api/movies/" + 69)
        .set("x-auth-token", token); //.send({title:"Dhoom"});
      expect(res.status).toBe(400);
    });

    it("should return 403 if user is not Admin", async () => {
      const token = new User({ isAdmin: false }).getAuthToken();
      const res = await req
        .delete("/api/movies/" + 45)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if objectID is not valid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      //const id= new mongoose.Types.ObjectId();

      const res = await req
        .delete("/api/movies/" + 1)
        .set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if movie with given ID not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId(23);
      
      const res = await req
        .delete("/api/movies/" + id)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 200 if movie is deleted", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const genre = new Genre({
        name: "Action",
      });
      await genre.save();

      const movie = new Movie({
        title: "Pushpa",
        dailyRentalRate: 4,
        numberInStock: 34,
        genre: { _id: genre._id, name: genre.name },
        liked: false,
      });
      await movie.save();

      const res = await req
        .delete("/api/movies/" + movie._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
    });
  });
});
