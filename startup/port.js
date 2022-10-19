module.exports = function (app) {
  const PORT = process.env.NODE_ENV || 4000;
  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
};
