const getHello = (req, res) => {
  res.json({
    status: 'OK',
    message: 'Backend funcionando',
    timestamp: new Date().toISOString()
  });
};

const postEcho = (req, res) => {
  const { text } = req.body;
  res.json({ received: text, status: "OK" });
};

module.exports = {
  getHello,
  postEcho,
};
