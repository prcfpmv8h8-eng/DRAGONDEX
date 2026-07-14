"use strict";
const dataset = window.DRAGONDEX_DATA;
const cards = dataset.cards || [];
const owned = JSON.parse(localStorage.getItem("dd-owned") || "{}");
const wishlist = JSON.parse(localStorage.getItem("dd-wish") || "{}");
const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function save(){
  localStorage.setItem("dd-owned",JSON.stringify(owned));
  localStorage.setItem("dd-wish",JSON.stringify(wishlist));
}

function setup(){

  const rarityOrder = [
    "EM",
    "EM-GOLD",
    "C",
    "UC",
    "R",
    "SR",
    "SPR",
    "CR",
    "SCR",
    "GDR",
    "SLR"
  ];

  const rarityNames = {
    "EM":"⚡ Energy Marker",
    "EM-GOLD":"🏆 Energy Marker Gold",
    "C":"Common",
    "UC":"Uncommon",
    "R":"Rare",
    "SR":"Super Rare",
    "SPR":"Special Rare",
    "CR":"Concept Rare",
    "SCR":"Secret Rare",
    "GDR":"God Rare",
    "SLR":"Special Leader Rare"
  };

  const rarities = rarityOrder.filter(r =>
      cards.some(c => c.rarity === r)
  );

  $("#rarityFilter").innerHTML =
      '<option value="">כל הנדירויות</option>' +
      rarities.map(r => {

          const count = cards.filter(c => c.rarity === r).length;

          return `<option value="${r}">
              ${rarityNames[r]} (${count})
          </option>`;

      }).join("");

}
}

function updateStats(){
  const o=cards.filter(c=>owned[c.id]).length;
  const w=cards.filter(c=>wishlist[c.id]).length;
  const t=cards.length;
  const p=t?Math.round(o/t*100):0;
  $("#ownedCountHome").textContent=o;
  $("#totalCountHome").textContent=t;
  $("#ownedCount").textContent=o;
  $("#totalCount").textContent=t;
  $("#ownedStat").textContent=o;
  $("#missingStat").textContent=t-o;
  $("#wishStat").textContent=w;
  $("#wishCount").textContent=w;
  $("#progressPercentHome").textContent=p+"%";
  $("#progressBarHome").style.width=p+"%";
}

function matches(c){
  const q=$("#search").value.trim().toLowerCase();
  const r=$("#rarityFilter").value;
  const s=$("#statusFilter").value;
  const hay=[c.number,c.name,c.rarity,c.color,c.type,c.variant].join(" ").toLowerCase();
  if(q&&!hay.includes(q))return false;
  if(r&&c.rarity!==r)return false;
  if(s==="owned"&&!owned[c.id])return false;
  if(s==="missing"&&owned[c.id])return false;
  return true;
}

function buildCard(c){
  const f=$("#cardTemplate").content.cloneNode(true);
  const a=f.querySelector(".card");
  f.querySelector(".card-number").textContent=c.number;
  f.querySelector(".card-name").textContent=c.name;
  const rr=f.querySelector(".rarity");
  rr.textContent=c.rarity||"—";
  if(c.rarity)rr.classList.add("rarity-"+c.rarity);
  f.querySelector(".card-color").textContent=c.color||"";
  f.querySelector(".card-type").textContent=c.type||"";
  f.querySelector(".card-variant").textContent=c.variant||"";
  const ob=f.querySelector(".owned");
  ob.checked=!!owned[c.id];
  a.classList.toggle("owned-card",ob.checked);
  ob.onchange=()=>{owned[c.id]=ob.checked;save();renderAll()};
  const wb=f.querySelector(".wish");
  wb.textContent=wishlist[c.id]?"★ Wishlist":"☆ Wishlist";
  wb.onclick=()=>{wishlist[c.id]=!wishlist[c.id];save();renderAll()};
  return f;
}

function appendGroup(container, title, groupCards, open=true){
  if(!groupCards.length)return;
  const details=document.createElement("details");
  details.className="card-group";
  details.open=open;
  const summary=document.createElement("summary");
  const ownedInGroup=groupCards.filter(c=>owned[c.id]).length;
  summary.innerHTML=`<span>${title}</span><strong>${ownedInGroup}/${groupCards.length}</strong>`;
  const grid=document.createElement("section");
  grid.className="cards grouped-cards";
  groupCards.forEach(c=>grid.appendChild(buildCard(c)));
  details.append(summary,grid);
  container.appendChild(details);
}

function renderCollection(){
  const filtered=cards.filter(matches);
  const container=$("#cards");
  container.innerHTML="";
  const energyRegular=filtered.filter(c=>c.group==="energy_regular");
  const energyGold=filtered.filter(c=>c.group==="energy_gold");
  const main=filtered.filter(c=>c.group==="main");
  appendGroup(container,"⚡ Energy Markers — Regular",energyRegular,true);
  appendGroup(container,"🏆 Energy Markers — Gold Stamped",energyGold,true);
  appendGroup(container,"🃏 Main Set & Variants",main,true);
  $("#emptyState").hidden=filtered.length>0;
}

function renderWish(){
  const arr=cards.filter(c=>wishlist[c.id]);
  const container=$("#wishlistCards");
  container.innerHTML="";
  appendGroup(container,"⚡ Energy Markers — Regular",arr.filter(c=>c.group==="energy_regular"),true);
  appendGroup(container,"🏆 Energy Markers — Gold Stamped",arr.filter(c=>c.group==="energy_gold"),true);
  appendGroup(container,"🃏 Main Set & Variants",arr.filter(c=>c.group==="main"),true);
  $("#emptyWishlist").style.display=arr.length?"none":"block";
}

function renderAll(){updateStats();renderCollection();renderWish()}

function show(name){
  $$(".view").forEach(v=>v.classList.remove("active"));
  $("#"+name+"View").classList.add("active");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  scrollTo({top:0,behavior:"smooth"});
}

$$(".nav-btn").forEach(b=>b.onclick=()=>show(b.dataset.view));
$$("[data-nav]").forEach(b=>b.onclick=()=>show(b.dataset.nav));
$("#search").oninput=renderCollection;
$("#rarityFilter").onchange=renderCollection;
$("#statusFilter").onchange=renderCollection;
$("#resetBtn").onclick=()=>{
  if(confirm("לאפס את כל הסימונים?")){
    localStorage.removeItem("dd-owned");
    localStorage.removeItem("dd-wish");
    Object.keys(owned).forEach(k=>delete owned[k]);
    Object.keys(wishlist).forEach(k=>delete wishlist[k]);
    renderAll();
    show("home");
  }
};
setup();
renderAll();
