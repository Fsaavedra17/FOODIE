const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const { Product, CartItem, User, Order, OrderItem } = require("../models");
const SECRET = process.env.JWT_SECRET || "supersecretkey";

function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "No token" });
  const token = auth.split(" ")[1];
  try {
    const data = jwt.verify(token, SECRET);
    req.userId = data.id;
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid token" });
  }
}

router.get("/products", async (req, res) => {
  const products = await Product.findAll();
  res.json(products);
});

router.get("/cart", authMiddleware, async (req, res) => {
  const items = await CartItem.findAll({ where: { UserId: req.userId }, include: Product });
  res.json(items);
});

router.post("/cart", authMiddleware, async (req, res) => {
  const { productId, quantity } = req.body;
  const q = parseInt(quantity) || 1;
  let item = await CartItem.findOne({ where: { UserId: req.userId, ProductId: productId } });
  if (item) {
    item.quantity = item.quantity + q;
    await item.save();
  } else {
    item = await CartItem.create({ UserId: req.userId, ProductId: productId, quantity: q });
  }
  res.json(item);
});

router.delete("/cart/:id", authMiddleware, async (req, res) => {
  const id = req.params.id;
  const item = await CartItem.findOne({ where: { id, UserId: req.userId } });
  if (!item) return res.status(404).json({ error: "Not found" });
  await item.destroy();
  res.json({ success: true });
});

router.post("/checkout", authMiddleware, async (req, res) => {
  const { billingName, billingAddress } = req.body;
  const items = await CartItem.findAll({ where: { UserId: req.userId }, include: Product });
  if (items.length === 0) return res.status(400).json({ error: "Cart empty" });
  let total = 0;
  for (const it of items) total += it.quantity * it.Product.price;
  const order = await Order.create({ UserId: req.userId, total, billingName, billingAddress });
  for (const it of items) {
    await OrderItem.create({ OrderId: order.id, ProductId: it.ProductId, quantity: it.quantity, price: it.Product.price });
    await it.destroy();
  }
  res.json({ orderId: order.id, total });
});

module.exports = router;