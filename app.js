/* ==============================================
   AMMA'S KITCHEN — Application Logic
   ============================================== */

'use strict';

// ─── STATE ───────────────────────────────────────
let menuItems = [];
let cart      = [];
let editingId = null;

const MENU_KEY   = 'ammask_menu';
const ORDERS_KEY = 'ammask_orders';
let currentFilter = 'All';

// ─── DEFAULT MENU ─────────────────────────────────
const DEFAULT_MENU = [
  // ── Breakfast ──────────────────────────────────
  { id:1,  name:'Idly',             price:30,  category:'Breakfast', emoji:'🫓', img:'assets/idly.png',            desc:'2 soft steamed rice cakes with sambar & coconut chutney' },
  { id:2,  name:'Puttu',            price:45,  category:'Breakfast', emoji:'🥣', img:'assets/puttu.png',           desc:'Steamed rice cake with kadala curry & banana' },
  { id:3,  name:'Poori',            price:40,  category:'Breakfast', emoji:'🥙', img:'assets/poori.png',           desc:'2 puffed deep-fried bread with potato masala' },
  { id:4,  name:'Dosai',            price:35,  category:'Breakfast', emoji:'🥞', img:'assets/dosai.png',           desc:'Golden crispy crepe with sambar & coconut chutney' },
  { id:5,  name:'Egg Dosai',        price:50,  category:'Breakfast', emoji:'🍳', img:'assets/egg_dosai.png',       desc:'Crispy dosai topped with a fresh beaten egg — hearty & filling' },
  { id:14, name:'Masala Dosai',     price:60,  category:'Breakfast', emoji:'🥞', img:'',                           desc:'Crispy rice crepe filled with delicious potato masala' },
  { id:15, name:'Appam with Stew',   price:70,  category:'Breakfast', emoji:'🥞', img:'',                           desc:'Soft-centered laced crepes served with creamy coconut milk vegetable stew' },
  // ── Snacks ─────────────────────────────────────
  { id:6,  name:'Vada',             price:25,  category:'Snacks',    emoji:'🍩', img:'assets/vada.png',            desc:'Crispy medu vada with sambar & coconut chutney' },
  { id:7,  name:'Pazhampuri',       price:30,  category:'Snacks',    emoji:'🍌', img:'assets/pazhampuri.png',      desc:'Kerala banana fritter — golden, crispy & sweet' },
  { id:16, name:'Samosa',           price:15,  category:'Snacks',    emoji:'🔺', img:'assets/samosa.png',          desc:'Crispy golden pastry filled with spiced potatoes and peas' },
  { id:17, name:'Onion Pakoda',     price:30,  category:'Snacks',    emoji:'🧅', img:'',                           desc:'Crispy deep-fried onion fritters with aromatic spices' },
  // ── Fast Food ──────────────────────────────────
  { id:8,  name:'Pizza',            price:180, category:'Fast Food', emoji:'🍕', img:'assets/pizza.png',           desc:'Gourmet pizza with mozzarella, bell peppers, olives & fresh basil' },
  { id:9,  name:'Burger',           price:120, category:'Fast Food', emoji:'🍔', img:'assets/burger.png',          desc:'Juicy beef burger with lettuce, tomato, cheese & caramelized onions' },
  { id:18, name:'Veg Fried Rice',   price:100, category:'Fast Food', emoji:'🍚', img:'assets/fried_rice.png',      desc:'Aromatic rice stir-fried with fresh vegetables and rich spices' },
  { id:19, name:'Paneer Butter Masala', price:140, category:'Fast Food', emoji:'🧀', img:'',                       desc:'Cottage cheese cubes cooked in a rich, creamy tomato and butter gravy' },
  // ── Non-Veg ────────────────────────────────────
  { id:10, name:'Chicken Curry',    price:150, category:'Non-Veg',   emoji:'🍛', img:'assets/chicken_curry.png',   desc:'Rich South Indian chicken curry with coconut milk & aromatic spices' },
  { id:11, name:'Chicken Biryani',  price:180, category:'Non-Veg',   emoji:'🍚', img:'assets/chicken_biryani.png', desc:'Fragrant basmati rice layered with spiced chicken & saffron' },
  { id:12, name:'Fish Fry',         price:130, category:'Non-Veg',   emoji:'🐟', img:'assets/fish_fry.png',        desc:'Crispy whole fish marinated in South Indian masala spices' },
  { id:20, name:'Mutton Biryani',   price:220, category:'Non-Veg',   emoji:'🍚', img:'',                           desc:'Aromatic Basmati rice cooked with tender mutton and authentic spices' },
  // ── Meals ──────────────────────────────────────
  { id:21, name:'South Indian Thali', price:150, category:'Meals',    emoji:'🍛', img:'',                           desc:'Traditional platter with rice, sambar, rasam, curd, kootu, poriyal, appalam & payasam' },
  { id:22, name:'Kerala Meals',     price:140, category:'Meals',    emoji:'🍃', img:'',                           desc:'Traditional Kerala matta rice served with sambar, avial, thoran, pulissery & pickle' },
  // ── Beverages ──────────────────────────────────
  { id:13, name:'Coffee',           price:20,  category:'Beverages', emoji:'☕', img:'assets/coffee.png',          desc:'Traditional South Indian filter coffee' },
  { id:23, name:'Masala Chai',      price:15,  category:'Beverages', emoji:'☕', img:'',                           desc:'Freshly brewed tea with cardamom, ginger, and hot milk' },
];

const MENU_VERSION_KEY = 'ammask_menu_version';
const CURRENT_MENU_VERSION = '2.0';

// ─── INIT ──────────────────────────────────────────
function init() {
  const stored = localStorage.getItem(MENU_KEY);
  const storedVer = localStorage.getItem(MENU_VERSION_KEY);
  
  if (!stored || storedVer !== CURRENT_MENU_VERSION) {
    menuItems = JSON.parse(JSON.stringify(DEFAULT_MENU));
    localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
    localStorage.setItem(MENU_VERSION_KEY, CURRENT_MENU_VERSION);
  } else {
    menuItems = JSON.parse(stored);
  }
  renderMenu();
  renderManageList();
  updateCartUI();
}

// ══════════════════════════════════════════════════
//   MENU RENDERING
// ══════════════════════════════════════════════════
function renderMenu() {
  const grid = document.getElementById('menu-grid');
  const items = currentFilter === 'All'
    ? menuItems
    : menuItems.filter(i => i.category === currentFilter);

  if (items.length === 0) {
    grid.innerHTML = `<p class="no-data" style="grid-column:1/-1">No items in this category.</p>`;
    return;
  }

  grid.innerHTML = items.map(item => {
    const inCart = cart.find(c => c.id === item.id);
    return `
      <div class="menu-card" id="card-${item.id}" onclick="addToCart(${item.id})" role="button" tabindex="0" aria-label="Add ${item.name} to cart">
        <div class="menu-card-img-wrap">
          ${buildImgHtml(item)}
        </div>
        <div class="menu-card-body">
          <div class="menu-card-name">${escHtml(item.name)}</div>
          <div class="menu-card-desc">${escHtml(item.desc || '')}</div>
          <div class="menu-card-footer">
            <span class="menu-card-price">₹${item.price}</span>
            <span class="menu-card-category">${escHtml(item.category)}</span>
          </div>
        </div>
        <div class="add-pill">${inCart ? `In Cart (${inCart.qty})` : '+ Add'}</div>
      </div>`;
  }).join('');

  // Keyboard support
  grid.querySelectorAll('.menu-card').forEach(card => {
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') card.click(); });
  });
}

function buildImgHtml(item) {
  if (item.img) {
    return `<img src="${item.img}" class="menu-card-img" alt="${escHtml(item.name)}"
              onerror="this.style.display='none';this.nextElementSibling.style.display='flex'" loading="lazy" />
            <div class="menu-card-emoji" style="display:none">${item.emoji || '🍽️'}</div>`;
  }
  return `<div class="menu-card-emoji">${item.emoji || '🍽️'}</div>`;
}

function filterCategory(cat) {
  currentFilter = cat;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
  renderMenu();
}

// ══════════════════════════════════════════════════
//   CART
// ══════════════════════════════════════════════════
function addToCart(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;

  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...item, qty: 1 });
  }

  // Flash animation
  const card = document.getElementById(`card-${id}`);
  if (card) {
    card.classList.remove('just-added');
    void card.offsetWidth; // reflow
    card.classList.add('just-added');
    setTimeout(() => card.classList.remove('just-added'), 850);
  }

  // Pop badge
  const badge = document.getElementById('cart-badge');
  badge.classList.remove('pop');
  void badge.offsetWidth;
  badge.classList.add('pop');

  updateCartUI();
  renderMenu(); // refresh add-pill labels

  // Auto-open drawer on first add
  if (cart.length === 1) openCart();
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  updateCartUI();
  renderMenu();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) { removeFromCart(id); return; }
  updateCartUI();
}

function clearCart() {
  if (!cart.length) return;
  if (!confirm('Clear all items from cart?')) return;
  cart = [];
  updateCartUI();
  renderMenu();
}

function updateCartUI() {
  const totalQty  = cart.reduce((s, c) => s + c.qty, 0);
  const itemsEl   = document.getElementById('cart-items');
  const emptyEl   = document.getElementById('cart-empty');
  const footerEl  = document.getElementById('cart-footer');
  const badgeEl   = document.getElementById('cart-badge');

  badgeEl.textContent = totalQty;

  if (!cart.length) {
    itemsEl.innerHTML = '';
    emptyEl.style.display = 'flex';
    footerEl.style.display = 'none';
    return;
  }

  emptyEl.style.display = 'none';
  footerEl.style.display = 'block';

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item-card">
      <div class="ci-thumb">${buildCIThumb(item)}</div>
      <div class="ci-info">
        <div class="ci-name">${escHtml(item.name)}</div>
        <div class="ci-price">₹${(item.price * item.qty).toFixed(2)}</div>
      </div>
      <div class="ci-controls">
        <button class="qty-btn" onclick="changeQty(${item.id},-1)" aria-label="Decrease">−</button>
        <span class="qty-val">${item.qty}</span>
        <button class="qty-btn" onclick="changeQty(${item.id},1)" aria-label="Increase">+</button>
        <button class="remove-btn" onclick="removeFromCart(${item.id})" aria-label="Remove">✕</button>
      </div>
    </div>`).join('');

  updateBillDisplay();
}

function buildCIThumb(item) {
  if (item.img) {
    return `<img src="${item.img}" alt="${escHtml(item.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"
              onerror="this.outerHTML='<span style=\\'font-size:1.4rem\\'>${item.emoji||'🍽️'}</span>'" />`;
  }
  return `<span style="font-size:1.4rem">${item.emoji || '🍽️'}</span>`;
}

function computeBill() {
  const subtotal = cart.reduce((s, c) => s + c.price * c.qty, 0);
  const tax      = 0;
  const total    = subtotal;
  return { subtotal, tax, total };
}

function updateBillDisplay() {
  const { subtotal, tax, total } = computeBill();
  const subtotalEl = document.getElementById('subtotal');
  const taxEl      = document.getElementById('tax');
  const totalEl    = document.getElementById('grand-total');
  
  if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
  if (taxEl)      taxEl.textContent      = `₹${tax.toFixed(2)}`;
  if (totalEl)    totalEl.textContent    = `₹${total.toFixed(2)}`;
}

// ══════════════════════════════════════════════════
//   CART DRAWER
// ══════════════════════════════════════════════════
function toggleCart() {
  const drawer = document.getElementById('cart-drawer');
  drawer.classList.contains('open') ? closeCart() : openCart();
}
function openCart() {
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('cart-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// ══════════════════════════════════════════════════
//   QR PAYMENT
// ══════════════════════════════════════════════════
function showQRModal() {
  if (!cart.length) { toast('🛒 Cart is empty! Add items first.'); return; }
  const { total } = computeBill();
  document.getElementById('qr-amount').textContent = `₹${total.toFixed(2)}`;

  const upi = `upi://pay?pa=ammaskitchen@upi&pn=Amma%27s%20Kitchen&am=${total.toFixed(2)}&cu=INR&tn=Restaurant%20Bill`;
  const canvas = document.getElementById('qr-canvas');

  if (typeof QRCode !== 'undefined') {
    QRCode.toCanvas(canvas, upi, { width: 200, margin: 1, color: { dark:'#1a0800', light:'#ffffff' } },
      err => { if (err) console.warn('QR error:', err); });
  } else {
    canvas.getContext('2d').fillText('QR N/A', 90, 100);
  }

  document.getElementById('qr-modal-overlay').classList.remove('hidden');
  closeCart();
}

function closeQRModal() {
  document.getElementById('qr-modal-overlay').classList.add('hidden');
}

function confirmPayment() {
  const { subtotal, tax, total } = computeBill();
  const order = {
    id:       Date.now(),
    date:     new Date().toISOString(),
    items:    cart.map(c => ({ name:c.name, qty:c.qty, price:c.price })),
    subtotal, tax, total,
    status:  'Paid'
  };
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));

  closeQRModal();
  cart = [];
  updateCartUI();
  renderMenu();
  toast('✅ Payment confirmed! Order saved successfully.');
}

function getOrders() {
  try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); }
  catch { return []; }
}

// ══════════════════════════════════════════════════
//   PRINT BILL
// ══════════════════════════════════════════════════
function printBill() {
  if (!cart.length) { toast('🛒 Cart is empty! Nothing to print.'); return; }

  const { subtotal, tax, total } = computeBill();
  const now    = new Date();
  const dStr   = now.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
  const tStr   = now.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
  const billNo = 'BILL-' + String(now.getTime()).slice(-6);

  const rows = cart.map(c =>
    `<div class="pb-item"><span class="pb-item-name">${escHtml(c.name)} x${c.qty}</span><span>₹${(c.price * c.qty).toFixed(2)}</span></div>`
  ).join('');

  document.getElementById('print-bill').innerHTML = `
    <div class="pb-header">
      <div class="pb-rname">AMMA'S KITCHEN</div>
      <div class="pb-addr">12, Gandhi Nagar, Chennai – 600 001</div>
      <div class="pb-phone">Ph: +91 98765 43210</div>
      <div class="pb-addr">GSTIN: 33ABCDE1234F1Z5</div>
    </div>
    <hr class="pb-sep-bold"/>
    <div class="pb-title">⋆ INVOICE ⋆</div>
    <div class="pb-meta"><span>Bill No: ${billNo}</span><span>${dStr} ${tStr}</span></div>
    <hr class="pb-sep"/>
    <div class="pb-item-header"><span>Item</span><span>Amount</span></div>
    ${rows}
    <hr class="pb-sep-bold"/>
    <div class="pb-tr pb-grand"><span>GRAND TOTAL</span><span>₹${total.toFixed(2)}</span></div>
    <div class="pb-footer">
      <div>— Thank you for your visit! —</div>
      <div>Please come again 🙏</div>
    </div>`;

  setTimeout(() => window.print(), 150);
}

// ══════════════════════════════════════════════════
//   MANAGE MENU (CRUD)
// ══════════════════════════════════════════════════
function renderManageList() {
  const list = document.getElementById('manage-items-list');
  if (!menuItems.length) {
    list.innerHTML = `<p class="no-data">No menu items yet. Add one above!</p>`;
    return;
  }

  list.innerHTML = menuItems.map(item => `
    <div class="manage-item-row" id="mrow-${item.id}">
      <div class="mng-thumb">${buildMngThumb(item)}</div>
      <div class="mng-info">
        <div class="mng-name">${escHtml(item.name)}</div>
        <div class="mng-meta">
          <span>₹${item.price}</span>
          <span>${escHtml(item.category)}</span>
          <span>${item.emoji || ''}</span>
          ${item.desc ? `<span>${escHtml(item.desc.slice(0,45))}…</span>` : ''}
        </div>
      </div>
      <div class="mng-actions">
        <button class="btn-edit" onclick="startEditItem(${item.id})">✏️ Edit</button>
        <button class="btn-delete" onclick="promptDelete(${item.id})">🗑️ Delete</button>
      </div>
    </div>`).join('');
}

function buildMngThumb(item) {
  if (item.img) {
    return `<img src="${item.img}" alt="${escHtml(item.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:8px"
              onerror="this.outerHTML='<span style=\\'font-size:1.5rem\\'>${item.emoji||'🍽️'}</span>'" />`;
  }
  return `<span style="font-size:1.5rem">${item.emoji || '🍽️'}</span>`;
}

function saveMenuItem(e) {
  e.preventDefault();
  const name     = val('f-name').trim();
  const price    = parseFloat(val('f-price'));
  const category = val('f-category');
  const emoji    = val('f-emoji').trim() || '🍽️';
  const desc     = val('f-desc').trim();
  const img      = val('f-img').trim();

  if (!name || isNaN(price) || !category) { toast('⚠️ Please fill all required fields.'); return; }

  if (editingId !== null) {
    const idx = menuItems.findIndex(m => m.id === editingId);
    if (idx !== -1) {
      menuItems[idx] = { ...menuItems[idx], name, price, category, emoji, desc, img: img || menuItems[idx].img };
      toast('✅ Item updated!');
    }
  } else {
    const newId = menuItems.length ? Math.max(...menuItems.map(m => m.id)) + 1 : 1;
    menuItems.push({ id: newId, name, price, category, emoji, desc, img });
    toast('✅ New item added!');
  }

  saveMenuToStorage();
  renderMenu();
  renderManageList();
  cancelEdit();
}

function startEditItem(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  editingId = id;

  setVal('edit-id',     id);
  setVal('f-name',      item.name);
  setVal('f-price',     item.price);
  setVal('f-category',  item.category);
  setVal('f-emoji',     item.emoji || '');
  setVal('f-desc',      item.desc  || '');
  setVal('f-img',       item.img   || '');

  document.getElementById('form-title').textContent      = '✏️ Edit Item';
  document.getElementById('form-submit-btn').textContent  = '💾 Save Changes';
  document.getElementById('form-cancel-btn').style.display = 'inline-flex';
  document.getElementById('item-form').scrollIntoView({ behavior:'smooth', block:'center' });
}

function cancelEdit() {
  editingId = null;
  document.getElementById('item-form').reset();
  setVal('edit-id', '');
  document.getElementById('form-title').textContent       = '➕ Add New Item';
  document.getElementById('form-submit-btn').textContent  = '➕ Add Item';
  document.getElementById('form-cancel-btn').style.display = 'none';
}

let deleteTargetId = null;
function promptDelete(id) {
  const item = menuItems.find(m => m.id === id);
  if (!item) return;
  deleteTargetId = id;
  document.getElementById('delete-modal-text').textContent = `Delete "${item.name}" from the menu? This cannot be undone.`;
  document.getElementById('delete-modal-overlay').classList.remove('hidden');
  document.getElementById('confirm-delete-btn').onclick = () => confirmDelete();
}
function closeDeleteModal() {
  deleteTargetId = null;
  document.getElementById('delete-modal-overlay').classList.add('hidden');
}
function confirmDelete() {
  if (deleteTargetId === null) return;
  menuItems = menuItems.filter(m => m.id !== deleteTargetId);
  cart      = cart.filter(c => c.id !== deleteTargetId);
  saveMenuToStorage();
  renderMenu();
  renderManageList();
  updateCartUI();
  closeDeleteModal();
  toast('🗑️ Item deleted.');
}

function saveMenuToStorage() {
  localStorage.setItem(MENU_KEY, JSON.stringify(menuItems));
}

// ══════════════════════════════════════════════════
//   SALES REPORT
// ══════════════════════════════════════════════════
function renderSalesReport() {
  const orders = getOrders();

  // ── Summary Stats ──
  const totalRev   = orders.reduce((s, o) => s + o.total, 0);
  const totalOrds  = orders.length;
  const avgOrd     = totalOrds > 0 ? totalRev / totalOrds : 0;

  const itemCounts = {};
  orders.forEach(o => o.items.forEach(i => { itemCounts[i.name] = (itemCounts[i.name] || 0) + i.qty; }));
  const topEntry = Object.entries(itemCounts).sort((a,b) => b[1]-a[1])[0];

  document.getElementById('report-stats').innerHTML = `
    <div class="stat-card"><div class="stat-icon">💰</div>
      <div class="stat-value">₹${totalRev.toFixed(0)}</div><div class="stat-label">Total Revenue</div></div>
    <div class="stat-card"><div class="stat-icon">📦</div>
      <div class="stat-value">${totalOrds}</div><div class="stat-label">Total Orders</div></div>
    <div class="stat-card"><div class="stat-icon">🧾</div>
      <div class="stat-value">₹${avgOrd.toFixed(0)}</div><div class="stat-label">Avg Order Value</div></div>
    <div class="stat-card"><div class="stat-icon">⭐</div>
      <div class="stat-value" style="font-size:1rem">${topEntry ? escHtml(topEntry[0]) : '—'}</div>
      <div class="stat-label">Best Seller</div></div>`;

  // ── Monthly Chart ──
  const monthly = {};
  orders.forEach(o => {
    const d   = new Date(o.date);
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const lbl = d.toLocaleDateString('en-IN', { month:'short', year:'numeric' });
    if (!monthly[key]) monthly[key] = { label:lbl, revenue:0, count:0 };
    monthly[key].revenue += o.total;
    monthly[key].count   += 1;
  });

  const months = Object.values(monthly).sort((a,b) => a.label < b.label ? -1 : 1);
  const maxRev = months.length ? Math.max(...months.map(m => m.revenue)) : 0;
  const chartEl = document.getElementById('chart-container');

  if (!months.length) {
    chartEl.innerHTML = `<p class="no-data">No sales data yet. Complete a payment to see data here.</p>`;
  } else {
    chartEl.innerHTML = months.map(m => {
      const h = maxRev > 0 ? Math.max(6, (m.revenue / maxRev) * 170) : 6;
      return `<div class="chart-bar-group">
        <div class="chart-bar-val">₹${m.revenue.toFixed(0)}</div>
        <div class="chart-bar" style="height:${h}px" title="${m.label}: ₹${m.revenue.toFixed(2)} (${m.count} orders)"></div>
        <div class="chart-bar-label">${m.label}<br><small style="color:var(--text-muted)">${m.count} order${m.count!==1?'s':''}</small></div>
      </div>`;
    }).join('');
  }

  // ── Order Table ──
  const tbody = document.getElementById('report-tbody');
  if (!orders.length) {
    tbody.innerHTML = `<tr><td colspan="5" class="no-data">No orders recorded yet.</td></tr>`;
    return;
  }
  const rev = [...orders].reverse();
  tbody.innerHTML = rev.map((o, idx) => {
    const d    = new Date(o.date);
    const dStr = d.toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' });
    const tStr = d.toLocaleTimeString('en-IN', { hour:'2-digit', minute:'2-digit' });
    const its  = o.items.map(i => `${escHtml(i.name)}(${i.qty})`).join(', ');
    return `<tr>
      <td style="color:var(--text-muted)">${rev.length - idx}</td>
      <td>${dStr} ${tStr}</td>
      <td style="max-width:220px;white-space:normal;line-height:1.4">${its}</td>
      <td style="color:var(--gold);font-weight:700">₹${o.total.toFixed(2)}</td>
      <td><span class="status-paid">✓ Paid</span></td>
    </tr>`;
  }).join('');
}

// ══════════════════════════════════════════════════
//   NAVIGATION
// ══════════════════════════════════════════════════
function showSection(section) {
  // Nav highlighting
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const navBtn = document.getElementById(`nav-${section}`);
  if (navBtn) navBtn.classList.add('active');

  // Content visibility
  const hero    = document.getElementById('hero-section');
  const menuC   = document.getElementById('menu-content');
  const manageC = document.getElementById('manage-content');
  const reportC = document.getElementById('report-content');
  const footer  = document.getElementById('main-footer');

  [hero, menuC, manageC, reportC].forEach(el => el.classList.add('hidden'));

  switch (section) {
    case 'menu':
      hero.classList.remove('hidden');
      menuC.classList.remove('hidden');
      break;
    case 'manage':
      manageC.classList.remove('hidden');
      renderManageList();
      break;
    case 'report':
      reportC.classList.remove('hidden');
      renderSalesReport();
      break;
  }

  footer.classList.remove('hidden');
  closeCart();
}

// ══════════════════════════════════════════════════
//   TOAST
// ══════════════════════════════════════════════════
let toastTimer;
function toast(msg) {
  let el = document.getElementById('app-toast');
  if (!el) {
    el = document.createElement('div');
    el.id = 'app-toast';
    el.style.cssText = [
      'position:fixed','bottom:2rem','left:50%','transform:translateX(-50%) translateY(20px)',
      'background:rgba(28,12,0,0.96)','border:1px solid rgba(255,179,71,0.25)',
      'color:#fff8f0','padding:0.7rem 1.5rem','border-radius:50px',
      'font-family:Outfit,sans-serif','font-size:0.88rem','font-weight:500',
      'z-index:600','backdrop-filter:blur(12px)','box-shadow:0 8px 30px rgba(0,0,0,0.5)',
      'transition:opacity 0.3s,transform 0.3s','opacity:0','pointer-events:none','white-space:nowrap'
    ].join(';');
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  el.style.transform = 'translateX(-50%) translateY(0)';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(-50%) translateY(20px)';
  }, 2800);
}

// ══════════════════════════════════════════════════
//   HELPERS
// ══════════════════════════════════════════════════
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}
function val(id)        { return document.getElementById(id).value; }
function setVal(id, v)  { document.getElementById(id).value = v; }

// ── Keyboard shortcuts ─────────────────────────────
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    closeCart();
    closeQRModal();
    closeDeleteModal();
  }
});

// ── Bootstrap ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', init);
