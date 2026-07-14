
"use strict";
const dataset = window.DRAGONDEX_DATA;
const cards = dataset.cards || [];
const owned = JSON.parse(localStorage.getItem("dd-owned") || "{}");
const wishlist = JSON.parse(localStorage.getItem("dd-wish") || "{}");
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function save(){localStorage.setItem("dd-owned",JSON.stringify(owned));localStorage.setItem("dd-wish",JSON.stringify(wishlist))}
function setup(){
  const rarities=[...new Set(cards.map(c=>c.rarity).filter(Boolean))].sort();
  $("#rarityFilter").innerHTML='<option value="">כל הנדירויות</option>'+rarities.map(r=>`<option>${r}</option>`).join("");
}
function updateStats(){
  const o=cards.filter(c=>owned[c.id]).length,w=cards.filter(c=>wishlist[c.id]).length,t=cards.length,p=t?Math.round(o/t*100):0;
  $("#ownedCountHome").textContent=o;$("#totalCountHome").textContent=t;$("#ownedCount").textContent=o;$("#totalCount").textContent=t;
  $("#ownedStat").textContent=o;$("#missingStat").textContent=t-o;$("#wishStat").textContent=w;$("#wishCount").textContent=w;$("#progressPercentHome").textContent=p+"%";$("#progressBarHome").style.width=p+"%";
}
function matches(c){
  const q=$("#search").value.trim().toLowerCase(),r=$("#rarityFilter").value,s=$("#statusFilter").value;
  const hay=[c.number,c.name,c.rarity,c.color,c.type,c.variant].join(" ").toLowerCase();
  if(q&&!hay.includes(q))return false;if(r&&c.rarity!==r)return false;if(s==="owned"&&!owned[c.id])return false;if(s==="missing"&&owned[c.id])return false;return true;
}
function buildCard(c){
  const f=$("#cardTemplate").content.cloneNode(true),a=f.querySelector(".card");
  f.querySelector(".card-number").textContent=c.number;f.querySelector(".card-name").textContent=c.name;
  const rr=f.querySelector(".rarity");rr.textContent=c.rarity||"—";if(c.rarity)rr.classList.add("rarity-"+c.rarity);
  f.querySelector(".card-color").textContent=c.color||"";f.querySelector(".card-type").textContent=c.type||"";f.querySelector(".card-variant").textContent=c.variant||"";
  const ob=f.querySelector(".owned");ob.checked=!!owned[c.id];a.classList.toggle("owned-card",ob.checked);ob.onchange=()=>{owned[c.id]=ob.checked;save();renderAll()};
  const wb=f.querySelector(".wish");wb.textContent=wishlist[c.id]?"★ Wishlist":"☆ Wishlist";wb.onclick=()=>{wishlist[c.id]=!wishlist[c.id];save();renderAll()};
  return f;
}
function renderCollection(){const arr=cards.filter(matches);$("#cards").innerHTML="";arr.forEach(c=>$("#cards").appendChild(buildCard(c)));$("#emptyState").hidden=arr.length>0}
function renderWish(){const arr=cards.filter(c=>wishlist[c.id]);$("#wishlistCards").innerHTML="";arr.forEach(c=>$("#wishlistCards").appendChild(buildCard(c)));$("#emptyWishlist").style.display=arr.length?"none":"block"}
function renderAll(){updateStats();renderCollection();renderWish()}
function show(name){$$(".view").forEach(v=>v.classList.remove("active"));$("#"+name+"View").classList.add("active");$$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));scrollTo({top:0,behavior:"smooth"})}
$$(".nav-btn").forEach(b=>b.onclick=()=>show(b.dataset.view));$$("[data-nav]").forEach(b=>b.onclick=()=>show(b.dataset.nav));$("#search").oninput=renderCollection;$("#rarityFilter").onchange=renderCollection;$("#statusFilter").onchange=renderCollection;
$("#resetBtn").onclick=()=>{if(confirm("לאפס את כל הסימונים?")){localStorage.removeItem("dd-owned");localStorage.removeItem("dd-wish");Object.keys(owned).forEach(k=>delete owned[k]);Object.keys(wishlist).forEach(k=>delete wishlist[k]);renderAll();show("home")}};
setup();renderAll();
