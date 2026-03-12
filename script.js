'use strict';

const navbar = document.querySelector("[data-navbar]");
const navbarLinks = document.querySelectorAll("[data-nav-link]");
const menuToggleBtn = document.querySelector("[data-menu-toggle-btn]");

menuToggleBtn.addEventListener("click", function () {
  navbar.classList.toggle("active");
  this.classList.toggle("active");
});

for (let i = 0; i < navbarLinks.length; i++) {
  navbarLinks[i].addEventListener("click", function () {
    navbar.classList.toggle("active");
    menuToggleBtn.classList.toggle("active");
  });
}

const header = document.querySelector("[data-header]");
const backTopBtn = document.querySelector("[data-back-top-btn]");

window.addEventListener("scroll", function () {
  if (window.scrollY >= 100) {
    header.classList.add("active");
    backTopBtn.classList.add("active");
  } else {
    header.classList.remove("active");
    backTopBtn.classList.remove("active");
  }
});

const searchBtn = document.querySelector("[data-search-btn]");
const searchContainer = document.querySelector("[data-search-container]");
const searchSubmitBtn = document.querySelector("[data-search-submit-btn]");
const searchCloseBtn = document.querySelector("[data-search-close-btn]");

const searchBoxElems = [searchBtn, searchSubmitBtn, searchCloseBtn];

for (let i = 0; i < searchBoxElems.length; i++) {
  searchBoxElems[i].addEventListener("click", function () {
    searchContainer.classList.toggle("active");
    document.body.classList.toggle("active");
  });
}

const deliveryBoy = document.querySelector("[data-delivery-boy]");

if (deliveryBoy) {
  let deliveryBoyMove = -80;
  let lastScrollPos = 0;

  window.addEventListener("scroll", function () {
    let deliveryBoyTopPos = deliveryBoy.getBoundingClientRect().top;

    if (deliveryBoyTopPos < 500 && deliveryBoyTopPos > -250) {
      let activeScrollPos = window.scrollY;

      if (lastScrollPos < activeScrollPos) {
        deliveryBoyMove += 1;
      } else {
        deliveryBoyMove -= 1;
      }

      lastScrollPos = activeScrollPos;
      deliveryBoy.style.transform = `translateX(${deliveryBoyMove}px)`;
    }
  });
}

// API CLIENT
const API = (function(){
  const base = "http://localhost:4000/api";
  function getToken(){ return localStorage.getItem("token"); }
  async function request(path, opts={}){
    opts.headers = opts.headers||{};
    if(getToken()) opts.headers["Authorization"] = "Bearer " + getToken();
    const res = await fetch(base + path, opts);
    return res.json();
  }
  return {
    register: (data) => request("/auth/register", {method:"POST", body: JSON.stringify(data), headers: {"Content-Type":"application/json"}}),
    login: (data) => request("/auth/login", {method:"POST", body: JSON.stringify(data), headers: {"Content-Type":"application/json"}}),
    products: () => request("/products"),
    getCart: () => request("/cart"),
    addCart: (productId, qty=1) => request("/cart", {method:"POST", body: JSON.stringify({productId, quantity: qty}), headers: {"Content-Type":"application/json"}}),
    delCart: (id) => request("/cart/"+id, {method:"DELETE"}),
    checkout: (billing) => request("/checkout", {method:"POST", body: JSON.stringify(billing), headers: {"Content-Type":"application/json"}})
  };
})();

function validEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
function validName(name) {
  return /^[A-Za-z\u00C0-\u017F\s]+$/.test(name);
}
function validCedula(cedula) {
  return /^\d+$/.test(cedula);
}

function showAlert(message, type = 'success') {
  const alertDiv = document.createElement('div');
  alertDiv.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: ${type === 'success' ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)' : 'linear-gradient(135deg, #f44336 0%, #d32f2f 100%)'};
    color: white;
    border-radius: 12px;
    box-shadow: 0 8px 24px rgba(0,0,0,0.2);
    z-index: 10001;
    font-weight: 600;
    font-size: 15px;
    animation: slideInRight 0.4s ease-out;
    max-width: 320px;
  `;
  alertDiv.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideInRight {
      from { transform: translateX(400px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
  `;
  document.head.appendChild(style);
  
  document.body.appendChild(alertDiv);
  
  setTimeout(() => {
    alertDiv.style.animation = 'slideInRight 0.4s ease-out reverse';
    setTimeout(() => alertDiv.remove(), 400);
  }, 3000);
}

document.addEventListener("DOMContentLoaded", async ()=>{
  const productsGrid = document.getElementById("productsGrid");
  const cartBadge = document.getElementById("cartBadge");
  const cartItemsDiv = document.getElementById("cartItems");
  const cartTotal = document.getElementById("cartTotal");
  const authModal = document.getElementById("loginModal");
  const btnOpenLogin = document.getElementById("navLoginBtn");
  const btnCloseLogin = document.getElementById("btnCloseLogin");
  const btnLogin = document.getElementById("btnLogin");
  const btnRegister = document.getElementById("btnRegister");
  const authMsg = document.getElementById("authMsg");
  const btnCheckout = document.getElementById("btnCheckout");
  
  const floatingCartBtn = document.getElementById("floatingCartBtn");
  const cartSidebar = document.getElementById("cartSidebar");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartOverlay = document.getElementById("cartOverlay");
  
  const orderSummaryModal = document.getElementById("orderSummaryModal");
  const paymentCardModal = document.getElementById("paymentCardModal");
  const successPaymentModal = document.getElementById("successPaymentModal");
  
  floatingCartBtn.addEventListener("click", () => {
    cartSidebar.style.right = "0";
    cartOverlay.style.display = "block";
    setTimeout(() => cartOverlay.style.opacity = "1", 10);
  });
  
  function closeCart() {
    cartSidebar.style.right = "-400px";
    cartOverlay.style.opacity = "0";
    setTimeout(() => cartOverlay.style.display = "none", 300);
  }
  
  closeCartBtn.addEventListener("click", closeCart);
  cartOverlay.addEventListener("click", closeCart);

  btnOpenLogin.addEventListener("click", ()=> authModal.style.display = "flex");
  btnCloseLogin.addEventListener("click", ()=> {
    authModal.style.display = "none";
    authMsg.textContent = "";
    authMsg.style.background = "";
  });

  // REGISTER
  btnRegister.addEventListener("click", async ()=>{
    const nombre = document.getElementById("authName").value.trim();
    const cedula = document.getElementById("authCedula").value.trim();
    const correo = document.getElementById("authEmail").value.trim();
    const password = document.getElementById("authPassword").value;

    authMsg.textContent = "";
    authMsg.style.background = "";

    if (!nombre || !correo || !cedula || !password) {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = "Todos los campos son requeridos";
      return;
    }
    if (!validName(nombre)) {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = "Nombre invalido: solo letras y espacios";
      return;
    }
    if (!validCedula(cedula)) {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = "Cedula invalida: solo numeros";
      return;
    }
    if (!validEmail(correo)) {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = "Correo electronico invalido";
      return;
    }
    if (password.length < 6) {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = "La contrasena debe tener al menos 6 caracteres";
      return;
    }

    const res = await API.register({ nombre, correo, cedula, password });
    
    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      authModal.style.display = "none";
      authMsg.textContent = "";
      updateNavUser(res.user);
      loadCart();
      showAlert("Cuenta creada exitosamente! Bienvenido a Foodie", "success");
      clearAuthInputs();
    } else {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = res.error || "Error al registrar";
    }
  });

  // LOGIN - CORREGIDO: Envia correo, cedula Y contraseña
  btnLogin.addEventListener("click", async ()=>{
    const correo = document.getElementById("authEmail").value.trim();
    const cedula = document.getElementById("authCedula").value.trim();
    const password = document.getElementById("authPassword").value;
    
    console.log("=== LOGIN FRONTEND ===");
    console.log("Correo:", correo);
    console.log("Cedula:", cedula);
    console.log("Password:", password ? "***" : "(vacio)");
    
    authMsg.textContent = "";
    authMsg.style.background = "";
    
    if (!correo || !cedula || !password) {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = "Ingrese correo, cedula y contrasena";
      return;
    }
    
    if (!validEmail(correo)) {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = "Correo electronico invalido";
      return;
    }
    
    if (!validCedula(cedula)) {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = "Cedula invalida: solo numeros";
      return;
    }
    
    console.log("Enviando al backend:", { correo, cedula, password: "***" });
    
    const res = await API.login({ correo, cedula, password });
    
    console.log("Respuesta del backend:", res);
    
    if (res.token) {
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));
      authModal.style.display = "none";
      authMsg.textContent = "";
      updateNavUser(res.user);
      loadCart();
      showAlert("Sesion iniciada correctamente! Bienvenido de nuevo", "success");
      clearAuthInputs();
    } else {
      authMsg.style.background = "#ffebee";
      authMsg.style.color = "#c62828";
      authMsg.textContent = res.error || "Credenciales incorrectas";
    }
  });

  function clearAuthInputs() {
    document.getElementById("authName").value = "";
    document.getElementById("authCedula").value = "";
    document.getElementById("authEmail").value = "";
    document.getElementById("authPassword").value = "";
  }

  function updateNavUser(user) {
    const nav = document.getElementById("navLoginBtn");
    if (nav && user) {
      nav.textContent = user.nombre || user.correo;
      nav.style.cursor = "default";
      nav.onclick = null;
      
      let logoutBtn = document.getElementById("logoutBtn");
      if (!logoutBtn) {
        logoutBtn = document.createElement("button");
        logoutBtn.id = "logoutBtn";
        logoutBtn.className = "btn";
        logoutBtn.style.cssText = "margin-left:10px; background:linear-gradient(135deg, #e53935 0%, #c62828 100%); box-shadow:0 4px 12px rgba(229,57,53,0.3);";
        logoutBtn.textContent = "Cerrar Sesion";
        logoutBtn.addEventListener("click", () => {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          showAlert("Sesion cerrada correctamente. Hasta pronto!", "success");
          setTimeout(() => window.location.reload(), 1500);
        });
        nav.parentNode.insertBefore(logoutBtn, nav.nextSibling);
      }
    }
  }

  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    try {
      updateNavUser(JSON.parse(storedUser));
    } catch(e) {
      console.error("Error parsing user:", e);
    }
  }

  const prods = await API.products();
  prods.forEach(p => {
    const card = document.createElement("div");
    card.style.cssText = `background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 16px rgba(0,0,0,0.08); transition: all 0.3s ease; cursor: pointer; position: relative;`;
    card.onmouseover = () => {
      card.style.transform = "translateY(-8px)";
      card.style.boxShadow = "0 12px 32px rgba(0,0,0,0.15)";
    };
    card.onmouseout = () => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
    };
    
    card.innerHTML = `
      <div style="position:relative; overflow:hidden; height:200px; background:#f5f5f5;">
        <img src="${p.image}" style="width:100%; height:100%; object-fit:cover; transition:transform 0.3s;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
        <div style="position:absolute; top:12px; right:12px; background:rgba(255,107,26,0.95); color:#fff; padding:6px 12px; border-radius:20px; font-weight:700; font-size:13px; backdrop-filter:blur(4px);">${p.category}</div>
      </div>
      <div style="padding:20px;">
        <h4 style="margin:0 0 8px 0; font-size:20px; color:#333; font-weight:700;">${p.name}</h4>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:16px;">
          <span style="font-size:26px; color:#ff6b1a; font-weight:800;">$${p.price.toFixed(3)}</span>
          <button data-id="${p.id}" class="addBtn" style="background: linear-gradient(135deg, #ff9d2d 0%, #ff6b1a 100%); color: #fff; border: none; padding: 12px 24px; border-radius: 25px; font-weight: 700; font-size: 14px; cursor: pointer; box-shadow: 0 4px 12px rgba(255,107,26,0.3); transition: all 0.3s;" onmouseover="this.style.transform='scale(1.05)'; this.style.boxShadow='0 6px 20px rgba(255,107,26,0.4)';" onmouseout="this.style.transform='scale(1)'; this.style.boxShadow='0 4px 12px rgba(255,107,26,0.3)';">Agregar</button>
        </div>
      </div>
    `;
    productsGrid.appendChild(card);
  });

  productsGrid.addEventListener("click", async (e)=>{
    if(e.target.classList.contains("addBtn")){
      const id = e.target.getAttribute("data-id");
      const res = await API.addCart(parseInt(id));
      if(res.id) {
        showAlert("Producto agregado al carrito", "success");
        loadCart();
      } else if(res.error) {
        showAlert(res.error, "error");
      }
    }
  });

  async function loadCart(){
    const c = await API.getCart();
    const items = Array.isArray(c) ? c : [];
    
    const totalItems = items.reduce((s,i)=>s+i.quantity,0);
    cartBadge.textContent = totalItems;
    cartBadge.style.display = totalItems > 0 ? "flex" : "none";
    
    cartItemsDiv.innerHTML = "";
    
    if (items.length === 0) {
      cartItemsDiv.innerHTML = `
        <div style="text-align:center; padding:40px 20px; color:#999;">
          <ion-icon name="cart-outline" style="font-size:64px; color:#ddd;"></ion-icon>
          <p style="margin-top:16px; font-size:16px;">Tu carrito esta vacio</p>
          <p style="font-size:14px; margin-top:8px;">Agrega algunos productos deliciosos!</p>
        </div>
      `;
      cartTotal.textContent = "$0.00";
      return;
    }
    
    let total = 0;
    items.forEach(it => {
      total += it.quantity * it.Product.price;
      const el = document.createElement("div");
      el.style.cssText = `display: flex; gap: 12px; align-items: center; border-bottom: 1px solid #f0f0f0; padding: 16px 0; animation: fadeIn 0.3s ease-out;`;
      el.innerHTML = `
        <img src="${it.Product.image}" style="width:80px; height:80px; object-fit:cover; border-radius:12px; box-shadow:0 2px 8px rgba(0,0,0,0.1);">
        <div style="flex:1;">
          <strong style="font-size:16px; color:#333; display:block; margin-bottom:4px;">${it.Product.name}</strong>
          <div style="color:#666; font-size:14px; margin-bottom:6px;">${it.quantity} x $${it.Product.price.toFixed(3)}</div>
          <div style="color:#ff6b1a; font-weight:700; font-size:16px;">$${(it.quantity * it.Product.price).toFixed(3)}</div>
        </div>
        <button data-id="${it.id}" class="delBtn" style="background: #ffebee; color: #c62828; border: none; width: 36px; height: 36px; border-radius: 50%; cursor: pointer; display: flex; align-items: center; justify-content: center; transition: all 0.3s; box-shadow: 0 2px 8px rgba(198,40,40,0.2);" onmouseover="this.style.background='#c62828'; this.style.color='#fff'; this.style.transform='scale(1.1)';" onmouseout="this.style.background='#ffebee'; this.style.color='#c62828'; this.style.transform='scale(1)';"><ion-icon name="trash-outline" style="font-size:18px;"></ion-icon></button>
      `;
      cartItemsDiv.appendChild(el);
    });
    
    cartTotal.textContent = "$" + total.toFixed(3);
    
    cartItemsDiv.querySelectorAll(".delBtn").forEach(b=> b.addEventListener("click", async (e)=>{
      const id = e.target.closest("button").getAttribute("data-id");
      await API.delCart(id);
      showAlert("Producto eliminado del carrito", "success");
      loadCart();
    }));
  }

  btnCheckout.addEventListener("click", async ()=>{
    const c = await API.getCart();
    const items = Array.isArray(c) ? c : [];
    
    if (items.length === 0) {
      showAlert("Tu carrito esta vacio", "error");
      return;
    }
    
    const orderItemsList = document.getElementById("orderItemsList");
    orderItemsList.innerHTML = "";
    
    let subtotal = 0;
    items.forEach(it => {
      subtotal += it.quantity * it.Product.price;
      const itemEl = document.createElement("div");
      itemEl.style.cssText = "display:flex; justify-content:space-between; align-items:center; padding:12px 0; border-bottom:1px solid #f0f0f0;";
      itemEl.innerHTML = `
        <div style="flex:1;">
          <strong style="display:block; color:#333; font-size:15px; margin-bottom:4px;">${it.Product.name}</strong>
          <span style="color:#666; font-size:13px;">${it.quantity} x $${it.Product.price.toFixed(3)}</span>
        </div>
        <span style="color:#ff6b1a; font-weight:700; font-size:15px;">$${(it.quantity * it.Product.price).toFixed(3)}</span>
      `;
      orderItemsList.appendChild(itemEl);
    });
    
    const deliveryFee = 5.000;
    const grandTotal = subtotal + deliveryFee;
    
    document.getElementById("orderSubtotal").textContent = "$" + subtotal.toFixed(3);
    document.getElementById("orderGrandTotal").textContent = "$" + grandTotal.toFixed(3);
    
    closeCart();
    orderSummaryModal.style.display = "flex";
  });
  
  document.getElementById("btnCancelOrder").addEventListener("click", ()=>{
    orderSummaryModal.style.display = "none";
  });
  
  document.getElementById("btnProceedToPayment").addEventListener("click", ()=>{
    orderSummaryModal.style.display = "none";
    paymentCardModal.style.display = "flex";
    
    document.getElementById("cardNumber").value = "";
    document.getElementById("cardCVV").value = "";
    document.getElementById("cardExpiry").value = "";
    document.getElementById("cardPassword").value = "";
    document.getElementById("paymentErrorMsg").style.display = "none";
  });
  
  document.getElementById("btnCancelPayment").addEventListener("click", ()=>{
    paymentCardModal.style.display = "none";
  });
  
  document.getElementById("cardNumber").addEventListener("input", (e) => {
    let val = e.target.value.replace(/\s/g, '').replace(/[^0-9]/g, '');
    let formatted = val.match(/.{1,4}/g)?.join(' ') || val;
    e.target.value = formatted;
  });
  
  document.getElementById("cardExpiry").addEventListener("input", (e) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2, 4);
    }
    e.target.value = val;
  });
  
  document.getElementById("btnConfirmPayment").addEventListener("click", async ()=>{
    const cardNumber = document.getElementById("cardNumber").value.replace(/\s/g, '');
    const cardCVV = document.getElementById("cardCVV").value;
    const cardExpiry = document.getElementById("cardExpiry").value;
    const cardPassword = document.getElementById("cardPassword").value;
    const errorMsg = document.getElementById("paymentErrorMsg");
    
    errorMsg.style.display = "none";
    
    if (!cardNumber || cardNumber.length !== 16) {
      errorMsg.textContent = "Numero de tarjeta invalido (16 digitos)";
      errorMsg.style.display = "block";
      return;
    }
    
    if (!cardCVV || cardCVV.length < 3 || cardCVV.length > 4) {
      errorMsg.textContent = "CVV invalido (3 o 4 digitos)";
      errorMsg.style.display = "block";
      return;
    }
    
    if (!cardExpiry || !/^\d{2}\/\d{2}$/.test(cardExpiry)) {
      errorMsg.textContent = "Fecha de vencimiento invalida (MM/AA)";
      errorMsg.style.display = "block";
      return;
    }
    
    if (!cardPassword || cardPassword.length < 4) {
      errorMsg.textContent = "Contrasena de tarjeta invalida";
      errorMsg.style.display = "block";
      return;
    }
    
    const name = "Cliente";
    const address = "Direccion de entrega";
    
    const res = await API.checkout({billingName: name, billingAddress: address});
    
    if(res.orderId) {
      paymentCardModal.style.display = "none";
      
      document.getElementById("orderNumber").textContent = "#" + String(res.orderId).padStart(5, '0');
      document.getElementById("paidAmount").textContent = "$" + res.total.toFixed(3);
      
      successPaymentModal.style.display = "flex";
      
      loadCart();
    } else {
      errorMsg.textContent = res.error || "Error al procesar el pago";
      errorMsg.style.display = "block";
    }
  });
  
  document.getElementById("btnCloseSuccess").addEventListener("click", ()=>{
    successPaymentModal.style.display = "none";
    showAlert("Gracias por tu compra! Tu pedido esta en camino", "success");
  });

  loadCart();
});