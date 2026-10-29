/* =====================================================================
   BETA LINK: the ONE place to change.
   Paste the TestFlight Public Link here (keep the quotes). While it still
   ends in REPLACE_ME, every "Join the free beta" button shows
   "Beta link coming soon" and is disabled, so nothing broken is live.
   ===================================================================== */
const BETA_LINK = "https://testflight.apple.com/join/278jDNac";

(function () {
  var ready = BETA_LINK && BETA_LINK.indexOf("REPLACE_ME") === -1;
  var buttons = document.querySelectorAll("[data-beta-link]");
  for (var i = 0; i < buttons.length; i++) {
    var b = buttons[i];
    if (ready) {
      b.setAttribute("href", BETA_LINK);
      b.removeAttribute("aria-disabled");
      b.classList.remove("is-soon");
      b.textContent = b.getAttribute("data-ready-label") || "Join the free beta";
    } else {
      b.removeAttribute("href");
      b.setAttribute("aria-disabled", "true");
      b.classList.add("is-soon");
      b.textContent = "Beta link coming soon";
    }
  }
  var notes = document.querySelectorAll("[data-beta-note]");
  for (var j = 0; j < notes.length; j++) notes[j].hidden = ready;
})();
