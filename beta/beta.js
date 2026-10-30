/* ELEVATE Tester Hub: signup goes to Kit (form "ELEVATE Tester Updates"),
   feedback goes to Paul's private dashboard. No trackers, no cookies. */
(function () {
  "use strict";
  var FEEDBACK_URL = "https://elevate-dashboard.sites.tab.bot/api/feedback";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function say(el, text, bad) { el.textContent = text; el.classList.toggle("err", !!bad); }
  function mark(input, bad) { if (bad) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }

  /* ---- Join tester updates ---- */
  var jf = document.getElementById("join-form");
  if (jf) {
    var name = document.getElementById("j-name"), email = document.getElementById("j-email"), phone = document.getElementById("j-phone");
    var row = document.getElementById("j-consent-row"), box = document.getElementById("j-consent"), val = document.getElementById("j-consent-val");
    var jst = jf.querySelector(".status"), jbtn = jf.querySelector("button[type=submit]");
    var syncPhone = function () { var has = phone.value.trim().length > 0; row.hidden = !has; if (!has) box.checked = false; };
    phone.addEventListener("input", syncPhone); syncPhone();

    jf.addEventListener("submit", function (e) {
      e.preventDefault();
      var n = name.value.trim(), em = email.value.trim(), ph = phone.value.trim();
      mark(name, !n); mark(email, !EMAIL_RE.test(em));
      if (!n) { say(jst, "Please add your first name.", true); name.focus(); return; }
      if (!EMAIL_RE.test(em)) { say(jst, "Please check your email address.", true); email.focus(); return; }
      if (ph && !box.checked) { say(jst, "To get texts, tick the box. Or clear the number to get email only.", true); box.focus(); return; }
      if (ph && ph.replace(/\D/g, "").length < 10) { mark(phone, true); say(jst, "That mobile number looks short. Include the area code.", true); phone.focus(); return; }
      mark(phone, false);
      val.value = ph ? "Yes: agreed to occasional texts on " + new Date().toISOString().slice(0, 10) + " via elevatemyprivacy.com/beta" : "";
      if (!ph) phone.value = "";
      jbtn.disabled = true; say(jst, "Joining…");
      fetch(jf.action, { method: "POST", body: new FormData(jf), headers: { Accept: "application/json" } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (x.j && x.j.status === "quarantined" && x.j.url) { say(jst, "One quick check to confirm you're human…"); window.location.href = x.j.url; return; }
          if (x.ok && (!x.j.status || x.j.status === "success")) {
            say(jst, "You're on the list, " + n + "! We'll be in touch when there's something new.");
            jf.reset(); syncPhone();
          } else {
            say(jst, (x.j && x.j.errors && x.j.errors.messages && x.j.errors.messages.join(" ")) || "That didn't go through. Please try again.", true);
          }
        })
        .catch(function () { jf.submit(); })
        .then(function () { jbtn.disabled = false; });
    });
  }

  /* ---- Feedback ---- */
  var ff = document.getElementById("fb-form");
  if (ff) {
    var msg = document.getElementById("f-msg"), fem = document.getElementById("f-email");
    var fst = ff.querySelector(".status"), fbtn = ff.querySelector("button[type=submit]");
    ff.addEventListener("submit", function (e) {
      e.preventDefault();
      var m = msg.value.trim(), em = fem.value.trim();
      mark(msg, m.length < 3); mark(fem, em && !EMAIL_RE.test(em));
      if (m.length < 3) { say(fst, "Please write a few words about what happened.", true); msg.focus(); return; }
      if (em && !EMAIL_RE.test(em)) { say(fst, "That email doesn't look right (or leave it blank).", true); fem.focus(); return; }
      var data = {}; new FormData(ff).forEach(function (v, k) { data[k] = v; });
      fbtn.disabled = true; say(fst, "Sending…");
      fetch(FEEDBACK_URL, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (x.ok && x.j.ok) { say(fst, "Thank you! Paul reads every one."); ff.reset(); }
          else say(fst, (x.j && x.j.error) || "That didn't go through. Please try again.", true);
        })
        .catch(function () { say(fst, "No connection right now. Please try again in a moment.", true); })
        .then(function () { fbtn.disabled = false; });
    });
  }
})();
