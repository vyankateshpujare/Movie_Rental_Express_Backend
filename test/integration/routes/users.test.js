const mongoose = require("mongoose");
const app = require("../../../index");
const supertest = require("supertest");
const { User } = require("../../../model/user");
const req = supertest(app);
const bcrypt = require("bcrypt");

describe("/POST", () => {
  afterEach(async () => {
    await User.collection.deleteMany();
  });
  it("should return 400 if user's name is less than 5 character", async () => {
    const res = await req
      .post("/api/users")
      .send({ name: "ag", email: "vsp@gmail.com", password: "12345" });
    expect(res.status).toBe(400);
  });

  it("should return 400 if user's name is greater than 50 character", async () => {
    const name = new Array(60).join("a");
    const res = await req
      .post("/api/users")
      .send({ name, email: "vsp@gmail.com", password: "12345" });
    expect(res.status).toBe(400);
  });

  it("should return 400 if email is not valid", async () => {
    const res = await req
      .post("/api/users")
      .send({ name: "vyankatesh", email: "vspgmail.com", password: "12345" });
    expect(res.status).toBe(400);
  });

  it("should return 400 if password is less than 5 character", async () => {
    const res = await req
      .post("/api/users")
      .send({ name: "vyankatesh", email: "vsp@gmail.com", password: "1234" });
    expect(res.status).toBe(400);
  });

  it("should return 400 if password is greater than 255 character", async () => {
    const password = new Array(1270).join("a");
    const res = await req
      .post("/api/users")
      .send({ name: "vyankatesh", email: "vsp@gmail.com", password });
    expect(res.status).toBe(400);
  });

  it("should return 400 if user is already registered", async () => {
    const user = new User({
      name: "vyankatesh",
      email: "vsp@gmail.com",
      password: "12345",
      isAdmin: true,
    });
    await user.save();

    const res = await req
      .post("/api/users")
      .send({ name: "vyankatesh", email: "vsp@gmail.com", password: "12345" });
    expect(res.status).toBe(400);
  });

  it("should return 200 the user if it is saved", async () => {

    const res=await req.post("/api/users").send({name: "vyankatesh",
    email: "vsp@gmail.com",
    password:"12345",
    isAdmin: true,});
    expect(res.status).toBe(200);
  });
});
