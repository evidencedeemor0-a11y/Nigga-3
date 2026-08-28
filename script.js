/* ==========================================================
   Plum Updated — app logic
   Fictional demo data only. Persists via localStorage.
========================================================== */
(function () {
  "use strict";

  const STORAGE_KEY = "plumUpdated.state.v1";
  const PENDING_DURATION_MS = 10000; // exactly 10 seconds, no visible countdown

  const defaultState = () => ({
    user: { name: "Esther", fullName: "Esther Adaeze", email: "esther.adaeze@plumupdated.demo", initials: "E" },
    settings: { chimeFont: false, paypalFont: false, darkTheme: false, pin: null },
    balances: { spending: 22.83, savings: 20.55 },
    cards: [],
    transactions: [
      { id: "TXN000010021", type: "out", name: "Netflix", bank: "Subscription", account: "**** 4471", amount: 15.99, status: "completed", date: daysAgoISO(1) },
      { id: "TXN000010020", type: "in", name: "Payroll Deposit", bank: "Direct Deposit", account: "**** 0099", amount: 450.00, status: "completed", date: daysAgoISO(2) },
      { id: "TXN000010019", type: "out", name: "Uber", bank: "Ride", account: "**** 7723", amount: 12.40, status: "completed", date: daysAgoISO(4) }
    ]
  });

  function daysAgoISO(n){
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d.toISOString();
  }

  function loadState(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultState();
      const parsed = JSON.parse(raw);
      if (!parsed.balances || !parsed.transactions) return defaultState();
      if (!parsed.settings) parsed.settings = {};
      if (typeof parsed.settings.chimeFont !== "boolean") parsed.settings.chimeFont = false;
      if (typeof parsed.settings.paypalFont !== "boolean") parsed.settings.paypalFont = false;
      if (typeof parsed.settings.darkTheme !== "boolean") parsed.settings.darkTheme = false;
      if (typeof parsed.settings.pin === "undefined") parsed.settings.pin = null;
      if (!Array.isArray(parsed.cards)) parsed.cards = [];
      return parsed;
    }catch(e){
      return defaultState();
    }
  }

  function saveState(){
    try{
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }catch(e){ /* storage unavailable — continue silently */ }
  }

  let state = loadState();

  // ---------- helpers ----------
  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const fmtMoney = (n) => "$" + Number(n).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  const fmtDate = (iso) => {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" }) +
      " at " + d.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  };
  const fmtShortDate = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    const diffDays = Math.floor((today - d) / 86400000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  };
  function genTxnId(){
    return "TXN" + Math.floor(100000000 + Math.random() * 899999999);
  }
  function maskAccount(num){
    const digits = (num || "").replace(/\D/g, "");
    if (digits.length <= 4) return "**** " + digits;
    return "**** " + digits.slice(-4);
  }

  // ---------- render ----------
  function renderBalances(){
    $("#spendingBalance").textContent = fmtMoney(state.balances.spending);
    $("#savingsBalance").textContent = fmtMoney(state.balances.savings);
  }

  function renderProfile(){
    $("#userName").textContent = state.user.name;
    $("#userAvatar").textContent = state.user.initials;
    $("#profileAvatar").textContent = state.user.initials;
    $("#profileName").textContent = state.user.fullName;
    $("#profileEmail").textContent = state.user.email;
  }

  function applyFontPref(){
    const chimeOn = !!(state.settings && state.settings.chimeFont);
    const paypalOn = !!(state.settings && state.settings.paypalFont);
    document.body.classList.toggle("font-chime", chimeOn);
    document.body.classList.toggle("font-paypal", paypalOn);

    const chimeSw = $("#btnFontToggle");
    if (chimeSw){
      chimeSw.classList.toggle("is-on", chimeOn);
      chimeSw.setAttribute("aria-checked", chimeOn ? "true" : "false");
    }
    const chimeLabel = $("#fontToggleLabel");
    if (chimeLabel) chimeLabel.textContent = chimeOn ? "Chime" : "Default";

    const paypalSw = $("#btnPaypalToggle");
    if (paypalSw){
      paypalSw.classList.toggle("is-on", paypalOn);
      paypalSw.setAttribute("aria-checked", paypalOn ? "true" : "false");
    }
    const paypalLabel = $("#paypalToggleLabel");
    if (paypalLabel) paypalLabel.textContent = paypalOn ? "PayPal" : "Default";
  }

  function applyThemePref(){
    const on = !!(state.settings && state.settings.darkTheme);
    document.body.classList.toggle("theme-dark", on);
    const sw = $("#btnDarkToggle");
    if (sw){
      sw.classList.toggle("is-on", on);
      sw.setAttribute("aria-checked", on ? "true" : "false");
    }
    const label = $("#darkToggleLabel");
    if (label) label.textContent = on ? "On" : "Off";
  }

  function renderPinRowStatus(){
    const row = $("#pinRowStatus");
    if (!row) return;
    row.textContent = (state.settings && state.settings.pin) ? "Tap to change your PIN" : "Not set up — tap to create";
  }

  const ICON_PENDING = '<svg viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8.3" stroke="currentColor" stroke-width="1.7"/><path d="M12 7.6V12l3 1.8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_IN = '<svg viewBox="0 0 24 24" fill="none"><path d="M17 7 7 17M7 17V9M7 17h8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_OUT = '<svg viewBox="0 0 24 24" fill="none"><path d="M7 17 17 7M17 7v8M17 7H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function txIcon(tx){
    if (tx.status === "pending") return ICON_PENDING;
    return tx.type === "in" ? ICON_IN : ICON_OUT;
  }

  function renderTxItem(tx){
    const isOut = tx.type === "out";
    const sign = isOut ? "-" : "+";
    const amtClass = isOut ? "tx-item__amount--neg" : "tx-item__amount--pos";
    const iconClass = isOut ? "tx-item__icon--out" : "tx-item__icon--in";
    const statusClass = tx.status === "completed" ? "tx-item__status--completed" : "tx-item__status--pending";
    return `
      <div class="tx-item">
        <div class="tx-item__icon ${iconClass}">${txIcon(tx)}</div>
        <div class="tx-item__body">
          <p class="tx-item__name">${escapeHtml(tx.name)}</p>
          <p class="tx-item__meta">${escapeHtml(tx.bank)} · ${fmtShortDate(tx.date)}</p>
        </div>
        <div class="tx-item__right">
          <div class="tx-item__amount ${amtClass}">${sign}${fmtMoney(tx.amount)}</div>
          <span class="tx-item__status ${statusClass}">${tx.status}</span>
        </div>
      </div>`;
  }

  function escapeHtml(str){
    const div = document.createElement("div");
    div.textContent = str == null ? "" : String(str);
    return div.innerHTML;
  }

  function renderActivity(filter){
    filter = filter || "all";
    const list = $("#activityList");
    let items = state.transactions.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
    if (filter === "completed") items = items.filter(t => t.status === "completed");
    if (filter === "pending") items = items.filter(t => t.status === "pending");
    if (!items.length){
      list.innerHTML = `<div class="tx-empty">No transactions to show yet.</div>`;
      return;
    }
    list.innerHTML = items.map(renderTxItem).join("");
  }

  let currentAccountDetail = "spending";
  function renderAccountDetail(which){
    currentAccountDetail = which;
    const title = which === "savings" ? "Savings Account" : "Spending Account";
    $("#acctDetailTitle").textContent = title;
    $("#acctDetailBalance").textContent = fmtMoney(state.balances[which]);
    const list = $("#acctDetailList");
    // Spending account shows all transfer-out/in activity; savings shows none yet (demo).
    let items = state.transactions.slice().sort((a,b) => new Date(b.date) - new Date(a.date));
    if (which === "savings") items = [];
    if (!items.length){
      list.innerHTML = `<div class="tx-empty">No transactions on this account yet.</div>`;
      return;
    }
    list.innerHTML = items.map(renderTxItem).join("");
  }

  // ---------- navigation ----------
  const screens = $$(".screen");
  let currentScreenId = "screen-home";

  function showScreen(id, opts){
    opts = opts || {};
    const next = document.getElementById(id);
    const prev = document.getElementById(currentScreenId);
    if (!next || next.id === currentScreenId) return;
    if (prev) prev.classList.remove("is-active");
    next.classList.add("is-active");
    currentScreenId = id;
    next.scrollTop = 0;

    syncBottomNav(id);
  }

  const NAV_SCREEN_MAP = {
    "screen-home": "home",
    "screen-cards": "cards",
    "screen-activity": "activity"
  };

  function syncBottomNav(screenId){
    const tab = NAV_SCREEN_MAP[screenId];
    const nav = $("#bottomNav");
    // Only the three top-level tab screens (Home, Cards, Activity) get the
    // floating nav bar. Every other screen (send, review, pending, success,
    // deposit flow, card-add, account detail, profile, etc.) is a focused
    // sub-flow reached via a back/cancel button, so the nav stays hidden
    // until the user lands back on a main tab — i.e. until the transfer or
    // deposit is actually done.
    if (nav) nav.classList.toggle("bottom-nav--hidden", !tab);
    $$(".nav-item").forEach(btn => {
      btn.classList.toggle("is-active", !!tab && btn.dataset.tab === tab);
    });
    moveNavIndicator(tab);
  }

  let navIndicatorPositioned = false;
  function moveNavIndicator(tab){
    const indicator = $("#navIndicator");
    const nav = $("#bottomNav");
    if (!indicator || !nav) return;
    const btn = tab && nav.querySelector('.nav-item[data-tab="' + tab + '"]');
    if (!btn){
      indicator.style.opacity = "0";
      return;
    }
    const icon = btn.querySelector("svg");
    const navRect = nav.getBoundingClientRect();
    const iconRect = (icon || btn).getBoundingClientRect();
    const cx = iconRect.left + iconRect.width / 2 - navRect.left;
    const cy = iconRect.top + iconRect.height / 2 - navRect.top;
    if (!navIndicatorPositioned) indicator.style.transition = "none";
    indicator.style.opacity = "1";
    indicator.style.transform = `translate(${cx}px, ${cy}px) translate(-50%, -50%)`;
    if (!navIndicatorPositioned){
      void indicator.offsetWidth; // force reflow so the transition removal takes effect next frame
      indicator.style.transition = "";
      navIndicatorPositioned = true;
    }
  }

  let navResizeTimer = null;
  window.addEventListener("resize", () => {
    clearTimeout(navResizeTimer);
    navResizeTimer = setTimeout(() => {
      const activeBtn = document.querySelector(".nav-item.is-active");
      moveNavIndicator(activeBtn ? activeBtn.dataset.tab : null);
    }, 80);
  });

  // ---------- toast ----------
  let toastTimer = null;
  function showToast(msg, isError){
    const t = $("#toast");
    t.textContent = msg;
    t.classList.toggle("is-error", !!isError);
    t.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("is-visible"), 2600);
  }

  // ---------- more sheet ----------
  const sheet = $("#moreSheet");
  const sheetOverlay = $("#sheetOverlay");
  function openSheet(){
    sheet.classList.add("is-open");
    sheetOverlay.classList.add("is-open");
  }
  function closeSheet(){
    sheet.classList.remove("is-open");
    sheetOverlay.classList.remove("is-open");
  }
  sheetOverlay.addEventListener("click", closeSheet);
  $$("[data-close-sheet]").forEach(btn => btn.addEventListener("click", closeSheet));

  // ---------- quick actions / more sheet actions ----------
  function handleQuickAction(action){
    closeSheet();
    if (action === "transfer" || action === "send"){
      resetSendForm();
      showScreen("screen-send");
    } else if (action === "deposit"){
      showScreen("screen-deposit-method");
    } else if (action === "more"){
      openSheet();
    }
  }

  $$(".quick-action").forEach(btn => {
    btn.addEventListener("click", () => handleQuickAction(btn.dataset.action));
  });
  $$(".sheet__item[data-action]").forEach(btn => {
    btn.addEventListener("click", () => handleQuickAction(btn.dataset.action));
  });

  // ---------- avatar -> profile ----------
  const btnProfile = $("#btnProfile");
  if (btnProfile){
    btnProfile.addEventListener("click", () => showScreen("screen-profile"));
    btnProfile.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " "){
        e.preventDefault();
        showScreen("screen-profile");
      }
    });
  }

  // ---------- app font toggles (mutually exclusive) ----------
  const btnFontToggle = $("#btnFontToggle");
  if (btnFontToggle){
    btnFontToggle.addEventListener("click", () => {
      state.settings = state.settings || {};
      state.settings.chimeFont = !state.settings.chimeFont;
      if (state.settings.chimeFont) state.settings.paypalFont = false;
      saveState();
      applyFontPref();
      showToast(state.settings.chimeFont ? "Chime-style font enabled." : "Default font restored.");
    });
  }
  const btnPaypalToggle = $("#btnPaypalToggle");
  if (btnPaypalToggle){
    btnPaypalToggle.addEventListener("click", () => {
      state.settings = state.settings || {};
      state.settings.paypalFont = !state.settings.paypalFont;
      if (state.settings.paypalFont) state.settings.chimeFont = false;
      saveState();
      applyFontPref();
      showToast(state.settings.paypalFont ? "PayPal-style font enabled." : "Default font restored.");
    });
  }

  // ---------- dark theme toggle ----------
  const btnDarkToggle = $("#btnDarkToggle");
  if (btnDarkToggle){
    btnDarkToggle.addEventListener("click", () => {
      state.settings = state.settings || {};
      state.settings.darkTheme = !state.settings.darkTheme;
      saveState();
      applyThemePref();
      showToast(state.settings.darkTheme ? "Dark theme enabled." : "Light theme restored.");
    });
  }

  // ---------- back / cancel buttons ----------
  $$("[data-back]").forEach(btn => {
    btn.addEventListener("click", () => showScreen("screen-" + btn.dataset.back));
  });

  // ---------- bottom nav ----------
  $$(".nav-item").forEach(btn => {
    btn.addEventListener("click", () => {
      const tab = btn.dataset.tab;
      if (tab === "home") showScreen("screen-home");
      else if (tab === "cards") { renderCards(); showScreen("screen-cards"); }
      else if (tab === "activity") { renderActivity(currentActivityFilter); showScreen("screen-activity"); }
      else if (tab === "profile") showScreen("screen-profile");
    });
  });

  // ---------- account cards ----------
  $$(".account-card").forEach(card => {
    card.addEventListener("click", () => {
      const which = card.dataset.account;
      renderAccountDetail(which);
      showScreen("screen-account-detail");
    });
  });

  // ---------- activity filter ----------
  let currentActivityFilter = "all";
  $("#activityFilter").addEventListener("click", (e) => {
    const btn = e.target.closest(".segmented__btn");
    if (!btn) return;
    $$(".segmented__btn", $("#activityFilter")).forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    currentActivityFilter = btn.dataset.filter;
    renderActivity(currentActivityFilter);
  });

  $("#btnViewTx").addEventListener("click", () => {
    renderActivity("all");
    currentActivityFilter = "all";
    $$(".segmented__btn", $("#activityFilter")).forEach(b => b.classList.toggle("is-active", b.dataset.filter === "all"));
    showScreen("screen-activity");
  });

  // ---------- SEND MONEY FORM ----------
  const sendForm = $("#sendForm");
  const fieldName = $("#recipName");
  const fieldBank = $("#recipBank");
  const fieldAccount = $("#recipAccount");
  const fieldAmount = $("#sendAmount");

  function resetSendForm(){
    sendForm.reset();
    clearFieldErrors();
  }

  function clearFieldErrors(){
    ["recipName","recipBank","recipAccount","sendAmount"].forEach(id => {
      const err = $("#err-" + id);
      if (err) err.textContent = "";
      const field = document.getElementById(id);
      if (field && field.closest(".field")) field.closest(".field").classList.remove("field--invalid");
    });
  }

  function setFieldError(id, message){
    const err = $("#err-" + id);
    if (err) err.textContent = message;
    const field = document.getElementById(id);
    if (field && field.closest(".field")) field.closest(".field").classList.add("field--invalid");
  }

  // restrict amount input to numeric decimal
  fieldAmount.addEventListener("input", () => {
    fieldAmount.value = fieldAmount.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  });
  fieldAccount.addEventListener("input", () => {
    fieldAccount.value = fieldAccount.value.replace(/[^0-9]/g, "");
  });

  let txFlow = null; // generalized flow config, shared by "send money" and "deposit"

  $("#btnContinue").addEventListener("click", () => {
    clearFieldErrors();
    let valid = true;

    const name = fieldName.value.trim();
    const bank = fieldBank.value;
    const account = fieldAccount.value.trim();
    const amount = parseFloat(fieldAmount.value);

    if (!name){
      setFieldError("recipName", "Enter the recipient's name.");
      valid = false;
    }
    if (!bank){
      setFieldError("recipBank", "Select a bank.");
      valid = false;
    }
    if (!account || account.length < 4){
      setFieldError("recipAccount", "Enter a valid account number.");
      valid = false;
    }
    if (!amount || amount <= 0 || isNaN(amount)){
      setFieldError("sendAmount", "Enter an amount greater than $0.00.");
      valid = false;
    } else if (amount > state.balances.spending){
      setFieldError("sendAmount", `Insufficient funds. Available balance is ${fmtMoney(state.balances.spending)}.`);
      valid = false;
    }

    if (!valid) return;

    const accountMasked = maskAccount(account);
    startReviewFlow({
      kind: "send",
      reviewTitle: "Review transfer",
      reviewSub: "Please review the details before sending",
      confirmLabel: "Send money",
      legalText: `By tapping "Send money", you authorize this transfer and agree to our Terms of Service.`,
      row1Label: "Account name", row1Value: name,
      row2Label: "Bank", row2Value: bank,
      row3Label: "Account number", row3Value: accountMasked,
      whenLabel: "Send on", whenValue: "Now",
      amount: amount,
      etaValue: "Within a few minutes",
      pendingTitle: "Sending your money",
      pendingSub: `${fmtMoney(amount)} has been sent and is being processed.`,
      successTitle: "Your transfer was successful!",
      successSub: `${fmtMoney(amount)} has been sent successfully.`,
      txnType: "out", txnName: name, txnBank: bank, txnAccount: accountMasked
    });
  });

  // ---------- generalized review / pending / success flow ----------
  function startReviewFlow(cfg){
    txFlow = cfg;
    fillReviewGeneric(cfg);
    showScreen("screen-review");
  }

  function fillReviewGeneric(cfg){
    $("#flowReviewTitle").textContent = cfg.reviewTitle;
    $("#flowReviewSub").textContent = cfg.reviewSub;
    $("#rvNameLabel").textContent = cfg.row1Label;
    $("#rvName").textContent = cfg.row1Value;
    $("#rvBankLabel").textContent = cfg.row2Label;
    $("#rvBank").textContent = cfg.row2Value;
    $("#rvAccountLabel").textContent = cfg.row3Label;
    $("#rvAccount").textContent = cfg.row3Value;
    $("#rvAmount").textContent = fmtMoney(cfg.amount);
    $("#rvTotal").textContent = fmtMoney(cfg.amount);
    $("#rvWhenLabel").textContent = cfg.whenLabel;
    $("#rvWhenValue").textContent = cfg.whenValue;
    $("#btnSendMoney").textContent = cfg.confirmLabel;
    $("#reviewLegalText").textContent = cfg.legalText;
    const backTarget = cfg.kind === "deposit" ? "deposit-amount" : "send";
    $("#reviewBackBtn").dataset.back = backTarget;
    $("#reviewCancelBtn").dataset.back = backTarget;
  }

  // ---------- REVIEW -> PIN -> PENDING -> SUCCESS ----------
  $("#btnSendMoney").addEventListener("click", () => {
    if (!txFlow) return;

    // Double-check funds at confirm time for outgoing transfers (in case of race/edits)
    if (txFlow.txnType === "out" && txFlow.amount > state.balances.spending){
      showToast("Insufficient funds for this transfer.", true);
      showScreen("screen-send");
      return;
    }

    const mode = (state.settings && state.settings.pin) ? "verify" : "setup";
    openPinFlow(mode, () => {
      executeTxFlow();
    });
  });

  function executeTxFlow(){
    const cfg = txFlow;
    const txn = {
      id: genTxnId(),
      type: cfg.txnType,
      name: cfg.txnName,
      bank: cfg.txnBank,
      account: cfg.txnAccount,
      amount: cfg.amount,
      status: "pending",
      date: new Date().toISOString()
    };

    // Apply balance change immediately, add pending transaction, persist
    if (cfg.txnType === "out"){
      state.balances.spending = +(state.balances.spending - txn.amount).toFixed(2);
    } else {
      state.balances.spending = +(state.balances.spending + txn.amount).toFixed(2);
    }
    state.transactions.unshift(txn);
    saveState();
    renderBalances();

    fillStatusScreens(cfg, txn);
    showScreen("screen-pending");
    runPendingAnimation(txn);
  }

  function fillStatusScreens(cfg, txn){
    // Pending screen
    $("#pendingTitle").textContent = cfg.pendingTitle;
    $("#pendingSub").textContent = cfg.pendingSub;
    $("#pdNameLabel").textContent = cfg.row1Label;
    $("#pdName").textContent = txn.name;
    $("#pdBankLabel").textContent = cfg.row2Label;
    $("#pdBank").textContent = txn.bank;
    $("#pdAccountLabel").textContent = cfg.row3Label;
    $("#pdAccount").textContent = txn.account;
    $("#pdAmount").textContent = fmtMoney(txn.amount);
    $("#pdTotal").textContent = fmtMoney(txn.amount);
    $("#pdEta").textContent = cfg.etaValue;
    $("#pdTxn").textContent = txn.id;

    // Success screen
    $("#successTitle").textContent = cfg.successTitle;
    $("#successSub").textContent = cfg.successSub;
    $("#scNameLabel").textContent = cfg.row1Label;
    $("#scName").textContent = txn.name;
    $("#scBankLabel").textContent = cfg.row2Label;
    $("#scBank").textContent = txn.bank;
    $("#scAccountLabel").textContent = cfg.row3Label;
    $("#scAccount").textContent = txn.account;
    $("#scAmount").textContent = fmtMoney(txn.amount);
    $("#scTotal").textContent = fmtMoney(txn.amount);
    $("#scDate").textContent = fmtDate(txn.date);
    $("#scTxn").textContent = txn.id;
  }

  const pendingStageMessages = [
    "Verifying transfer details…",
    "Processing your payment…",
    "Confirming with the bank…"
  ];

  function runPendingAnimation(txn){
    const steps = $$(".pending-step", $("#pendingSteps"));
    const sub = $("#pendingSub");
    steps.forEach(s => s.classList.remove("is-active", "is-done"));

    const stageCount = steps.length || 3;
    const stageDuration = PENDING_DURATION_MS / stageCount;
    let currentStage = -1;

    function enterStage(i){
      if (i > 0 && steps[i - 1]) steps[i - 1].classList.remove("is-active");
      if (i > 0 && steps[i - 1]) steps[i - 1].classList.add("is-done");
      if (steps[i]){
        steps[i].classList.add("is-active");
        sub.textContent = pendingStageMessages[i] || pendingStageMessages[pendingStageMessages.length - 1];
      }
      currentStage = i;
    }

    enterStage(0);
    const stageTimer = setInterval(() => {
      if (currentStage < stageCount - 1){
        enterStage(currentStage + 1);
      }
    }, stageDuration);

    setTimeout(() => {
      clearInterval(stageTimer);
      if (steps[stageCount - 1]) steps[stageCount - 1].classList.remove("is-active");
      if (steps[stageCount - 1]) steps[stageCount - 1].classList.add("is-done");
      completeTransfer(txn);
    }, PENDING_DURATION_MS);
  }

  function completeTransfer(txn){
    // Mark transaction completed, persist
    const found = state.transactions.find(t => t.id === txn.id);
    if (found) found.status = "completed";
    saveState();

    // reset checkmark animation by re-cloning the path element
    const check = $("#checkPath");
    if (check){
      const clone = check.cloneNode(true);
      check.parentNode.replaceChild(clone, check);
      clone.id = "checkPath";
    }

    showScreen("screen-success");
  }

  $("#btnDone").addEventListener("click", () => {
    txFlow = null;
    renderBalances();
    showScreen("screen-home");
  });

  // ---------- CARD helpers ----------
  const CARD_GRADIENTS = ["indigo", "sunset", "teal", "slate"];
  function detectNetwork(digits){
    const first = digits.charAt(0);
    if (first === "4") return { network: "Vantage", gradient: "indigo" };
    if (first === "5") return { network: "Meridian", gradient: "sunset" };
    if (first === "3") return { network: "Halo", gradient: "teal" };
    return { network: "Plum Card", gradient: "slate" };
  }
  function formatCardNumberInput(v){
    const digits = v.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(.{4})/g, "$1 ").trim();
  }
  function formatExpiryInput(v){
    let digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return digits.slice(0, 2) + "/" + digits.slice(2);
    return digits;
  }
  function maskedCardNumber(last4){
    return "•••• •••• •••• " + last4;
  }

  function renderCard3d(card, extraClass){
    return `
      <div class="card3d card3d--${card.gradient} ${extraClass || ""}">
        <div class="card3d__inner">
          <div class="card3d__sheen"></div>
          <div class="card3d__top">
            <svg class="card3d__chip" viewBox="0 0 34 24" fill="none"><rect x="0.5" y="0.5" width="33" height="23" rx="4" fill="url(#chipGrad2)" stroke="rgba(0,0,0,0.25)"/><path d="M0.5 8h33M0.5 16h33M12 0.5v23M22 0.5v23" stroke="rgba(0,0,0,0.25)" stroke-width="0.6"/><defs><linearGradient id="chipGrad2" x1="0" y1="0" x2="34" y2="24"><stop offset="0" stop-color="#f4e4b0"/><stop offset="1" stop-color="#cba75a"/></linearGradient></defs></svg>
            <span class="card3d__network">${escapeHtml(card.network)}</span>
          </div>
          <div class="card3d__number">${maskedCardNumber(card.last4)}</div>
          <div class="card3d__bottom">
            <div class="card3d__field">
              <span class="card3d__field-label">Card holder</span>
              <span class="card3d__holder">${escapeHtml(card.holder)}</span>
            </div>
            <div class="card3d__field card3d__field--right">
              <span class="card3d__field-label">Expires</span>
              <span class="card3d__expiry">${escapeHtml(card.expiry)}</span>
            </div>
          </div>
        </div>
      </div>`;
  }

  // Subtle pointer-driven 3D tilt for any .card3d element inside a container.
  function enableCardTilt(container){
    $$(".card3d", container).forEach(card => {
      function onMove(e){
        const rect = card.getBoundingClientRect();
        const px = ((e.clientX - rect.left) / rect.width) - 0.5;
        const py = ((e.clientY - rect.top) / rect.height) - 0.5;
        card.style.transform = `rotateY(${px * 16}deg) rotateX(${py * -16}deg) scale(1.015)`;
      }
      function onLeave(){
        card.style.transform = "rotateY(0deg) rotateX(0deg) scale(1)";
      }
      card.addEventListener("pointermove", onMove);
      card.addEventListener("pointerleave", onLeave);
      card.addEventListener("pointerup", onLeave);
      card.addEventListener("pointercancel", onLeave);
    });
  }

  function renderCards(){
    const stage = $("#card3dStage");
    const list = $("#cardList");
    if (!state.cards.length){
      stage.innerHTML = `<div class="card3d-empty">No cards linked yet. Link a card to enable instant deposits.</div>`;
      list.innerHTML = "";
      return;
    }
    stage.innerHTML = renderCard3d(state.cards[0]);
    enableCardTilt(stage);

    list.innerHTML = state.cards.map((c, i) => `
      <div class="card-row" data-card-id="${c.id}">
        <div class="card-row__chip" style="background:linear-gradient(135deg, var(--plum-blue), var(--plum-blue-dark))"></div>
        <div class="card-row__text">
          <strong>${escapeHtml(c.network)} •••• ${c.last4} ${i === 0 ? '<span class="default-pill">Default</span>' : ""}</strong>
          <span>${escapeHtml(c.holder)} · Expires ${c.expiry}</span>
        </div>
        ${i === 0 ? "" : `<button class="card-row__action card-row__action--set" data-set-default="${c.id}">Set default</button>`}
        <button class="card-row__action card-row__action--danger" data-delete-card="${c.id}" aria-label="Delete card">
          <svg viewBox="0 0 24 24" fill="none"><path d="M4 7h16M9 7V5a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2m-9 0 1 13a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1l1-13" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </button>
      </div>`).join("");
  }

  const cardListEl = $("#cardList");
  cardListEl.addEventListener("click", (e) => {
    const setBtn = e.target.closest("[data-set-default]");
    const delBtn = e.target.closest("[data-delete-card]");
    if (setBtn){
      const id = setBtn.dataset.setDefault;
      const idx = state.cards.findIndex(c => c.id === id);
      if (idx > 0){
        const [card] = state.cards.splice(idx, 1);
        state.cards.unshift(card);
        saveState();
        renderCards();
        showToast("Default card updated.");
      }
    } else if (delBtn){
      const id = delBtn.dataset.deleteCard;
      if (confirm("Remove this card? You'll need to re-link it to use it again.")){
        state.cards = state.cards.filter(c => c.id !== id);
        saveState();
        renderCards();
        showToast("Card removed.");
      }
    }
  });

  $("#btnAddCard").addEventListener("click", () => {
    cardAddReturnTo = "screen-cards";
    resetCardAddForm();
    showScreen("screen-card-add");
  });

  // ---------- CARD ADD FORM ----------
  let cardAddReturnTo = "screen-cards";
  const cardNumberField = $("#cardNumber");
  const cardExpiryField = $("#cardExpiry");
  const cardCvvField = $("#cardCvv");
  const cardHolderField = $("#cardHolder");
  const previewCard3d = $("#previewCard3d");

  function resetCardAddForm(){
    $("#cardAddForm").reset();
    ["cardNumber", "cardExpiry", "cardHolder"].forEach(id => {
      const err = $("#err-" + id);
      if (err) err.textContent = "";
    });
    updateCardPreview();
  }

  function updateCardPreview(){
    const digits = cardNumberField.value.replace(/\D/g, "");
    const info = detectNetwork(digits);
    previewCard3d.className = "card3d card3d--" + info.gradient;
    $("#previewNetwork").textContent = digits ? info.network : "CARD";

    // Live digits grouped, padding anything not yet typed with dots for a realistic feel
    const grouped = (digits + "•".repeat(Math.max(0, 16 - digits.length))).slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    $("#previewNumber").textContent = digits ? grouped : "•••• •••• •••• ••••";

    $("#previewHolder").textContent = cardHolderField.value.trim() ? cardHolderField.value.trim().toUpperCase() : "YOUR NAME";
    $("#previewExpiry").textContent = cardExpiryField.value || "MM/YY";
  }

  cardNumberField.addEventListener("input", () => {
    cardNumberField.value = formatCardNumberInput(cardNumberField.value);
    updateCardPreview();
  });
  cardExpiryField.addEventListener("input", () => {
    cardExpiryField.value = formatExpiryInput(cardExpiryField.value);
    updateCardPreview();
  });
  cardCvvField.addEventListener("input", () => {
    cardCvvField.value = cardCvvField.value.replace(/\D/g, "").slice(0, 4);
  });
  cardHolderField.addEventListener("input", updateCardPreview);

  enableCardTilt(document);

  $("#btnCardAddSave").addEventListener("click", () => {
    ["cardNumber", "cardExpiry", "cardHolder"].forEach(id => {
      const err = $("#err-" + id);
      if (err) err.textContent = "";
    });
    let valid = true;
    const digits = cardNumberField.value.replace(/\D/g, "");
    const expiry = cardExpiryField.value.trim();
    const cvv = cardCvvField.value.trim();
    const holder = cardHolderField.value.trim();

    if (digits.length < 13){
      $("#err-cardNumber").textContent = "Enter a valid card number.";
      valid = false;
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry) || !cvv || cvv.length < 3){
      $("#err-cardExpiry").textContent = "Enter a valid expiry date and CVV.";
      valid = false;
    }
    if (!holder){
      $("#err-cardHolder").textContent = "Enter the name on the card.";
      valid = false;
    }
    if (!valid) return;

    const info = detectNetwork(digits);
    const card = {
      id: "card_" + Date.now(),
      network: info.network,
      gradient: info.gradient,
      last4: digits.slice(-4),
      expiry: expiry,
      holder: holder.toUpperCase()
    };
    state.cards.unshift(card);
    saveState();
    showToast("Card linked successfully.");

    const returnTo = cardAddReturnTo;
    cardAddReturnTo = "screen-cards";
    if (returnTo === "screen-deposit-amount"){
      renderCards();
      enterDepositAmount("card");
    } else {
      renderCards();
      showScreen("screen-cards");
    }
  });

  // ---------- DEPOSIT FLOW ----------
  let depositKind = "card"; // 'card' | 'merchant'
  const merchantCode = "PLM-" + Math.floor(10000 + Math.random() * 89999);
  const depositAmountField = $("#depositAmount");

  $("#merchantCode").textContent = merchantCode;

  depositAmountField.addEventListener("input", () => {
    depositAmountField.value = depositAmountField.value.replace(/[^0-9.]/g, "").replace(/(\..*)\./g, "$1");
  });

  $("#btnDepositCard").addEventListener("click", () => {
    if (!state.cards.length){
      cardAddReturnTo = "screen-deposit-amount";
      resetCardAddForm();
      showScreen("screen-card-add");
    } else {
      enterDepositAmount("card");
    }
  });

  $("#btnDepositMerchant").addEventListener("click", () => {
    showScreen("screen-deposit-merchant");
  });

  $("#btnMerchantSimulate").addEventListener("click", () => {
    enterDepositAmount("merchant");
  });

  function enterDepositAmount(kind){
    depositKind = kind;
    depositAmountField.value = "";
    $("#err-depositAmount").textContent = "";
    $("#depositInfoText").textContent = kind === "card"
      ? "Card deposits are typically available in your Spending account within minutes."
      : "Cash deposits are usually available within a few hours after the merchant confirms your payment.";
    renderDepositSourceRow();
    showScreen("screen-deposit-amount");
  }

  function renderDepositSourceRow(){
    const row = $("#depositSourceRow");
    if (depositKind === "merchant"){
      row.innerHTML = `
        <div class="deposit-source">
          <span class="deposit-source__icon">🏪</span>
          <div class="deposit-source__text">
            <strong>Cash deposit</strong>
            <span>Merchant code ${merchantCode}</span>
          </div>
        </div>`;
    } else {
      const card = state.cards[0];
      if (!card){
        row.innerHTML = `<button class="deposit-source--empty" id="btnDepositAddCardInline">+ Link a card to continue</button>`;
        const inlineBtn = $("#btnDepositAddCardInline");
        if (inlineBtn) inlineBtn.addEventListener("click", () => {
          cardAddReturnTo = "screen-deposit-amount";
          resetCardAddForm();
          showScreen("screen-card-add");
        });
      } else {
        row.innerHTML = `
          <div class="deposit-source">
            <span class="deposit-source__chip" style="background:linear-gradient(135deg, var(--plum-blue), var(--plum-blue-dark))"></span>
            <div class="deposit-source__text">
              <strong>${escapeHtml(card.network)} •••• ${card.last4}</strong>
              <span>Expires ${card.expiry}</span>
            </div>
            <a class="deposit-source__manage" id="btnDepositManage">Manage</a>
          </div>`;
        const manageLink = $("#btnDepositManage");
        if (manageLink) manageLink.addEventListener("click", () => { renderCards(); showScreen("screen-cards"); });
      }
    }
  }

  $("#btnDepositContinue").addEventListener("click", () => {
    $("#err-depositAmount").textContent = "";
    const amount = parseFloat(depositAmountField.value);
    if (!amount || amount <= 0 || isNaN(amount)){
      $("#err-depositAmount").textContent = "Enter an amount greater than $0.00.";
      return;
    }
    if (depositKind === "card" && !state.cards.length){
      showToast("Link a card first.", true);
      return;
    }

    const card = state.cards[0];
    const sourceLabel = depositKind === "card" ? `${card.network} •••• ${card.last4}` : "Cash deposit";

    startReviewFlow({
      kind: "deposit",
      reviewTitle: "Review deposit",
      reviewSub: "Please review the details before adding money",
      confirmLabel: "Add money",
      legalText: `By tapping "Add money", you authorize this deposit into your Spending account.`,
      row1Label: depositKind === "card" ? "Card" : "Method",
      row1Value: sourceLabel,
      row2Label: "Depositing to",
      row2Value: "Spending Account",
      row3Label: depositKind === "card" ? "Card expiry" : "Merchant code",
      row3Value: depositKind === "card" ? card.expiry : merchantCode,
      whenLabel: "Arrives",
      whenValue: depositKind === "card" ? "Instantly" : "Within a few hours",
      amount: amount,
      etaValue: depositKind === "card" ? "Instantly" : "Within a few hours",
      pendingTitle: "Adding your money",
      pendingSub: `${fmtMoney(amount)} is being added to your Spending account.`,
      successTitle: "Your deposit was successful!",
      successSub: `${fmtMoney(amount)} has been added to your Spending account.`,
      txnType: "in",
      txnName: depositKind === "card" ? "Card deposit" : "Merchant cash deposit",
      txnBank: depositKind === "card" ? sourceLabel : "Merchant deposit",
      txnAccount: depositKind === "card" ? ("**** " + card.last4) : merchantCode
    });
  });

  // ---------- Transaction PIN (profile row) ----------
  const btnTransactionPin = $("#btnTransactionPin");
  if (btnTransactionPin){
    btnTransactionPin.addEventListener("click", () => {
      const mode = (state.settings && state.settings.pin) ? "change" : "setup";
      openPinFlow(mode, () => {
        renderPinRowStatus();
        showToast(mode === "change" ? "Your PIN has been updated." : "Your PIN has been created.");
      });
    });
  }

  // ---------- PIN modal: entry, keyboard-avoidance, verification ----------
  const PIN_FLOWS = {
    setup: [
      { key: "new1", title: "Create your PIN", sub: "Choose a 4-digit PIN to confirm transfers." },
      { key: "new2", title: "Confirm your PIN", sub: "Re-enter your new PIN to confirm." }
    ],
    verify: [
      { key: "verify", title: "Enter your PIN", sub: "Enter your 4-digit PIN to confirm this transfer." }
    ],
    change: [
      { key: "old", title: "Enter current PIN", sub: "Confirm your current PIN to continue." },
      { key: "new1", title: "Create a new PIN", sub: "Choose a new 4-digit PIN." },
      { key: "new2", title: "Confirm new PIN", sub: "Re-enter your new PIN to confirm." }
    ]
  };

  const pinOverlay = $("#pinOverlay");
  const pinModal = $("#pinModal");
  const pinDotsWrap = $("#pinDots");
  const pinDots = $$(".pin-dot", pinDotsWrap);
  const pinTitle = $("#pinModalTitle");
  const pinSub = $("#pinModalSub");
  const pinError = $("#pinModalError");
  const pinHiddenInput = $("#pinHiddenInput");
  const pinCloseBtn = $("#pinModalClose");

  let pinFlowSteps = [];
  let pinStepIndex = 0;
  let pinTempNew = null;
  let pinOnSuccess = null;
  let pinModalOpen = false;
  let pinBusy = false; // true briefly while validating / after success, to ignore stray input

  function openPinFlow(mode, onSuccess){
    pinFlowSteps = PIN_FLOWS[mode] || PIN_FLOWS.verify;
    pinStepIndex = 0;
    pinTempNew = null;
    pinOnSuccess = onSuccess || null;
    pinBusy = false;
    renderPinStep();
    pinHiddenInput.value = "";
    pinError.textContent = "";
    pinOverlay.classList.add("is-open");
    pinModal.classList.add("is-open");
    pinModalOpen = true;
    // Focus within the same user gesture so mobile browsers open the keyboard.
    setTimeout(() => { pinHiddenInput.focus(); }, 50);
  }

  function closePinFlow(){
    pinModalOpen = false;
    pinHiddenInput.blur();
    pinOverlay.classList.remove("is-open");
    pinModal.classList.remove("is-open");
    pinModal.style.bottom = "";
    pinHiddenInput.value = "";
    updatePinDots("");
  }

  function renderPinStep(){
    const step = pinFlowSteps[pinStepIndex];
    if (!step) return;
    pinTitle.textContent = step.title;
    pinSub.textContent = step.sub;
    pinError.textContent = "";
    pinHiddenInput.value = "";
    updatePinDots("");
  }

  function updatePinDots(value){
    pinDots.forEach((dot, i) => dot.classList.toggle("is-filled", i < value.length));
  }

  function shakePinDots(message){
    pinError.textContent = message || "Incorrect PIN. Try again.";
    pinDotsWrap.classList.remove("is-shake");
    void pinDotsWrap.offsetWidth; // restart animation
    pinDotsWrap.classList.add("is-shake");
    pinHiddenInput.value = "";
    updatePinDots("");
  }

  pinHiddenInput.addEventListener("input", () => {
    if (pinBusy) return;
    const digits = pinHiddenInput.value.replace(/\D/g, "").slice(0, 4);
    pinHiddenInput.value = digits;
    updatePinDots(digits);
    if (digits.length === 4) handlePinComplete(digits);
  });

  function handlePinComplete(value){
    pinBusy = true;
    const step = pinFlowSteps[pinStepIndex];

    const advanceOrFinish = () => {
      if (pinStepIndex < pinFlowSteps.length - 1){
        pinStepIndex += 1;
        pinBusy = false;
        renderPinStep();
      } else {
        finishPinFlow();
      }
    };

    if (step.key === "old"){
      if (value !== state.settings.pin){
        shakePinDots("That's not your current PIN.");
        pinBusy = false;
        return;
      }
      advanceOrFinish();
    } else if (step.key === "verify"){
      if (value !== state.settings.pin){
        shakePinDots();
        pinBusy = false;
        return;
      }
      advanceOrFinish();
    } else if (step.key === "new1"){
      pinTempNew = value;
      advanceOrFinish();
    } else if (step.key === "new2"){
      if (value !== pinTempNew){
        pinError.textContent = "PINs didn't match — let's try again.";
        pinDotsWrap.classList.remove("is-shake");
        void pinDotsWrap.offsetWidth;
        pinDotsWrap.classList.add("is-shake");
        pinTempNew = null;
        // Restart the "create" step of this flow
        pinStepIndex = pinFlowSteps.findIndex(s => s.key === "new1");
        pinHiddenInput.value = "";
        updatePinDots("");
        pinBusy = false;
        return;
      }
      state.settings.pin = pinTempNew;
      saveState();
      advanceOrFinish();
    }
  }

  function finishPinFlow(){
    // Correct final entry: dismiss the keyboard automatically, then close.
    pinHiddenInput.blur();
    const cb = pinOnSuccess;
    pinOnSuccess = null;
    setTimeout(() => {
      closePinFlow();
      if (cb) cb();
    }, 260);
  }

  pinCloseBtn.addEventListener("click", () => {
    closePinFlow();
  });

  // Tapping the dots area (in case the hidden input lost focus) refocuses it.
  pinDotsWrap.addEventListener("click", () => {
    if (pinModalOpen) pinHiddenInput.focus();
  });
  pinModal.addEventListener("click", (e) => {
    if (pinModalOpen && e.target === pinModal) pinHiddenInput.focus();
  });

  // Keep the popup clear of the on-screen keyboard: shift it up by the
  // amount the visual viewport has shrunk, using the user's own device
  // keyboard (no built-in keypad is rendered by the app).
  if (window.visualViewport){
    const vv = window.visualViewport;
    const onViewportChange = () => {
      if (!pinModalOpen) return;
      const overlap = Math.max(0, window.innerHeight - vv.height - vv.offsetTop);
      pinModal.style.bottom = overlap > 24 ? overlap + "px" : "";
    };
    vv.addEventListener("resize", onViewportChange);
    vv.addEventListener("scroll", onViewportChange);
  }

  // ---------- reset demo data ----------
  function resetAllData(){
    state = defaultState();
    saveState();
    renderBalances();
    renderProfile();
    renderActivity(currentActivityFilter);
    applyFontPref();
    applyThemePref();
    renderPinRowStatus();
    renderCards();
    showToast("Demo data has been reset.");
    showScreen("screen-home");
  }

  $("#btnReset").addEventListener("click", () => {
    if (confirm("Reset all demo data? This will restore starting balances and clear transactions.")){
      resetAllData();
    }
  });
  $("#btnResetFull").addEventListener("click", () => {
    if (confirm("Reset all demo data? This will restore starting balances and clear transactions.")){
      resetAllData();
    }
  });

  // ---------- notifications / settings placeholders ----------
  $("#btnNotif").addEventListener("click", () => showToast("You're all caught up — no new notifications."));
  $("#btnSettings").addEventListener("click", () => showToast("Settings are not part of this demo build."));

  // ---------- global tap-bounce (all buttons / cursor:pointer elements) ----------
  document.addEventListener("pointerdown", function(e){
    const el = e.target.closest("button, .account-card, .quick-action, .option-card, .nav-item, .greet, .back-btn, .cancel-btn, .icon-btn, .challenge-card__start, .reset-link, .reset-btn-full, .learn-more, [role='button']");
    if (!el) return;
    el.classList.remove("btn-bounce");
    // force reflow so re-adding the class restarts the animation
    void el.offsetWidth;
    el.classList.add("btn-bounce");
    el.addEventListener("animationend", () => el.classList.remove("btn-bounce"), { once: true });
  });

  // ---------- reload overlay (swipe up anywhere to refresh) ----------
  const appEl = $("#app");
  const reloadOverlay = $("#reloadOverlay");
  const reloadLabel = $("#reloadLabel");
  let isReloading = false;
  let reloadCooldownUntil = 0;

  function refreshCurrentScreen(){
    switch (currentScreenId){
      case "screen-home":
        renderBalances();
        break;
      case "screen-activity":
        renderActivity(currentActivityFilter);
        break;
      case "screen-cards":
        renderCards();
        break;
      case "screen-account-detail":
        renderAccountDetail(currentAccountDetail);
        break;
      case "screen-profile":
        renderProfile();
        renderPinRowStatus();
        break;
      default:
        break;
    }
  }

  function triggerReload(){
    if (isReloading || Date.now() < reloadCooldownUntil) return;
    // Don't hijack a live transfer or interrupt an open sheet/modal.
    if (currentScreenId === "screen-pending") return;
    if (sheet.classList.contains("is-open")) return;
    if (pinModal.classList.contains("is-open")) return;

    isReloading = true;
    reloadOverlay.classList.remove("is-complete");
    reloadLabel.textContent = "Refreshing…";
    void reloadOverlay.offsetWidth; // restart animations cleanly on repeat triggers
    reloadOverlay.classList.add("is-active");

    setTimeout(() => {
      refreshCurrentScreen();
      reloadOverlay.classList.add("is-complete");
      reloadLabel.textContent = "Updated";
    }, 900);

    setTimeout(() => {
      reloadOverlay.classList.remove("is-active");
      isReloading = false;
      reloadCooldownUntil = Date.now() + 700;
    }, 1550);
  }

  (function initSwipeReload(){
    let tracking = false, startX = 0, startY = 0, startTime = 0;
    const THRESHOLD_Y = 80;   // minimum upward travel, px
    const MAX_DRIFT_X = 60;   // ignore mostly-horizontal drags
    const MAX_DURATION = 700; // must be a quick flick, ms

    appEl.addEventListener("pointerdown", (e) => {
      if (e.pointerType === "mouse" && e.button !== 0) return;
      tracking = true;
      startX = e.clientX; startY = e.clientY; startTime = Date.now();
    });

    appEl.addEventListener("pointerup", (e) => {
      if (!tracking) return;
      tracking = false;
      const dy = startY - e.clientY; // positive = moved up
      const dx = Math.abs(e.clientX - startX);
      const dt = Date.now() - startTime;
      if (dy > THRESHOLD_Y && dx < MAX_DRIFT_X && dt < MAX_DURATION){
        triggerReload();
      }
    });

    appEl.addEventListener("pointercancel", () => { tracking = false; });
  })();

  // ---------- init ----------
  function init(){
    renderBalances();
    renderProfile();
    renderActivity("all");
    applyFontPref();
    applyThemePref();
    renderPinRowStatus();
    renderCards();
    syncBottomNav("screen-home");
  }

  init();
})();
