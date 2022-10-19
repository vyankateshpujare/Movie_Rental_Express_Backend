const express = require("express");
const router = express.Router();
const { User, validateUser } = require("../model/user");
const lodash = require("lodash");
const bcrypt = require("bcrypt");

router.post("/", async (req, res) => {
  const { error } = validateUser(req.body);
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("user already registered");

  user = new User({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    isAdmin: req.body.isAdmin,
  });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(req.body.password, salt);

  await user.save();
  //res.status(200).send(lodash.pick(user, ["name", "_id", "email", "isAdmin"]));
  res.send(user);
});

module.exports = router;
