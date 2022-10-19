const express = require("express");
const admin = require("../middleware/admin");
const auth = require("../middleware/auth");
const validateObjectId = require("../middleware/validateObjectId");
const router = express.Router();
const { Customer, validateCustomer } = require("../model/customer");

router.use(express.json());

router.get("/", async (req, res) => {
  const customers = await Customer.find();
  if (customers && customers.length == 0)
    return res.status(404).send("customers could not found");

  res.status(200).send(customers);
});

router.get("/:id", validateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer)
    return res.status(404).send("Customer with given id is not present in DB");

  res.status(200).send(customer);
});

router.post("/", auth, async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const customer = new Customer({
    name: req.body.name,
    phone: req.body.phone,
    isGold: req.body.isGold,
  });

  await customer.save();
  res.status(200).send(customer);
});

router.put("/:id", auth, validateObjectId, async (req, res) => {
  const { error } = validateCustomer(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }
  const customer = await Customer.findByIdAndUpdate(
    req.params.id,
    {
      $set: {
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold,
      },
    },
    { new: true, runValidators: true }
  );
  if (!customer) {
    res.status(404).send("customer with given id is not present in DB");
  }
  res.status(200).send(customer);
});

router.delete("/:id", auth, admin, validateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);
  if (!customer) {
    res.status(404).send("customer with given id is not present in DB");
  }
  await Customer.deleteOne({ _id: req.params.id });
  res.status(200).send(customer);
});

module.exports = router;
