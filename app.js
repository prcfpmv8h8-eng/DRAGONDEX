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
  const rarityOrder=["EM","EM-GOLD","C","UC","R","SR","SPR","CR","SCR","GDR","SLR"];
  const rarityNames={
    "EM":"⚡ Energy Marker",
    "EM-GOLD":"🏆 Energy Marker Gold",
    "C":"Common","UC":"Uncommon","R":"Rare","SR":"Super Rare",
    "SPR":"Special Rare","CR":"Concept Rare","SCR":"Secret Rare",
    "GDR":"God Rare","SLR":"Special Leader Rare"
  };
  const counts={};
  cards.forEach(card=>{
    if(card.rarity){
      counts[card.rarity]=(counts[card.rarity]||0)+1;
    }
  });
  const options=rarityOrder
    .filter(r=>counts[r])
    .map(r=>`<option value="${r}">${rarityNames[r]} (${counts[r]})</option>`)
    .join("");
  $("#rarityFilter").innerHTML='<option value="">כל הנדירויות</option>'+options;
  const chips=$("#rarityChips");
  if(chips){
    const values=["",...rarityOrder.filter(r=>counts[r])];
    chips.innerHTML=values.map(v=>`<button class="rarity-chip ${v===""?"active":""}" data-rarity="${v}">${v||"ALL"}</button>`).join("");
    chips.querySelectorAll(".rarity-chip").forEach(button=>{
      button.onclick=()=>{
        $("#rarityFilter").value=button.dataset.rarity;
        chips.querySelectorAll(".rarity-chip").forEach(b=>b.classList.remove("active"));
        button.classList.add("active");
        renderCollection();
      };
    });
  }
}

function updateStats(){
  const o=cards.filter(c=>owned[c.id]).length;
  const w=cards.filter(c=>wishlist[c.id]).length;
  const t=cards.length;
  const p=t?Math.round(o/t*100):0;
  const ownedHome=$("#ownedCountHome"); if(ownedHome) ownedHome.textContent=o;
  $("#totalCountHome").textContent=t;
  $("#ownedCount").textContent=o;
  $("#totalCount").textContent=t;
  $("#ownedStat").textContent=o;
  $("#missingStat").textContent=t-o;
  $("#wishStat").textContent=w;
  $("#wishCount").textContent=w;
  $("#progressPercentHome").textContent=p+"%";
  const cs=$("#completionStat"); if(cs) cs.textContent=p+"%";
  const progressBarHome=$("#progressBarHome"); if(progressBarHome) progressBarHome.style.width=p+"%";
  const ring=$("#progressRing");
  if(ring) ring.style.setProperty("--progress",p);
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
  if(c.rarity) a.classList.add("card-rarity-"+c.rarity);
  f.querySelector(".card-number").textContent=c.number;
  f.querySelector(".card-name").textContent=c.name;
  const image=f.querySelector(".card-image");
  const placeholder=f.querySelector(".image-placeholder");
  if(c.image){
    image.src=c.image;
    image.alt=c.name;
    image.hidden=false;
    placeholder.hidden=true;
    image.onerror=()=>{
      image.hidden=true;
      placeholder.hidden=false;
    };
    image.onclick=()=>openCardImage(c);
  }else{
    image.hidden=true;
    placeholder.hidden=false;
  }
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


function openCardImage(card){
  let modal=$("#cardImageModal");
  if(!modal){
    modal=document.createElement("div");
    modal.id="cardImageModal";
    modal.className="image-modal";
    modal.innerHTML=`
      <div class="image-modal-backdrop"></div>
      <div class="image-modal-panel">
        <button class="image-modal-close" aria-label="סגירה">×</button>
        <h3 class="image-modal-title"></h3>
        <div class="image-modal-images">
          <img class="image-modal-front" alt="">
          <img class="image-modal-back" alt="" hidden>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.querySelector(".image-modal-close").onclick=()=>modal.classList.remove("open");
    modal.querySelector(".image-modal-backdrop").onclick=()=>modal.classList.remove("open");
  }
  modal.querySelector(".image-modal-title").textContent=card.name;
  const front=modal.querySelector(".image-modal-front");
  const back=modal.querySelector(".image-modal-back");
  front.src=card.image;
  front.alt=card.name;
  if(card.imageBack){
    back.src=card.imageBack;
    back.alt=card.name+" — Back";
    back.hidden=false;
  }else{
    back.hidden=true;
    back.removeAttribute("src");
  }
  modal.classList.add("open");
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

function renderLatest(){
  const box=$("#latestCards"); if(!box)return;
  const arr=cards.filter(c=>owned[c.id]).slice(-8).reverse();
  const fallback=cards.filter(c=>["SLR","GDR","SCR","SPR","SR"].includes(c.rarity)).slice(0,8);
  box.innerHTML=(arr.length?arr:fallback).map(c=>`<button class="latest-card" data-card-id="${c.id}"><img src="${c.image||""}" alt="${c.name}"><footer><span>${c.number}</span><b>${c.rarity||""}</b></footer></button>`).join("");
  box.querySelectorAll(".latest-card").forEach(el=>el.onclick=()=>openCardImage(cards.find(c=>c.id===el.dataset.cardId)));
}
function renderStatistics(){
  const box=$("#rarityStats"); if(!box)return;
  const order=["EM","EM-GOLD","C","UC","R","SR","SPR","CR","SCR","GDR","SLR"];
  box.innerHTML=order.map(r=>{const total=cards.filter(c=>c.rarity===r).length;if(!total)return"";const have=cards.filter(c=>c.rarity===r&&owned[c.id]).length;const pct=Math.round(have/total*100);return `<article class="rarity-stat"><header><strong>${r}</strong><span>${have}/${total} • ${pct}%</span></header><div class="bar"><div style="width:${pct}%"></div></div></article>`}).join("");
}
function renderAll(){updateStats();renderCollection();renderWish();renderLatest();renderStatistics()}

function show(name){
  $$(".view").forEach(v=>v.classList.remove("active"));
  $("#"+name+"View").classList.add("active");
  $$(".nav-btn").forEach(b=>b.classList.toggle("active",b.dataset.view===name));
  scrollTo({top:0,behavior:"smooth"});
}

$$(".nav-btn").forEach(b=>b.onclick=()=>show(b.dataset.view));
$$("[data-nav]").forEach(b=>b.onclick=()=>{
  show(b.dataset.nav);
  if(b.dataset.focusSearch==="true") setTimeout(()=>$("#search")?.focus(),120);
});
$("#search").oninput=renderCollection;
$("#rarityFilter").onchange=()=>{
  const chips=$("#rarityChips");
  if(chips) chips.querySelectorAll(".rarity-chip").forEach(b=>b.classList.toggle("active",b.dataset.rarity===$("#rarityFilter").value));
  renderCollection();
};
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
window.addEventListener("load",()=>setTimeout(()=>document.body.classList.add("app-ready"),650));
setup();
const homeChips=$("#homeRarityChips");
if(homeChips){
  const vals=["","C","UC","R","SR","SPR","SCR","GDR","SLR"];
  homeChips.innerHTML=vals.map(v=>`<button class="rarity-chip ${v===""?"active":""}" data-home-rarity="${v}">${v||"ALL"}</button>`).join("");
  homeChips.querySelectorAll("button").forEach(b=>b.onclick=()=>{
    $("#rarityFilter").value=b.dataset.homeRarity;
    show("collection");renderCollection();
  });
}
renderAll();
