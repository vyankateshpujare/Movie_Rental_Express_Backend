const mongoose = require("mongoose");
const app = require("../../../index");
const supertest = require("supertest");
const { iteratee } = require("lodash");
const { Genre } = require("../../../model/genre");
const { User } = require("../../../model/user");
const req = supertest(app);

describe("/api/genres", () => {
  afterEach(async () => {
    await Genre.collection.deleteMany();
  });
  describe("/GET", () => {
    it("should return all genres from database", async () => {
      await Genre.collection.insertMany([
        { name: "genre1" },
        { name: "genre2" },
      ]);
      const res = await req.get("/api/genres");
      expect(res.body.some((g) => g.name === "genre1")).toBeTruthy();
      expect(res.body.some((g) => g.name === "genre2")).toBeTruthy();
    });
    it("it should return 404 if no genre found", async () => {
      const res = await req.get("/api/genres");
      expect(res.status).toBe(404);
    });
  });
  describe("/:id GET", () => {
    it("should return 400 if id is invalid", async () => {
      const res = await req.get("/api/genres/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre with given id not found", async () => {
      const id = new mongoose.Types.ObjectId();
      const res = await req.get("/api/genres/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 if genre with given id found", async () => {
      const genre = new Genre({
        name: "genre3",
      });
      await genre.save();
      const res = await req.get("/api/genres/" + genre._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
    });
  });
  describe("/POST", () => {
    it("should return 401 if no token provided", async () => {
      const res = await req.post("/api/genres");
      expect(res.status).toBe(401);
    });

    it("should return 400 if genre name is less than 3 character", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({ name: "ay" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if genre name is greater than 50 character", async () => {
      const token = new User().getAuthToken();
      const name = new Array(53).join("a");
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name: name,
        });
      expect(res.status).toBe(400);
    });

    it("should return genre", async () => {
      const token = new User().getAuthToken();
      await req.post("/api/genres").set("x-auth-token", token).send({
        name: "genre4",
      });
      const genre = await Genre.findOne({ name: "genre4" });
      expect(genre).not.toBeNull();
      expect(genre).toHaveProperty("name", "genre4");
    });

    it("should return 200 genre is successfully post", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/genres")
        .set("x-auth-token", token)
        .send({
          name: "genre5",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "genre5");
    });
  });
  describe("/:id PUT", () => {
    it("should return 401 if no token provided", async () => {
      const res = await req.put("/api/genres/" + 4);
      expect(res.status).toBe(401);
    });

    it("should return 400 if ID is invalid", async () => {
      const token = new User().getAuthToken();
      const res = await req.put("/api/genres/" + 1).set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 400 if name is less than 3 characters", async () => {
      const token = new User().getAuthToken();
      const genre = new Genre({
        name: "genre",
      });
      await genre.save();

      const res = await req
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "g1" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if name is more than 50 characters", async () => {
      const token = new User().getAuthToken();
      const name = new Array(62).join("s");

      const genre = new Genre({
        name: "genre",
      });
      await genre.save();

      const res = await req
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name });
      expect(res.status).toBe(400);
    });

    it("should return 404 if could not found genre with given ID", async () => {
      const id = new mongoose.Types.ObjectId(12);
      const token = new User().getAuthToken();
      await Genre.collection.insertMany([
        { name: "Drama" },
        { name: "Action" },
        { name: "Romatic" },
      ]);
      const res = await req
        .put("/api/genres/" + id)
        .set("x-auth-token", token)
        .send({ name: "Comedy" });
      expect(res.status).toBe(404);
    });

    it("should return 200 if updated the Genre with the given ID", async () => {
      const token = new User().getAuthToken();
      await Genre.collection.insertMany([
        { name: "Drama" },
        { name: "Action" },
        { name: "Romatic" },
      ]);
      const genre = await Genre.findOne({ name: "Romatic" });
      const res = await req
        .put("/api/genres/" + genre._id)
        .set("x-auth-token", token)
        .send({ name: "Comedy" });
      expect(res.status).toBe(200);
    });
  });

  describe("/:id DELETE", () => {
    it("should return 401 if no token is provided", async () => {
      const res = await req.delete("/api/genres/" + 1);
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not an Admin", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .delete("/api/genres/" + 1)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if ID is invalid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .delete("/api/genres/" + 19)
        .set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if genre with given id is not found", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId(17);

      await Genre.collection.insertMany([
        { name: "Drama" },
        { name: "Romantic" },
      ]);

      const res = await req
        .delete("/api/genres/" + id)
        .set("x-auth-token", token);
      expect(res.status).toBe(404);
    });

    it("should return 200 if genre with given id is deleted", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      await Genre.collection.insertMany([
        { name: "Action" },
        { name: "Comedy" },
      ]);
      const genre = await Genre.findOne({ name: "Comedy" });
      const res = await req
        .delete("/api/genres/" + genre._id)
        .set("x-auth-token", token);
      expect(res.status).toBe(200);
    });
  });
});
