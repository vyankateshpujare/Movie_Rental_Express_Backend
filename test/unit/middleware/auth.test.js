const { iteratee } = require("lodash");
const mongoose = require("mongoose");
const auth = require("../../../middleware/auth");
const { User } = require("../../../model/user");

describe("auth", () => {
  it("should populate request with decoded payload", () => {
    const user = new User({
      _id: new mongoose.Types.ObjectId(),
      isAdmin: true,
    });
    const token = new User(user).getAuthToken();
    const req = {
      header: jest.fn().mockReturnValue(token),
    };
    const res = {};
    const next = jest.fn();
    auth(req, res, next);
    expect(req.user).toHaveProperty("_id", user._id.toHexString());
    expect(req.user).toHaveProperty("isAdmin", user.isAdmin);
  });
});
