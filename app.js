const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sequelize, User, Product, CartItem, Order, OrderItem } = require("./models");
const auth = require("./routes/auth");
const api = require("./routes/api");

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use("/uploads", express.static(__dirname + "/../assets/images/generated"));

app.use("/api/auth", auth);
app.use("/api", api);

const PORT = process.env.PORT || 4000;
sequelize.sync({ force: false }).then(async () => {
  console.log("DB synced");
  const count = await Product.count();
  if (count === 0) {
    const seed = require("./seed");
    await seed();
    console.log("Seeded products");
  }
  app.listen(PORT, () => console.log("Server running on port", PORT));
});