/* EcoCycle - plain JavaScript, no dependencies.
   Pure logic lives in EcoCycle.* so it can be unit-tested from the browser console. */
(function () {
  "use strict";

  /* ---------- Sample data (fictional, for demonstration) ---------- */
  var CENTRES = [
    { name: "GreenLoop Collection Hub", area: "Katpadi", address: "12 Gandhi Road, Katpadi", hours: "Mon-Sat 9:00-18:00", accepts: ["batteries", "gadgets", "appliances"], phone: "0416-200-1101" },
    { name: "EcoSafe Battery Point", area: "Sathuvachari", address: "45 Anna Salai, Sathuvachari", hours: "Mon-Fri 10:00-17:00", accepts: ["batteries"], phone: "0416-200-1102" },
    { name: "ReCircuit E-Waste Centre", area: "Gandhi Nagar", address: "8 Main Street, Gandhi Nagar", hours: "Mon-Sat 9:30-19:00", accepts: ["gadgets", "appliances", "screens"], phone: "0416-200-1103" },
    { name: "CleanTech Recyclers", area: "Bagayam", address: "23 Lake View Road, Bagayam", hours: "Tue-Sun 10:00-18:00", accepts: ["screens", "gadgets", "batteries"], phone: "0416-200-1104" },
    { name: "Campus Green Drop Box", area: "Katpadi", address: "Near Main Gate, Technical Campus", hours: "Mon-Sat 8:00-20:00", accepts: ["batteries", "gadgets"], phone: "0416-200-1105" },
    { name: "Heavy Appliance Yard", area: "Sainathapuram", address: "5 Industrial Estate Road", hours: "Mon-Sat 9:00-16:00", accepts: ["appliances"], phone: "0416-200-1106" },
    { name: "Screen & Display Salvage", area: "Gandhi Nagar", address: "17 Market Road, Gandhi Nagar", hours: "Mon-Fri 10:00-18:00", accepts: ["screens"], phone: "0416-200-1107" },
    { name: "Town Hall Collection Day Point", area: "Vellore Fort", address: "Town Hall Premises", hours: "Sat 9:00-13:00", accepts: ["batteries", "gadgets", "screens", "appliances"], phone: "0416-200-1108" }
  ];

  var CATEGORIES = {
    batteries: {
      title: "Batteries", icon: "🔋",
      text: "Lithium and lead-acid batteries can leak or catch fire if they end up in normal garbage.",
      tips: ["Tape the terminals of loose lithium batteries before storing them.", "Never throw swollen or damaged batteries in household waste.", "Store them in a dry, cool container until drop-off."],
      tags: ["Hazardous", "Fire risk"]
    },
    gadgets: {
      title: "Small Gadgets", icon: "📱",
      text: "Phones, chargers, earphones, power banks and other pocket-sized electronics.",
      tips: ["Back up and factory-reset your phone before recycling.", "Remove SIM and memory cards.", "Bundle cables and chargers together."],
      tags: ["Reusable parts", "Data safety"]
    },
    appliances: {
      title: "Large Appliances", icon: "🧺",
      text: "Refrigerators, washing machines, microwaves and other bulky items that need pickup.",
      tips: ["Book a bulk pickup instead of carrying heavy items.", "Do not break open refrigerators; the coolant must be recovered safely.", "Empty and clean the appliance first."],
      tags: ["Bulk pickup", "Coolant gas"]
    },
    screens: {
      title: "Screens & Displays", icon: "🖥️",
      text: "TVs, monitors and laptop screens contain glass and hazardous materials.",
      tips: ["Keep the screen upright and wrapped to avoid cracks.", "Do not remove panels yourself.", "Give the model and size when booking a pickup."],
      tags: ["Fragile", "Hazardous"]
    }
  };

  /* Credit calculator settings */
  var BASE = { smartphone: 400, laptop: 1200, tablet: 600, television: 900, battery: 150, smallappliance: 300, largeappliance: 1500, charger: 50 };
  var CONDITION = { working: 1, damaged: 0.6, dead: 0.3 };

  /* ---------- Pure logic ---------- */
  function ageFactor(age) {
    if (age <= 1) return 1;
    if (age <= 3) return 0.75;
    if (age <= 5) return 0.5;
    if (age <= 10) return 0.3;
    return 0.15;
  }

  /* Returns {ok:true, credits, tier, rupees} or {ok:false, errors:{field:msg}} */
  function calcCredits(type, age, condition, qty) {
    var errors = {};
    if (!BASE.hasOwnProperty(type)) errors.type = "Please choose a gadget type.";
    if (age === "" || age === null || isNaN(Number(age))) errors.age = "Enter the age in years.";
    else if (!Number.isInteger(Number(age))) errors.age = "Age must be a whole number.";
    else if (Number(age) < 0) errors.age = "Age cannot be negative.";
    else if (Number(age) > 30) errors.age = "Age cannot be more than 30 years.";
    if (!CONDITION.hasOwnProperty(condition)) errors.condition = "Please choose a condition.";
    if (qty === "" || qty === null || isNaN(Number(qty))) errors.qty = "Enter the number of items.";
    else if (!Number.isInteger(Number(qty))) errors.qty = "Quantity must be a whole number.";
    else if (Number(qty) < 1) errors.qty = "Quantity must be at least 1.";
    else if (Number(qty) > 50) errors.qty = "Quantity cannot be more than 50.";
    if (Object.keys(errors).length) return { ok: false, errors: errors };

    var credits = Math.round(BASE[type] * ageFactor(Number(age)) * CONDITION[condition] * Number(qty));
    var tier = "None", discount = 0;
    if (credits >= 3000) { tier = "Gold"; discount = 15; }
    else if (credits >= 1500) { tier = "Silver"; discount = 10; }
    else if (credits >= 500) { tier = "Bronze"; discount = 5; }
    return { ok: true, credits: credits, tier: tier, discount: discount, rupees: credits / 10, toNext: credits < 500 ? 500 - credits : 0 };
  }

  var validators = {
    name: function (v) { v = v.trim(); if (!v) return "Name is required."; if (v.length < 2) return "Name must have at least 2 characters."; if (!/^[A-Za-z .'-]+$/.test(v)) return "Name can contain letters only."; return ""; },
    phone: function (v) { v = v.trim(); if (!v) return "Phone number is required."; if (!/^[6-9]\d{9}$/.test(v)) return "Enter a valid 10-digit mobile number starting with 6-9."; return ""; },
    email: function (v) { v = v.trim(); if (!v) return "Email is required."; if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) return "Enter a valid email address."; return ""; },
    address: function (v) { v = v.trim(); if (!v) return "Address is required."; if (v.length < 10) return "Please enter the full address (at least 10 characters)."; return ""; },
    pincode: function (v) { v = v.trim(); if (!v) return "PIN code is required."; if (!/^\d{6}$/.test(v)) return "PIN code must be exactly 6 digits."; return ""; },
    items: function (v) { if (v === "") return "Enter the number of items."; var n = Number(v); if (isNaN(n) || !Number.isInteger(n)) return "Item count must be a whole number."; if (n < 1) return "At least 1 item is required."; if (n > 100) return "Maximum 100 items per pickup."; return ""; },
    slot: function (v) { return v ? "" : "Please choose a time slot."; },
    category: function (v) { return v ? "" : "Please choose an item category."; },
    message: function (v) { v = v.trim(); if (!v) return "Message is required."; if (v.length < 10) return "Message must be at least 10 characters."; return ""; },
    date: function (v, today) {
      if (!v) return "Pickup date is required.";
      var d = new Date(v + "T00:00:00"); if (isNaN(d.getTime())) return "Enter a valid date.";
      var t = today ? new Date(today + "T00:00:00") : new Date(); t.setHours(0, 0, 0, 0);
      if (d <= t) return "Pickup date must be a future date (from tomorrow).";
      var max = new Date(t); max.setDate(max.getDate() + 30);
      if (d > max) return "Pickups can be booked up to 30 days ahead.";
      if (d.getDay() === 0) return "Pickups are not available on Sundays.";
      return "";
    }
  };

  function filterCentres(query, material) {
    var q = (query || "").trim().toLowerCase();
    return CENTRES.filter(function (c) {
      var matchQ = !q || c.name.toLowerCase().indexOf(q) > -1 || c.area.toLowerCase().indexOf(q) > -1 || c.address.toLowerCase().indexOf(q) > -1;
      var matchM = !material || material === "all" || c.accepts.indexOf(material) > -1;
      return matchQ && matchM;
    });
  }

  window.EcoCycle = { calcCredits: calcCredits, validators: validators, filterCentres: filterCentres, CENTRES: CENTRES };

  /* ---------- DOM helpers ---------- */
  function $(s, r) { return (r || document).querySelector(s); }
  function $$(s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); }
  function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]; }); }

  function setError(input, msg) {
    var field = input.closest(".field"); if (!field) return;
    var err = $(".error", field);
    field.classList.toggle("invalid", !!msg);
    input.setAttribute("aria-invalid", msg ? "true" : "false");
    if (err) err.textContent = msg || "";
  }

  /* ---------- Navigation ---------- */
  function initNav() {
    var btn = $(".nav-toggle"), list = $(".nav-links");
    if (!btn || !list) return;
    btn.addEventListener("click", function () {
      var open = list.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  /* ---------- Home: category tabs ---------- */
  function initCategories() {
    var tabs = $("#cat-tabs"), panel = $("#cat-panel");
    if (!tabs || !panel) return;
    Object.keys(CATEGORIES).forEach(function (key, i) {
      var c = CATEGORIES[key], b = document.createElement("button");
      b.className = "tab"; b.type = "button"; b.setAttribute("role", "tab"); b.dataset.key = key;
      b.id = "tab-" + key; b.setAttribute("aria-controls", "cat-panel");
      b.setAttribute("aria-selected", i === 0 ? "true" : "false");
      b.textContent = c.icon + " " + c.title;
      tabs.appendChild(b);
    });
    function show(key) {
      var c = CATEGORIES[key];
      $$(".tab", tabs).forEach(function (t) { t.setAttribute("aria-selected", t.dataset.key === key ? "true" : "false"); });
      panel.setAttribute("aria-labelledby", "tab-" + key);
      panel.innerHTML = "<h3>" + c.icon + " " + esc(c.title) + "</h3><p>" + esc(c.text) + "</p><ul>" +
        c.tips.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul><p>" +
        c.tags.map(function (t) { return '<span class="tag warn">' + esc(t) + "</span>"; }).join("") + "</p>" +
        '<a class="btn green" href="locator.html?material=' + key + '">Find drop-off points</a>';
    }
    tabs.addEventListener("click", function (e) { var b = e.target.closest(".tab"); if (b) show(b.dataset.key); });
    show("batteries");
  }

  /* ---------- Locator ---------- */
  function initLocator() {
    var list = $("#centre-list"); if (!list) return;
    var q = $("#search"), m = $("#material"), count = $("#result-count"), clear = $("#clear-filters");
    var params = new URLSearchParams(location.search);
    if (params.get("material") && CATEGORIES[params.get("material")]) m.value = params.get("material");
    function render() {
      var res = filterCentres(q.value, m.value);
      count.textContent = res.length + (res.length === 1 ? " centre found" : " centres found");
      if (!res.length) { list.innerHTML = '<div class="card empty full">No centres match your search. Try another area or choose "All materials".</div>'; return; }
      list.innerHTML = res.map(function (c) {
        return '<article class="card centre"><h3>' + esc(c.name) + '</h3><div class="meta">📍 ' + esc(c.address) + " (" + esc(c.area) + ')</div><div class="meta">🕒 ' + esc(c.hours) +
          '</div><div class="meta">📞 ' + esc(c.phone) + "</div><div>" +
          c.accepts.map(function (a) { return '<span class="tag">' + esc(CATEGORIES[a].title) + "</span>"; }).join("") + "</div></article>";
      }).join("");
    }
    q.addEventListener("input", render); m.addEventListener("change", render);
    clear.addEventListener("click", function () { q.value = ""; m.value = "all"; render(); q.focus(); });
    render();
  }

  /* ---------- Generic form wiring ---------- */
  function wireForm(form, rules, onValid) {
    function checkField(name) {
      var input = form.elements[name]; if (!input) return "";
      var msg = rules[name](input.value);
      setError(input, msg); return msg;
    }
    Object.keys(rules).forEach(function (name) {
      var input = form.elements[name];
      if (!input) return;
      input.addEventListener("blur", function () { checkField(name); });
      input.addEventListener("input", function () { if (input.closest(".field").classList.contains("invalid")) checkField(name); });
      input.addEventListener("change", function () { checkField(name); });
    });
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var firstBad = null;
      Object.keys(rules).forEach(function (name) { if (checkField(name) && !firstBad) firstBad = form.elements[name]; });
      if (firstBad) { firstBad.focus(); return; }
      onValid();
    });
  }

  function isoDate(d) { var p = function (n) { return (n < 10 ? "0" : "") + n; }; return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()); }

  /* ---------- Pickup booking ---------- */
  function initPickup() {
    var form = $("#pickup-form"); if (!form) return;
    var dateInput = form.elements.date, tomorrow = new Date(); tomorrow.setDate(tomorrow.getDate() + 1);
    var max = new Date(); max.setDate(max.getDate() + 30);
    dateInput.min = isoDate(tomorrow); dateInput.max = isoDate(max);
    wireForm(form, {
      name: validators.name, phone: validators.phone, email: validators.email, address: validators.address, pincode: validators.pincode,
      category: validators.category, items: validators.items, date: function (v) { return validators.date(v); }, slot: validators.slot
    }, function () {
      var ref = "EC-" + Math.floor(100000 + Math.random() * 900000);
      var box = $("#pickup-result");
      box.innerHTML = '<div class="alert success" role="status"><strong>Pickup requested!</strong><br>Reference: <b>' + ref + "</b><br>" + esc(form.elements.name.value.trim()) +
        ", we will collect " + esc(form.elements.items.value) + " item(s) on " + esc(form.elements.date.value) + " (" + esc(form.elements.slot.value) + "). A confirmation will be sent to " + esc(form.elements.email.value.trim()) + ".</div>";
      form.reset(); $$(".field", form).forEach(function (f) { f.classList.remove("invalid"); });
      box.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  /* ---------- Calculator ---------- */
  function initCalculator() {
    var form = $("#calc-form"); if (!form) return;
    var out = $("#calc-result");
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var r = calcCredits(form.elements.type.value, form.elements.age.value, form.elements.condition.value, form.elements.qty.value);
      ["type", "age", "condition", "qty"].forEach(function (n) { setError(form.elements[n], r.ok ? "" : (r.errors[n] || "")); });
      if (!r.ok) { out.innerHTML = '<div class="alert fail" role="alert">Please fix the highlighted fields.</div>'; return; }
      var voucher = r.discount
        ? "<p><strong>" + r.tier + " voucher unlocked:</strong> " + r.discount + "% off at partner eco-stores.</p>"
        : "<p>Not eligible for a voucher yet. Earn <strong>" + r.toNext + "</strong> more credits to reach Bronze (500 credits).</p>";
      out.innerHTML = '<div class="result" role="status"><h3>Your recycling reward</h3><div class="big" id="credit-value">' + r.credits +
        ' credits</div><p>Worth about ₹' + r.rupees.toFixed(2) + " (10 credits = ₹1)</p>" + voucher + "</div>";
    });
    form.addEventListener("reset", function () { out.innerHTML = ""; $$(".field", form).forEach(function (f) { f.classList.remove("invalid"); $(".error", f).textContent = ""; }); });
  }

  /* ---------- About: contact form ---------- */
  function initContact() {
    var form = $("#contact-form"); if (!form) return;
    wireForm(form, { name: validators.name, email: validators.email, message: validators.message }, function () {
      $("#contact-result").innerHTML = '<div class="alert success" role="status">Thank you, ' + esc(form.elements.name.value.trim()) + "! Your message has been received. We will reply within 2 working days.</div>";
      form.reset();
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initNav(); initCategories(); initLocator(); initPickup(); initCalculator(); initContact();
  });
})();
