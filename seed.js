const { Product } = require("./models");

module.exports = async function seed() {
  const products = [
    { name: "Classic Burger", category: "Burger", price: 11.000, image: "./assets/images/product-burger-1.png"},
    { name: "Cheese Lover", category: "Burger", price: 13.500, image: "./assets/images/product-burger-2.png" },
    { name: "Bacon Blast", category: "Burger", price: 12.500, image: "./assets/images/product-burger-3.png" },
    { name: "Spicy Fiesta", category: "Burger", price: 15.000, image: "./assets/images/product-burger-4.png" },
    { name: "Vegan Delight", category: "Burger", price: 17.000, image: "./assets/images/product-burger-5.png" },
    { name: "Margherita", category: "Pizza", price: 22.000, image: "./assets/images/product-pizza-1.png"},
    { name: "Pepperoni Feast", category: "Pizza", price: 25.000, image: "./assets/images/product-pizza-2.png" },
    { name: "BBQ Chicken", category: "Pizza", price: 24.500, image: "./assets/images/product-pizza-3.png" },
    { name: "Veggie Garden", category: "Pizza", price: 30.000, image: "./assets/images/product-pizza-4.png" },
    { name: "Four Cheese", category: "Pizza", price: 27.000, image: "./assets/images/product-pizza-5.png" },
    { name: "Limona Coco", category: "Drink", price: 6.000, image: "./assets/images/product-drink-5.png" },
    { name: "Iced Tea", category: "Drink", price: 4.000, image: "./assets/images/product-drink-1.png" },
    { name: "Limonada Fresca", category: "Drink", price: 5.000, image: "./assets/images/product-drink-2.png" },
    { name: "Cerveza", category: "Drink", price: 8.000, image: "./assets/images/product-drink-3.png" },
    { name: "Milkshake", category: "Drink", price: 7.000, image: "./assets/images/product-drink-4.png" }
  ];
  for (const p of products) await Product.create(p);
};