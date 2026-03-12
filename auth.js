const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const SECRET = process.env.JWT_SECRET || "supersecretkey";

// validation helpers
function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validName(name) {
  return /^[A-Za-z\u00C0-\u017F\s]+$/.test(name);
}

function validCedula(cedula) {
  return /^\d+$/.test(cedula);
}

// REGISTER
router.post("/register", async (req, res) => {
  try {
    console.log("=== REGISTER REQUEST ===");
    console.log("Body recibido:", req.body);
    
    const { nombre, correo, cedula, password } = req.body;
    
    // Validar campos requeridos
    if (!nombre || !correo || !cedula || !password) {
      console.log("Error: Faltan campos");
      return res.status(400).json({ error: "Faltan campos requeridos" });
    }
    
    // Validar formato de nombre
    if (!validName(nombre)) {
      console.log("Error: Nombre invalido");
      return res.status(400).json({ error: "Nombre invalido: solo letras y espacios" });
    }
    
    // Validar formato de email
    if (!validEmail(correo)) {
      console.log("Error: Email invalido");
      return res.status(400).json({ error: "Email invalido" });
    }
    
    // Validar formato de cédula
    if (!validCedula(cedula)) {
      console.log("Error: Cedula invalida");
      return res.status(400).json({ error: "Cedula invalida: solo numeros" });
    }
    
    // Validar longitud de contraseña
    if (password.length < 6) {
      console.log("Error: Contraseña corta");
      return res.status(400).json({ error: "La contrasena debe tener al menos 6 caracteres" });
    }
    
    // Verificar si el correo ya existe
    const existEmail = await User.findOne({ where: { correo } });
    if (existEmail) {
      console.log("Error: Correo ya existe");
      return res.status(400).json({ error: "Correo ya registrado" });
    }
    
    // Verificar si la cédula ya existe
    const existCed = await User.findOne({ where: { cedula } });
    if (existCed) {
      console.log("Error: Cedula ya existe");
      return res.status(400).json({ error: "Cedula ya registrada" });
    }
    
    // Crear usuario
    const hash = await bcrypt.hash(password, 10);
    const u = await User.create({ 
      nombre, 
      correo, 
      cedula, 
      passwordHash: hash 
    });
    
    console.log("Usuario creado exitosamente:", u.id);
    
    // Generar token
    const token = jwt.sign({ id: u.id }, SECRET, { expiresIn: "7d" });
    
    res.json({ 
      token, 
      user: { 
        id: u.id, 
        nombre: u.nombre, 
        correo: u.correo, 
        cedula: u.cedula 
      } 
    });
    
  } catch (err) {
    console.error("Error en register:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

// LOGIN - Requiere correo, cedula Y contraseña
router.post("/login", async (req, res) => {
  try {
    console.log("=== LOGIN REQUEST ===");
    console.log("Body recibido:", req.body);
    
    const { correo, cedula, password } = req.body;
    
    // Validar que todos los campos estén presentes
    if (!correo || !cedula || !password) {
      console.log("Error: Faltan campos - correo:", !!correo, "cedula:", !!cedula, "password:", !!password);
      return res.status(400).json({ error: "Debe ingresar correo, cedula y contrasena" });
    }
    
    // Validar formato de correo
    if (!validEmail(correo)) {
      console.log("Error: Email invalido:", correo);
      return res.status(400).json({ error: "Correo electronico invalido" });
    }
    
    // Validar formato de cédula
    if (!validCedula(cedula)) {
      console.log("Error: Cedula invalida:", cedula);
      return res.status(400).json({ error: "Cedula invalida: solo numeros" });
    }
    
    console.log("Buscando usuario con correo:", correo, "y cedula:", cedula);
    
    // Buscar usuario que coincida con correo Y cédula
    const u = await User.findOne({ 
      where: { 
        correo: correo,
        cedula: cedula 
      } 
    });
    
    // Si no existe usuario con ese correo y cédula
    if (!u) {
      console.log("Error: Usuario no encontrado con esos datos");
      return res.status(400).json({ error: "Credenciales invalidas" });
    }
    
    console.log("Usuario encontrado:", u.id, u.nombre);
    
    // Verificar contraseña
    const ok = await bcrypt.compare(password, u.passwordHash);
    if (!ok) {
      console.log("Error: Contraseña incorrecta");
      return res.status(400).json({ error: "Credenciales invalidas" });
    }
    
    console.log("Login exitoso para usuario:", u.id);
    
    // Todo correcto, generar token
    const token = jwt.sign({ id: u.id }, SECRET, { expiresIn: "7d" });
    
    res.json({ 
      token, 
      user: { 
        id: u.id, 
        nombre: u.nombre, 
        correo: u.correo, 
        cedula: u.cedula 
      } 
    });
    
  } catch (err) {
    console.error("Error en login:", err);
    res.status(500).json({ error: "Error del servidor" });
  }
});

module.exports = router;