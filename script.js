
const cards = window.BT31_CARDS || [];
const state = JSON.parse(localStorage.getItem("dragondex-state") || "{}");
const wishlist = JSON.parse(localStorage.getItem("dragondex-wishlist") || "{}");

const list = document.querySelector("#cards");
const tpl = document.querySelector("#cardTemplate");
const search = document.querySelector("#search");
const rarityFilter = document.querySelector("#rarityFilter");
const statusFilter = document.querySelector("#statusFilter");

function save(){
  localStorage.setItem("dragondex-state", JSON.stringify(state));
  localStorage.setItem("dragondex-wishlist", JSON.stringify(wishlist));
}
function updateProgress(){
  const owned = cards.filter(c => state[c.number]).length;
  document.querySelector("#ownedCount").textContent = owned;
  document.querySelector("#totalCount").textContent = cards.length;
  const pct = cards.length ? Math.round(owned/cards.length*100) : 0;
  document.querySelector("#progressPercent").textContent = pct + "%";
  document.querySelector("#progressBar").style.width = pct + "%";
}
function matches(card){
  const q = search.value.trim().toLowerCase();
  const hay = [card.number,card.name,card.rarity,card.color,card.type,card.notes].join(" ").toLowerCase();
  if(q && !hay.includes(q)) return false;
  if(rarityFilter.value && card.rarity !== rarityFilter.value) return false;
  if(statusFilter.value==="owned" && !state[card.number]) return false;
  if(statusFilter.value==="missing" && state[card.number]) return false;
  if(statusFilter.value==="wish" && !wishlist[card.number]) return false;
  return true;
}
function render(){
  list.innerHTML="";
  const filtered = cards.filter(matches);
  document.querySelector("#emptyState").hidden = filtered.length>0;

  filtered.forEach(card=>{
    const node = tpl.content.cloneNode(true);
    const article = node.querySelector(".card");
    node.querySelector(".card-number").textContent = card.number;
    node.querySelector(".card-name").textContent = card.name || "שם הקלף טרם אומת";
    const rarity = node.querySelector(".rarity");
    rarity.textContent = card.rarity || "—";
    if(card.rarity) rarity.classList.add("rarity-"+card.rarity);
    node.querySelector(".card-color").textContent = card.color;
    node.querySelector(".card-type").textContent = card.type;
    node.querySelector(".notes").textContent = card.notes;

    const owned = node.querySelector(".owned");
    owned.checked = !!state[card.number];
    article.classList.toggle("owned-card", owned.checked);
    owned.addEventListener("change",()=>{
      state[card.number]=owned.checked;
      article.classList.toggle("owned-card", owned.checked);
      save(); updateProgress();
      if(statusFilter.value) render();
    });

    const wish = node.querySelector(".wish");
    wish.classList.toggle("active", !!wishlist[card.number]);
    wish.textContent = wishlist[card.number] ? "★ Wishlist" : "☆ Wishlist";
    wish.addEventListener("click",()=>{
      wishlist[card.number]=!wishlist[card.number];
      save(); render();
    });
    list.appendChild(node);
  });
}
[search,rarityFilter,statusFilter].forEach(el=>el.addEventListener("input",render));
document.querySelector("#resetBtn").addEventListener("click",()=>{
  if(confirm("לאפס את כל סימוני האוסף וה-Wishlist?")){
    localStorage.removeItem("dragondex-state");
    localStorage.removeItem("dragondex-wishlist");
    Object.keys(state).forEach(k=>delete state[k]);
    Object.keys(wishlist).forEach(k=>delete wishlist[k]);
    updateProgress();render();
  }
});
updateProgress();render();
