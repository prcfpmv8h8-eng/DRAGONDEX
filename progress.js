
"use strict";
(() => {
  const $ = (s) => document.querySelector(s);

  function refreshPremiumProgress() {
    const cards = (window.DRAGONDEX_DATA && window.DRAGONDEX_DATA.cards) || [];
    let owned = {};
    try { owned = JSON.parse(localStorage.getItem("dd-owned") || "{}"); } catch (_) {}

    const total = cards.length;
    const have = cards.reduce((sum, card) => sum + (owned[card.id] ? 1 : 0), 0);
    const percent = total ? Math.round((have / total) * 100) : 0;

    const track = $("#progressRing");
    const bar = $("#progressBarHome");
    const percentText = $("#progressPercentHome");
    const ownedText = $("#ownedCountHome");
    const totalText = $("#totalCountHome");

    if (track) track.style.setProperty("--progress", String(percent));
    if (bar) bar.style.width = percent + "%";
    if (percentText) percentText.textContent = percent + "%";
    if (ownedText) ownedText.textContent = String(have);
    if (totalText) totalText.textContent = String(total);
  }

  document.addEventListener("DOMContentLoaded", refreshPremiumProgress);
  window.addEventListener("storage", refreshPremiumProgress);
  document.addEventListener("change", () => setTimeout(refreshPremiumProgress, 0));
  document.addEventListener("click", () => setTimeout(refreshPremiumProgress, 20));

  const observer = new MutationObserver(refreshPremiumProgress);
  const startObserver = () => {
    const target = $("#ownedStat") || document.body;
    observer.observe(target, { childList: true, subtree: true, characterData: true });
    refreshPremiumProgress();
  };
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startObserver);
  } else {
    startObserver();
  }
})();
