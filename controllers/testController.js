// Controlador de prueba
const getHello = (req, res) => {
  res.json({ message: "Hola desde el controlador 🎉" });
};

const postEcho = (req, res) => {
  const { text } = req.body;
  res.json({ received: text, status: "OK" });
};

module.exports = {
  getHello,
  postEcho,
};
