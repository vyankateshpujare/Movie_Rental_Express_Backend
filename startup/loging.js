require("express-async-errors");
require("winston-mongodb");
const winston = require("winston");
const config = require("config");

module.exports = function () {
  winston.configure({
    transports: [
      new winston.transports.File({ filename: "logfile.log" }),
      new winston.transports.Console(),
      new winston.transports.MongoDB({
        db: config.get("db"),
        options: { useUnifiedTopology: true },
      }),
    ],
  });

  process.on("uncaughtException", () => {
    winston.error("we have got an uncaught exception");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });

  process.on("unhandledRejection", () => {
    winston.error("we have got an unhandle rejection exception");
    setTimeout(() => {
      process.exit(1);
    }, 2000);
  });
};
