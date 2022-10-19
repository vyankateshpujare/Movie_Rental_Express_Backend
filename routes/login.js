const express = require("express");
const router = express.Router();
const Joi = require("joi");
const bcrypt = require("bcrypt");
const { User, userSchema } = require("../model/user");

router.use(express.json());

router.post("/", async (req, res) => {
  const { error } = validate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(404).send("Invalid Email or password");

  const isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(400).send("Invalid Username or password");

  const token = user.getAuthToken();
  //console.log(token);

  res.status(200).send(token);
});

function validate(data) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(5).max(1024).required(),
  });
  return schema.validate(data);
}
module.exports = router;
