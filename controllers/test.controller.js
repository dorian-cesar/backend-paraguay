const test = (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando',
    timestamp: new Date().toISOString()
  });
};

module.exports = {
  test,
};
