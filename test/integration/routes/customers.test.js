const mongoose = require("mongoose");
const app = require("../../../index");
const supertest = require("supertest");
const { Customer } = require("../../../model/customer");
const { User } = require("../../../model/user");
const req = supertest(app);

describe("/api/customers", () => {
  afterEach(async () => {
    await Customer.collection.deleteMany();
  });

  describe("/GET", () => {
    it("should return all customers from database", async () => {
      await Customer.collection.insertMany([
        { name: "customer1", phone: "9923349581" },
        { name: "customer2", phone: "9867452312" },
      ]);
      const res = await req.get("/api/customers");
      expect(
        res.body.some((c) => c.name === "customer1" && c.phone === "9923349581")
      ).toBeTruthy();
      expect(
        res.body.some((c) => c.name === "customer2" && c.phone === "9867452312")
      ).toBeTruthy();
    });

    it("it should return 404 if no customer found", async () => {
      const res = await req.get("/api/customers");
      expect(res.status).toBe(404);
    });
  });
  describe("/:id GET", () => {
    it("should return 400 if Id is invalid", async () => {
      const res = await req.get("/api/customers/" + 1);
      expect(res.status).toBe(400);
    });

    it("should return 404 if customer with given id not found", async () => {
      const id =new mongoose.Types.ObjectId();
      const res = await req.get("/api/customers/" + id);
      expect(res.status).toBe(404);
    });

    it("should return 200 if customer with given id found", async () => {
      const customer = new Customer({
        name: "customer3",
        phone: "9867452312",
      });
      await customer.save();
      const res = await req.get("/api/customers/" + customer._id);
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("_id");
      expect(res.body).toHaveProperty("phone");
    });
  });
  describe("/POST", () => {
    it("should return 401 if no token provided", async () => {
      const res = await req.post("/api/customers");
      expect(res.status).toBe(401);
    });

    it("should return 400 if customer's name is less than 3 character", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({ name: "ag", phone: "9876543212" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's name is greater than 50 character", async () => {
      const token = new User().getAuthToken();
      const name = new Array(77).join("y");

      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({ name, phone: "9876543212" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is less than 7 digit", async () => {
      const token = new User().getAuthToken();

      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({ name: "vyankatesh", phone: "987654" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is greater than 10 digit", async () => {
      const token = new User().getAuthToken();

      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({ name: "vyankatesh", phone: "98765432211" });
      expect(res.status).toBe(400);
    });

    it("should return customer if it is saved", async () => {
      const token = new User().getAuthToken();
      await req.post("/api/customers").set("x-auth-token", token).send({
        name: "customer5",
        phone: "9876543212",
      });
      const customer = await Customer.findOne({ name: "customer5" });
      expect(customer).not.toBeNull();
      expect(customer).toHaveProperty("name", "customer5");
      expect(customer).toHaveProperty("phone", "9876543212");
    });

    it("should return 200  if customer successfully post", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .post("/api/customers")
        .set("x-auth-token", token)
        .send({
          name: "customer5",
          phone: "9876543212",
        });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "customer5");
      expect(res.body).toHaveProperty("phone", "9876543212");
    });
  });
  describe("/:id PUT", () => {
    it("should return 401 if no token provided", async () => {
      const res = await req.put("/api/customers/" + 2);
      expect(res.status).toBe(401);
    });

    it("should return 400 if Id is invalid", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .put("/api/customers/" + 1)
        .set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's name is less than 3 character", async () => {
      const token = new User().getAuthToken();
      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
      });
      await customer.save();

      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "ag", phone: "9876543212" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's name is greater than 50 character", async () => {
      const token = new User().getAuthToken();
      const name = new Array(78).join("o");

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
      });
      await customer.save();

      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name, phone: "9876543212" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is less than 7 digit", async () => {
      const token = new User().getAuthToken();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
      });
      await customer.save();

      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "prashant", phone: "9876" });
      expect(res.status).toBe(400);
    });

    it("should return 400 if customer's phone is greater than 10 digit", async () => {
      const token = new User().getAuthToken();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
      });
      await customer.save();

      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "prashant", phone: "9876675427856" });
      expect(res.status).toBe(400);
    });

    it("should return 404 if customer with given Id not present", async () => {
      const token = new User().getAuthToken();
      const id = new mongoose.Types.ObjectId();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
      });
      await customer.save();

      const res = await req
        .put("/api/customers/" + id)
        .set("x-auth-token", token)
        .send({ name: "prashant", phone: "9876675427" });
      expect(res.status).toBe(404);
    });

    it("should update the customer if everything is valid", async () => {
      const token = new User().getAuthToken();

      let customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
      });
      await customer.save();

      await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "prashant", phone: "9876675427" });

      customer = await Customer.findById(customer._id);
      expect(customer).not.toBeNull();
      expect(customer).toHaveProperty("name", "prashant");
    });

    it("should return 200 if customer is saved ", async () => {
      const token = new User().getAuthToken();

      let customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
      });
      await customer.save();

      const res = await req
        .put("/api/customers/" + customer._id)
        .set("x-auth-token", token)
        .send({ name: "prashant", phone: "9876675427" });

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty("name", "prashant");
      expect(res.body).toHaveProperty("phone", "9876675427");
    });
  });
  describe("/:id DELETE", () => {
    it("should return 401 if no token provided", async () => {
      const res = await req.delete("/api/customers/" + 2);
      expect(res.status).toBe(401);
    });

    it("should return 403 if user is not Admin", async () => {
      const token = new User().getAuthToken();
      const res = await req
        .delete("/api/customers/" + 2)
        .set("x-auth-token", token);
      expect(res.status).toBe(403);
    });

    it("should return 400 if Id is invalid", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const res = await req
        .delete("/api/customers/" + 1)
        .set("x-auth-token", token);
      expect(res.status).toBe(400);
    });

    it("should return 404 if customer with given Id not present", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();
      const id = new mongoose.Types.ObjectId();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
      });
      await customer.save();

      const res = await req
        .delete("/api/customers/" + id)
        .set("x-auth-token", token);

      expect(res.status).toBe(404);
    });

    it("should return 200 if customer with given Id is deleted", async () => {
      const token = new User({ isAdmin: true }).getAuthToken();

      const customer = new Customer({
        name: "vyankatesh",
        phone: "9923349581",
      });
      await customer.save();

      const res = await req
        .delete("/api/customers/" + customer._id)
        .set("x-auth-token", token);

      expect(res.status).toBe(200);
    });
  });
});
