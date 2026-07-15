"use strict";
const dataset=window.DRAGONDEX_DATA||{cards:[]};
const cards=dataset.cards||[];
const owned=JSON.parse(localStorage.getItem("dd-owned")||"{}");
const wishlist=JSON.parse(localStorage.getItem("dd-wish")||"{}");
const $=s=>document.querySelector(s), $$=s=>document.querySelectorAll(s);
const rarityOrder=["EM","EM-GOLD","C","UC","R","SR","SPR","CR","SCR","GDR","SLR"];
const rarityNames={"EM":"Energy Marker","EM-GOLD":"Energy Marker Gold","C":"Common","UC":"Uncommon","R":"Rare","SR":"Super Rare","SPR":"Special Rare","CR":"Concept Rare","SCR":"Secret Rare","GDR":"God Rare","SLR":"Special Leader Rare"};
function save(){localStorage.setItem("dd-owned",JSON.stringify(owned));localStorage.setItem("dd-wish",JSON.stringify(wishlist));}

function getCardSides(card){
  let front=card.image||"";
  let back=card.imageBack||"";
  const isBackUrl=url=>/_b\.(png|jpe?g|webp)(?:\?|$)/i.test(url||"");
  const toFront=url=>(url||"").replace(/_b(?=\.(png|jpe?g|webp)(?:\?|$))/i,"");
  const toBack=url=>{
    if(!url||isBackUrl(url))return url||"";
    return url.replace(/(?=\.(png|jpe?g|webp)(?:\?|$))/i,"_b");
  };

  // Protect against older data versions in which Leader front/back were reversed.
  if(isBackUrl(front)&&back&&!isBackUrl(back)){
    [front,back]=[back,front];
  }else if(isBackUrl(front)){
    back=back||front;
    front=toFront(front);
  }

  if(back&&!isBackUrl(back)&&front&&isBackUrl(front)){
    [front,back]=[back,front];
  }

  // Bandai Leader cards use the normal filename for FRONT and `_b` for AWAKEN.
  if(card.type==="LEADER"){
    const tmp=front;
    front=back||tmp;
    back=tmp;
  }

  return {front,back};
}
function setup(){
 const counts={};cards.forEach(c=>{if(c.rarity)counts[c.rarity]=(counts[c.rarity]||0)+1});
 const available=rarityOrder.filter(r=>counts[r]);
 $("#rarityFilter").innerHTML='<option value="">כל הנדירויות</option>'+available.map(r=>`<option value="${r}">${rarityNames[r]} (${counts[r]})</option>`).join("");
 const make=(el,home=false)=>{if(!el)return;const vals=["",...available.filter(r=>!home||["C","UC","R","SR","SPR","SCR","GDR","SLR"].includes(r))];el.innerHTML=vals.map(v=>`<button class="rarity-chip ${v===""?"active":""} rarity-choice-${v||"ALL"}" data-rarity="${v}">${v||"ALL"}</button>`).join("");el.querySelectorAll("button").forEach(b=>b.onclick=()=>{const v=b.dataset.rarity;$("#rarityFilter").value=v;syncRarity(v);show("collection");renderCollection();});};
 make($("#rarityChips"));make($("#homeRarityChips"),true);
}
function syncRarity(v){$$('[data-rarity]').forEach(b=>b.classList.toggle("active",b.dataset.rarity===v));}
function updateStats(){
 const o=cards.filter(c=>owned[c.id]).length,w=cards.filter(c=>wishlist[c.id]).length,t=cards.length,p=t?Math.round(o/t*100):0;
 const set=(id,val)=>{const e=$(id);if(e)e.textContent=val};
 set("#ownedStat",o);set("#missingStat",t-o);set("#wishStat",w);set("#completionStat",p+"%");set("#ownedCount",o);set("#totalCount",t);set("#totalCountHome",t);set("#wishCount",w);set("#progressPercentHome",p+"%");
 const ring=$("#progressRing");if(ring)ring.style.setProperty("--progress",p);
 const mini=$("#completionMiniBar");if(mini)mini.style.width=p+"%";
 renderLatest();renderRarityStats();
}
function matches(c){const q=$("#search").value.trim().toLowerCase(),r=$("#rarityFilter").value,s=$("#statusFilter").value,hay=[c.number,c.name,c.rarity,c.color,c.type,c.variant].join(" ").toLowerCase();return !(q&&!hay.includes(q))&&!(r&&c.rarity!==r)&&!(s==="owned"&&!owned[c.id])&&!(s==="missing"&&owned[c.id]);}
function buildCard(c){
 const f=$("#cardTemplate").content.cloneNode(true),a=f.querySelector(".card");if(c.rarity)a.classList.add("card-rarity-"+c.rarity);
 f.querySelector(".card-number").textContent=c.number;f.querySelector(".card-name").textContent=c.name;
 const img=f.querySelector(".card-image"),ph=f.querySelector(".image-placeholder");
 const sides=getCardSides(c);
 if(sides.front){img.src=sides.front;img.alt=c.name;img.hidden=false;ph.hidden=true;img.onerror=()=>{img.hidden=true;ph.hidden=false};img.onclick=()=>openCardImage(c);}else{img.hidden=true;ph.hidden=false}
 const rr=f.querySelector(".rarity");rr.textContent=c.rarity||"—";if(c.rarity)rr.classList.add("rarity-"+c.rarity);
 f.querySelector(".card-color").textContent=c.color||"";f.querySelector(".card-type").textContent=c.type||"";f.querySelector(".card-variant").textContent=c.variant||"";
 const ob=f.querySelector(".owned");ob.checked=!!owned[c.id];a.classList.toggle("owned-card",ob.checked);ob.onchange=()=>{owned[c.id]=ob.checked;save();renderAll()};
 const wb=f.querySelector(".wish");wb.textContent=wishlist[c.id]?"★ Wishlist":"☆ Wishlist";wb.onclick=()=>{wishlist[c.id]=!wishlist[c.id];save();renderAll()};return f;
}
function appendGroup(container,title,arr,open=true){if(!arr.length)return;const d=document.createElement("details");d.className="card-group";d.open=open;const s=document.createElement("summary");s.innerHTML=`<span>${title}</span><strong>${arr.filter(c=>owned[c.id]).length}/${arr.length}</strong>`;const g=document.createElement("section");g.className="cards grouped-cards";arr.forEach(c=>g.appendChild(buildCard(c)));d.append(s,g);container.appendChild(d);}
function openCardImage(card){
 let m=$("#cardImageModal");if(!m){m=document.createElement("div");m.id="cardImageModal";m.className="image-modal";m.innerHTML=`<div class="image-modal-backdrop"></div><div class="image-modal-panel"><button class="image-modal-close">×</button><h3 class="image-modal-title"></h3><div class="side-tabs"><button class="side-tab active" data-side="front">FRONT</button><button class="side-tab" data-side="back">BACK</button></div><div class="image-modal-images"><img class="image-modal-front" alt=""><img class="image-modal-back" alt="" hidden></div></div>`;document.body.appendChild(m);m.querySelector(".image-modal-close").onclick=()=>m.classList.remove("open");m.querySelector(".image-modal-backdrop").onclick=()=>m.classList.remove("open");}
 m.querySelector(".image-modal-title").textContent=card.name;const front=m.querySelector(".image-modal-front"),back=m.querySelector(".image-modal-back"),tabs=m.querySelectorAll(".side-tab");
 const sides=getCardSides(card);
 front.src=sides.front;front.hidden=false;back.hidden=true;
 const backTab=m.querySelector('[data-side="back"]');backTab.hidden=!sides.back;if(sides.back)back.src=sides.back;
 tabs.forEach(t=>{t.classList.toggle("active",t.dataset.side==="front");t.onclick=()=>{tabs.forEach(x=>x.classList.toggle("active",x===t));front.hidden=t.dataset.side!=="front";back.hidden=t.dataset.side!=="back";}});m.classList.add("open");
}
function renderCollection(){const f=cards.filter(matches),c=$("#cards");c.innerHTML="";appendGroup(c,"⚡ Energy Markers — Regular",f.filter(x=>x.group==="energy_regular"));appendGroup(c,"🏆 Energy Markers — Gold Stamped",f.filter(x=>x.group==="energy_gold"));appendGroup(c,"🃏 Main Set & Variants",f.filter(x=>x.group==="main"));$("#emptyState").hidden=!!f.length;}
function renderWish(){const a=cards.filter(c=>wishlist[c.id]),c=$("#wishlistCards");c.innerHTML="";appendGroup(c,"⚡ Energy Markers — Regular",a.filter(x=>x.group==="energy_regular"));appendGroup(c,"🏆 Energy Markers — Gold Stamped",a.filter(x=>x.group==="energy_gold"));appendGroup(c,"🃏 Main Set & Variants",a.filter(x=>x.group==="main"));$("#emptyWishlist").style.display=a.length?"none":"block";}
function renderLatest(){const c=$("#latestCards");if(!c)return;const selected=cards.filter(x=>owned[x.id]).slice(-5).reverse();const fallback=cards.filter(x=>["SLR","GDR","SCR","SPR","SR"].includes(x.rarity)).slice(0,5);c.innerHTML="";(selected.length?selected:fallback).forEach(card=>{const b=document.createElement("button");const sides=getCardSides(card);b.className="latest-card";b.innerHTML=`<img src="${sides.front}" alt="${card.name}"><span>${card.number}</span><b class="rarity-${card.rarity}">${card.rarity}</b>`;b.onclick=()=>openCardImage(card);c.appendChild(b);});}
function renderRarityStats(){const c=$("#rarityStats");if(!c)return;c.innerHTML=rarityOrder.filter(r=>cards.some(x=>x.rarity===r)).map(r=>{const total=cards.filter(x=>x.rarity===r).length,have=cards.filter(x=>x.rarity===r&&owned[x.id]).length,p=total?Math.round(have/total*100):0;return `<article><div><strong>${r}</strong><span>${rarityNames[r]}</span></div><b>${have}/${total}</b><div class="rarity-progress"><i style="width:${p}%"></i></div></article>`}).join("");}
function renderAll(){updateStats();renderCollection();renderWish();}
function show(name){$$('.view').forEach(v=>v.classList.remove('active'));const target=$("#"+name+"View");if(target)target.classList.add('active');$$('.nav-btn').forEach(b=>b.classList.toggle('active',b.dataset.view===name));scrollTo({top:0,behavior:'smooth'});}
$$('.nav-btn').forEach(b=>b.onclick=()=>show(b.dataset.view));$$('[data-nav]').forEach(b=>b.onclick=()=>{show(b.dataset.nav);if(b.dataset.focusSearch==="true")setTimeout(()=>$("#search")?.focus(),100)});
$("#search").oninput=renderCollection;$("#rarityFilter").onchange=()=>{syncRarity($("#rarityFilter").value);renderCollection()};$("#statusFilter").onchange=renderCollection;
$("#resetBtn").onclick=()=>{if(confirm("לאפס את כל הסימונים?")){Object.keys(owned).forEach(k=>delete owned[k]);Object.keys(wishlist).forEach(k=>delete wishlist[k]);save();renderAll();show("home")}};
setup();renderAll();
