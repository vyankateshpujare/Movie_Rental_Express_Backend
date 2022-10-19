const mongoose = require("mongoose");
const app = require("../../../index");
const supertest = require("supertest");
const { Genre } = require("../../../model/genre");
const { User } = require("../../../model/user");
const req = supertest(app);

describe("auth", () => {
    afterEach(async()=>{
        await Genre.collection.deleteMany({});
    });

  it("Should return 401 if no token is provided", async () => {
    const res = await req.post("/api/genres");
    expect(res.status).toBe(401);
  });

  it("should return 400 if token is invalid", async () => {
    const token = "abcd";
    const res = await req.post("/api/genres").set("x-auth-token", token);
    expect(res.status).toBe(400);
  });

  it("should return 200 if token is valid", async () => {
    const token = await new User().getAuthToken();
    const res = await req
      .post("/api/genres")
      .set("x-auth-token", token)
      .send({ name: "genre_auth" });
    expect(res.status).toBe(200);
  });
});
