const mongoose = require("mongoose");
const app = require("../../../index");
const supertest = require("supertest");
const { iteratee } = require("lodash");
const { User } = require("../../../model/user");
const req = supertest(app);
const bcrypt = require("bcrypt");

describe("/api/login", () => {
  afterEach(async () => {
    await User.collection.deleteMany();
  });
  describe("/POST", () => {
    it("should return 400 if email is not a valid ", async () => {
      const res = await req
        .post("/api/login")
        .send({ email: "vsp45gmail.com", password: "12345" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if password not provided", async () => {
      const res = await req.post("/api/login").send({
        email: "vsp45@gmail.com",
      });
      expect(res.status).toBe(400);
    });

    it("should return 404 if user with given email not found", async () => {
      const res = await req
        .post("/api/login")
        .send({ email: "vsp@gmail.com", password: "12345" });
      expect(res.status).toBe(404);
    });

    it("should return 400 if password is invalid", async () => {
      const user = new User({
        name: "vyankatesh",
        email: "vsp@gmail.com",
        isAdmin: true,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash("12345", salt);
      await user.save();
      const res = await req.post("/api/login").send({
        email: "vsp@gmail.com",
        password: "123456",
      });
      expect(res.status).toBe(400);
    });

    it("should return 200 if email and password  are valid", async () => {
      const user = new User({
        name: "vyankatesh",
        email: "vsp@gmail.com",
        isAdmin: true,
      });
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash("12345", salt);
      await user.save();
      const res = await req.post("/api/login").send({
        email: "vsp@gmail.com",
        password: "12345",
      });
      expect(res.status).toBe(200);
    });
  });
});
