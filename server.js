const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");
const { sequelize, User, Product, CartItem, Order, OrderItem } = require("./models");
const authRoutes = require("./routes/auth");
const apiRoutes = require("./routes/api");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// serve uploaded images (real or placeholders)
app.use("/uploads", express.static(path.join(__dirname, "..", "assets", "images", "real")));

// mount routes
app.use("/api/auth", authRoutes);
app.use("/api", apiRoutes);

const PORT = process.env.PORT || 4000;
sequelize.sync({ force: false }).then(async ()=>{
  console.log("DB synced");
  const cnt = await Product.count();
  if (cnt === 0) {
    const seed = require("./seed");
    await seed();
    console.log("Seeded products");
  }
  app.listen(PORT, ()=> console.log("Server listening on", PORT));
}).catch(err=> console.error(err));