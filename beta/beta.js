/* ELEVATE Tester Hub: optional build-update email signup goes to Kit (form "ELEVATE Tester Updates"),
   feedback goes to Paul's private dashboard. No trackers, no cookies. */
(function () {
  "use strict";
  var FEEDBACK_URL = "https://elevate-dashboard.sites.tab.bot/api/feedback";
  var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function say(el, text, bad) { el.textContent = text; el.classList.toggle("err", !!bad); }
  function mark(input, bad) { if (bad) input.setAttribute("aria-invalid", "true"); else input.removeAttribute("aria-invalid"); }

  /* ---- New build emails (optional; Kit form "ELEVATE Tester Updates", double opt-in) ---- */
  var jf = document.getElementById("join-form");
  if (jf) {
    var email = document.getElementById("j-email");
    var jst = jf.querySelector(".status"), jbtn = jf.querySelector("button[type=submit]");
    if (/[?&]confirmed=1/.test(location.search)) { var c = document.getElementById("j-confirmed"); if (c) { c.hidden = false; document.getElementById("updates").scrollIntoView(); } }

    jf.addEventListener("submit", function (e) {
      e.preventDefault();
      var em = email.value.trim();
      mark(email, !EMAIL_RE.test(em));
      if (!EMAIL_RE.test(em)) { say(jst, em ? "Please check your email address." : "Add your email to get build updates. (Totally optional.)", true); email.focus(); return; }
      jbtn.disabled = true; say(jst, "Signing you up…");
      fetch(jf.action, { method: "POST", body: new FormData(jf), headers: { Accept: "application/json" } })
        .then(function (r) { return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, j: j }; }); })
        .then(function (x) {
          if (x.j && x.j.status === "quarantined" && x.j.url) { say(jst, "One quick check to confirm you're human…"); window.location.href = x.j.url; return; }
          if (x.ok && (!x.j.status || x.j.status === "success")) {
            say(jst, "Almost done: check your inbox and tap the confirm link in the email.");
            jf.reset();
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
