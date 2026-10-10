'use strict';

/* ===== SUPABASE ===== */
var SB_URL = 'https://tjkzksrsalwnlnjirkwz.supabase.co';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqa3prc3JzYWx3bmxuamlya3d6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEzOTgwMjcsImV4cCI6MjEwNjk3NDAyN30.N1UL4xG-CxVg2gKkuN1RzEJdLLZMasNLpeYBrShg3W4';
var WA = '27792645049';
var EMAIL = 'solvexsecure@gmail.com';
var sb = supabase.createClient(SB_URL, SB_KEY);

/* ===== UTILS ===== */
function fmt(n){ return 'R ' + Number(n).toLocaleString('en-ZA'); }
function esc(s){ var d=document.createElement('div'); d.textContent=s==null?'':String(s); return d.innerHTML; }
function toast(msg, type){
  var t=document.getElementById('toast');
  if(!t) return;
  t.textContent=msg; t.className='toast '+(type||''); t.classList.add('show');
  clearTimeout(t._t); t._t=setTimeout(function(){ t.classList.remove('show'); }, 2600);
}
function generateSlug(name){
  return name.toLowerCase().replace(/[^a-z0-9\s-]/g,'').replace(/\s+/g,'-').replace(/-+/g,'-').trim();
}

/* ===== CART ===== */
var cart = [];
try{ cart = JSON.parse(localStorage.getItem('sx_cart') || '[]'); } catch(e){}

function saveCart(){ try{ localStorage.setItem('sx_cart', JSON.stringify(cart)); } catch(e){} }
function cartItem(id){ return cart.find(function(i){ return i.id===id; }); }
function cartSubtotal(){ return cart.reduce(function(s,i){ return s + i.price * i.qty; }, 0); }
function cartTotalQty(){ return cart.reduce(function(s,i){ return s + i.qty; }, 0); }

function addToCart(product, qty){
  qty = Math.max(1, parseInt(qty) || 1);
  var item = cartItem(product.id);
  if(item) item.qty += qty;
  else cart.push({ id:product.id, name:product.name, price:product.price, qty:qty, img:product.image_url||'', slug:product.slug||'' });
  saveCart(); refreshCartUI();
}

function removeFromCart(id){
  cart = cart.filter(function(i){ return i.id !== id; });
  saveCart(); refreshCartUI();
}

function setCartQty(id, qty){
  var item = cartItem(id);
  if(!item) return;
  if(qty <= 0) removeFromCart(id);
  else{ item.qty = qty; saveCart(); refreshCartUI(); }
}

/* ===== CART BADGE ===== */
function updateCartBadge(){
  var b = document.getElementById('cart-badge');
  if(b) b.textContent = cartTotalQty();
}

/* ===== CART DRAWER ===== */
function renderCartDrawer(){
  var body = document.getElementById('cart-body');
  var foot = document.getElementById('cart-foot');
  if(!body) return;

  if(!cart.length){
    body.innerHTML = '<div class="cart-empty">Your cart is empty.</div>';
    if(foot) foot.style.display = 'none';
    return;
  }

  var sub = cartSubtotal();
  body.innerHTML = cart.map(function(i){
    return '<div class="cart-item">' +
      (i.img ? '<img class="cart-item-img" src="'+esc(i.img)+'" alt="">' : '<div class="cart-item-img"></div>') +
      '<div class="cart-item-info">' +
        '<h4><a href="/products/'+esc(i.slug)+'" style="color:inherit">'+esc(i.name)+'</a></h4>' +
        '<div class="item-price">'+fmt(i.price)+' each</div>' +
        '<div class="cart-item-qty">' +
          '<button class="cqty-btn" data-cid="'+i.id+'" data-cd="-1">−</button>' +
          '<span>'+i.qty+'</span>' +
          '<button class="cqty-btn" data-cid="'+i.id+'" data-cd="1">+</button>' +
          '<button class="remove-item" data-rid="'+i.id+'">Remove</button>' +
        '</div>' +
      '</div></div>';
  }).join('');

  body.onclick = function(e){
    var qb = e.target.closest('[data-cid]');
    if(qb){ setCartQty(qb.dataset.cid, (cartItem(qb.dataset.cid)||{qty:0}).qty + parseInt(qb.dataset.cd)); return; }
    var rb = e.target.closest('[data-rid]');
    if(rb) removeFromCart(rb.dataset.rid);
  };

  if(foot){
    foot.style.display = 'block';
    document.getElementById('cart-sub').textContent = fmt(sub);
    document.getElementById('cart-del').textContent = 'TBD';
    document.getElementById('cart-tot').textContent = fmt(sub) + ' + delivery';
  }
}

function refreshCartUI(){
  updateCartBadge();
  renderCartDrawer();
}

function openCart(){
  document.getElementById('cart-drawer').classList.add('open');
  document.getElementById('drawer-overlay').classList.add('open');
}
function closeCart(){
  document.getElementById('cart-drawer').classList.remove('open');
  document.getElementById('drawer-overlay').classList.remove('open');
}

/* ===== ENQUIRY MODALS ===== */
function initEnquiryModals(){
  var ov = document.getElementById('ov');
  if(!ov) return;
  var mwa = document.getElementById('m-wa');
  var mem = document.getElementById('m-em');
  var defMsg = "Hi, I'd like to enquire about a solar or surveillance solution.";
  if(document.getElementById('wa-go')) document.getElementById('wa-go').href = 'https://wa.me/'+WA+'?text='+encodeURIComponent(defMsg);
  if(document.getElementById('em-go')) document.getElementById('em-go').href = 'mailto:'+EMAIL+'?subject=Solvex+enquiry&body='+encodeURIComponent(defMsg);
  function closeModals(){ ov.classList.remove('open'); if(mwa) mwa.classList.remove('open'); if(mem) mem.classList.remove('open'); }
  document.querySelectorAll('[data-m]').forEach(function(b){
    b.addEventListener('click', function(){ ov.classList.add('open'); document.getElementById('m-'+b.dataset.m).classList.add('open'); });
  });
  document.querySelectorAll('[data-x]').forEach(function(b){ b.addEventListener('click', closeModals); });
  ov.addEventListener('click', closeModals);
  document.addEventListener('keydown', function(e){ if(e.key==='Escape') closeModals(); });
}

/* ===== INIT CART DRAWER ===== */
function initCartDrawer(){
  var overlay = document.getElementById('drawer-overlay');
  if(overlay) overlay.addEventListener('click', closeCart);
  updateCartBadge();
  renderCartDrawer();
}
