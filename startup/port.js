module.exports = function (app) {
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => console.log(`listening on port ${PORT}`));
};
