(function () {
  "use strict";

  var ROLE_CONFIG = {
    admin: {
      name: "Administrator",
      subtitle: "Super Admin",
      avatar: "A",
      button: "Masuk sebagai Administrator",
      hero: "Semua operasi dalam satu kendali.",
      description: "Pantau performa, kelola pengguna, dan ambil keputusan berbasis data real-time."
    },
    customer: {
      name: "Daffa Juliansyah",
      subtitle: "Customer",
      avatar: "C",
      button: "Masuk sebagai Customer",
      hero: "Perjalanan lebih mudah dimulai di sini.",
      description: "Pesan jadwal, pantau kapal, akses tiket, dan selesaikan pembayaran tanpa antre."
    },
    operator: {
      name: "Petugas Gate B",
      subtitle: "Petugas Pelabuhan",
      avatar: "P",
      button: "Masuk sebagai Petugas",
      hero: "Operasional lapangan selalu terhubung.",
      description: "Validasi tiket, perbarui status kapal, dan tangani laporan langsung dari dashboard."
    }
  };

  var PAGE_TITLES = {
    dashboard: "Command Center",
    booking: "Jadwal & Booking",
    tracking: "Live Vessel Tracking",
    tickets: "E-Ticket & QR",
    billing: "Tagihan Digital",
    service: "Pusat Layanan",
    users: "Manajemen User"
  };

  var VESSELS = [
    { name: "KM Nusantara", route: "Batam → Jakarta", speed: "14.2 kn", distance: "24.8 NM", eta: "21:30", state: "Berlayar" },
    { name: "KM Samudra", route: "Medan → Batam", speed: "11.8 kn", distance: "41.2 NM", eta: "22:15", state: "Mendekat" },
    { name: "KM Maritim", route: "Jakarta → Batam", speed: "9.6 kn", distance: "63.7 NM", eta: "23:40", state: "Delay 10m" }
  ];

  var DEFAULT_BOOKINGS = [
    { code: "BK-260918-08", ship: "KM Nusantara", route: "Batam → Jakarta", berth: "Dermaga A", schedule: "18 Sep • 21:30", status: "confirmed" },
    { code: "BK-260918-12", ship: "KM Samudra", route: "Medan → Batam", berth: "Dermaga B", schedule: "18 Sep • 22:15", status: "confirmed" },
    { code: "BK-260919-03", ship: "KM Bahari", route: "Jakarta → Batam", berth: "Auto Select", schedule: "19 Sep • 06:30", status: "waiting" },
    { code: "BK-260919-06", ship: "KM Maritim", route: "Batam → Karimun", berth: "Dermaga C", schedule: "19 Sep • 08:45", status: "confirmed" },
    { code: "BK-260919-09", ship: "KM Sejahtera", route: "Bintan → Batam", berth: "Dermaga D", schedule: "19 Sep • 10:20", status: "waiting" }
  ];

  var DEFAULT_INVOICES = [
    { code: "INV-260918-042", service: "Jasa Sandar • KM Nusantara", date: "18 Sep 2026", amount: "Rp 2.850.000", status: "waiting" },
    { code: "INV-260915-118", service: "Tiket Penumpang • 18 orang", date: "15 Sep 2026", amount: "Rp 4.200.000", status: "paid" },
    { code: "INV-260912-091", service: "Bongkar Muat • KM Samudra", date: "12 Sep 2026", amount: "Rp 8.750.000", status: "paid" },
    { code: "INV-260909-077", service: "Jasa Terminal • Kargo", date: "09 Sep 2026", amount: "Rp 1.700.000", status: "waiting" }
  ];

  var DEFAULT_REPORTS = [
    { id: "SR-042", title: "Perubahan jadwal KM Nusantara", type: "Bantuan Perjalanan", priority: "Normal", status: "Diproses", date: "18 Sep, 20:12" },
    { id: "SR-038", title: "Penerangan area Gate C", type: "Insiden Operasional", priority: "Penting", status: "Ditangani", date: "18 Sep, 18:40" },
    { id: "SR-031", title: "Koreksi data manifest", type: "Pengaduan Layanan", priority: "Normal", status: "Selesai", date: "17 Sep, 14:22" }
  ];

  var USERS = [
    { name: "Daffa Juliansyah", email: "daffa.customer@portara.id", role: "Customer", roleKey: "customer", status: "Aktif", last: "Baru saja" },
    { name: "Aulia Rahman", email: "aulia.admin@portara.id", role: "Administrator", roleKey: "admin", status: "Aktif", last: "5 menit lalu" },
    { name: "Rizky Pratama", email: "rizky.gate@portara.id", role: "Petugas", roleKey: "operator", status: "Aktif", last: "12 menit lalu" },
    { name: "Siska Ananda", email: "siska.customer@portara.id", role: "Customer", roleKey: "customer", status: "Aktif", last: "1 jam lalu" },
    { name: "Budi Santoso", email: "budi.operator@portara.id", role: "Petugas", roleKey: "operator", status: "Nonaktif", last: "2 hari lalu" }
  ];

  var state = {
    selectedRole: "admin",
    role: null,
    page: "dashboard",
    bookingFilter: "all",
    bookings: loadData("portara_bookings", DEFAULT_BOOKINGS),
    invoices: loadData("portara_invoices", DEFAULT_INVOICES),
    reports: loadData("portara_reports", DEFAULT_REPORTS),
    currentVessel: 0
  };

  function $(selector, context) {
    return (context || document).querySelector(selector);
  }

  function $$(selector, context) {
    return Array.prototype.slice.call((context || document).querySelectorAll(selector));
  }

  function loadData(key, fallback) {
    try {
      var saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : JSON.parse(JSON.stringify(fallback));
    } catch (error) {
      return JSON.parse(JSON.stringify(fallback));
    }
  }

  function saveData(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      return;
    }
  }

  function safe(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function statusLabel(status) {
    if (status === "confirmed") return "Terkonfirmasi";
    if (status === "waiting") return "Menunggu";
    if (status === "paid") return "Lunas";
    return status;
  }

  function greeting() {
    var hour = new Date().getHours();
    if (hour < 11) return "Selamat pagi";
    if (hour < 15) return "Selamat siang";
    if (hour < 19) return "Selamat sore";
    return "Selamat malam";
  }

  function toast(title, message, type) {
    var stack = $("#toastStack");
    var item = document.createElement("div");
    item.className = "toast";
    var symbol = type === "error" ? "!" : type === "info" ? "i" : "✓";
    item.innerHTML = "<i>" + symbol + "</i><div><strong>" + safe(title) + "</strong><span>" + safe(message) + "</span></div>";
    if (type === "error") item.querySelector("i").style.background = "var(--red)";
    if (type === "info") item.querySelector("i").style.background = "var(--cyan)";
    stack.appendChild(item);
    window.setTimeout(function () {
      item.classList.add("out");
      window.setTimeout(function () { item.remove(); }, 320);
    }, 3300);
  }

  function selectRole(role) {
    state.selectedRole = role;
    $$(".role-card").forEach(function (card) {
      card.classList.toggle("active", card.getAttribute("data-role-option") === role);
    });
    $("#loginButton span").textContent = ROLE_CONFIG[role].button;
  }

  function applyAvatar(element, role) {
    if (!element) return;
    element.textContent = ROLE_CONFIG[role].avatar;
    element.classList.remove("customer-avatar", "operator-avatar");
    if (role === "customer") element.classList.add("customer-avatar");
    if (role === "operator") element.classList.add("operator-avatar");
  }

  function login() {
    state.role = state.selectedRole;
    var config = ROLE_CONFIG[state.role];

    $("#loginScreen").classList.add("is-hidden");
    $("#appShell").classList.remove("is-hidden");
    $("#sidebarName").textContent = config.name;
    $("#sidebarRole").textContent = config.subtitle;
    $("#topName").textContent = config.name;
    $("#topRole").textContent = config.subtitle;
    $("#heroTitle").textContent = config.hero;
    $("#heroDescription").textContent = config.description;
    $("#greeting").textContent = greeting();

    applyAvatar($("#sidebarAvatar"), state.role);
    applyAvatar($("#topAvatar"), state.role);

    $$("[data-roles]").forEach(function (element) {
      var roles = element.getAttribute("data-roles").split(",");
      element.style.display = roles.indexOf(state.role) >= 0 ? "" : "none";
    });
    $$("[data-admin-only]").forEach(function (element) {
      element.style.display = state.role === "admin" ? "" : "none";
    });

    $("#newBookingButton").style.display = state.role === "operator" ? "none" : "";
    $("#exportInvoiceButton").style.display = state.role === "customer" ? "none" : "";
    $("#addUserButton").style.display = state.role === "admin" ? "" : "none";

    if (state.role === "customer") {
      $("#scanTicketButton").textContent = "▣ Tampilkan Tiket";
      $("#ticketPassenger").textContent = config.name;
    } else {
      $("#scanTicketButton").textContent = "▣ Scan Tiket";
      $("#ticketPassenger").textContent = "Daffa Juliansyah";
    }

    navigate("dashboard");
    animateCounters();
    toast("Akses berhasil", "Dashboard " + config.subtitle + " siap digunakan.", "success");
  }

  function logout() {
    $("#appShell").classList.add("is-hidden");
    $("#loginScreen").classList.remove("is-hidden");
    $("#notificationPanel").classList.remove("show");
    closeSidebar();
    state.role = null;
    window.scrollTo(0, 0);
  }

  function navigate(page) {
    var allowedButton = $('.nav-item[data-page-target="' + page + '"]');
    if (allowedButton && allowedButton.style.display === "none") {
      page = "dashboard";
    }
    state.page = page;
    $$(".page").forEach(function (section) {
      section.classList.toggle("active", section.getAttribute("data-page") === page);
    });
    $$(".nav-item").forEach(function (button) {
      button.classList.toggle("active", button.getAttribute("data-page-target") === page);
    });
    $("#pageTitle").textContent = PAGE_TITLES[page] || "PORTARA";
    $("#notificationPanel").classList.remove("show");
    closeSidebar();
    window.scrollTo({ top: 0, behavior: "smooth" });

    if (page === "booking") renderBookings();
    if (page === "tracking") renderVessels();
    if (page === "billing") renderInvoices();
    if (page === "service") renderReports();
    if (page === "users") renderUsers();
  }

  function renderBookings() {
    var table = $("#bookingTable");
    var query = ($("#bookingSearch").value || "").toLowerCase();
    var header = '<div class="data-row data-head"><span>Kode</span><span>Kapal & Rute</span><span>Dermaga</span><span>Jadwal</span><span>Status</span><span>Aksi</span></div>';
    var filtered = state.bookings.filter(function (booking) {
      var matchesFilter = state.bookingFilter === "all" || booking.status === state.bookingFilter;
      var matchesSearch = (booking.ship + " " + booking.code + " " + booking.route).toLowerCase().indexOf(query) >= 0;
      return matchesFilter && matchesSearch;
    });

    var rows = filtered.map(function (booking) {
      return '<div class="data-row" data-booking-code="' + safe(booking.code) + '">' +
        '<span><strong>' + safe(booking.code) + '</strong></span>' +
        '<span><strong>' + safe(booking.ship) + '</strong><small class="subcopy">' + safe(booking.route) + '</small></span>' +
        '<span>' + safe(booking.berth) + '</span>' +
        '<span>' + safe(booking.schedule) + '</span>' +
        '<span><mark class="status ' + safe(booking.status) + '">' + safe(statusLabel(booking.status)) + '</mark></span>' +
        '<span><button class="row-action booking-action" title="Lihat detail">•••</button></span>' +
        '</div>';
    }).join("");

    table.innerHTML = header + (rows || '<div class="empty-state">Tidak ada booking yang sesuai.</div>');
    $$(".booking-action", table).forEach(function (button) {
      button.addEventListener("click", function () {
        var code = button.closest(".data-row").getAttribute("data-booking-code");
        if (state.role === "operator") {
          var target = state.bookings.find(function (item) { return item.code === code; });
          if (target && target.status === "waiting") {
            target.status = "confirmed";
            saveData("portara_bookings", state.bookings);
            renderBookings();
            toast("Status diperbarui", code + " telah dikonfirmasi petugas.", "success");
          } else {
            toast("Detail booking", code + " sudah terkonfirmasi.", "info");
          }
        } else {
          toast("Detail booking", code + " dibuka dalam mode presentasi.", "info");
        }
      });
    });
  }

  function createBooking(event) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    var code = "BK-" + String(Date.now()).slice(-8);
    var berth = formData.get("berth") === "Rekomendasi Otomatis" ? "Dermaga B" : formData.get("berth");
    var date = new Date(formData.get("date") + "T00:00:00");
    var displayDate = isNaN(date.getTime()) ? formData.get("date") : date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
    state.bookings.unshift({
      code: code,
      ship: formData.get("ship"),
      route: formData.get("origin") + " → " + formData.get("destination"),
      berth: berth,
      schedule: displayDate + " • " + formData.get("time"),
      status: "waiting"
    });
    saveData("portara_bookings", state.bookings);
    event.currentTarget.reset();
    closeModal();
    navigate("booking");
    toast("Booking berhasil dibuat", code + " menunggu konfirmasi operator.", "success");
  }

  function renderVessels() {
    var container = $("#vesselCards");
    container.innerHTML = VESSELS.map(function (vessel, index) {
      return '<button class="vessel-mini-card ' + (index === state.currentVessel ? "active" : "") + '" data-vessel-index="' + index + '">' +
        '<i>▲</i><div><strong>' + safe(vessel.name) + '</strong><span>' + safe(vessel.route) + ' • ' + safe(vessel.speed) + '</span></div>' +
        '<mark>' + safe(vessel.state) + '</mark></button>';
    }).join("");
    $$(".vessel-mini-card", container).forEach(function (button) {
      button.addEventListener("click", function () {
        selectVessel(Number(button.getAttribute("data-vessel-index")));
      });
    });
    selectVessel(state.currentVessel, false);
  }

  function selectVessel(index, notify) {
    state.currentVessel = index;
    var vessel = VESSELS[index];
    $("#vesselName").textContent = vessel.name;
    $("#vesselRoute").textContent = vessel.route;
    $("#vesselSpeed").textContent = vessel.speed;
    $("#vesselDistance").textContent = vessel.distance;
    $("#vesselEta").textContent = vessel.eta;
    $("#vesselEtaBottom").textContent = vessel.eta;
    $$(".vessel-marker").forEach(function (marker, markerIndex) {
      marker.classList.toggle("active", markerIndex === index);
    });
    $$(".vessel-mini-card").forEach(function (card, cardIndex) {
      card.classList.toggle("active", cardIndex === index);
    });
    if (notify !== false) toast("Tracking diperbarui", "Menampilkan posisi " + vessel.name + ".", "info");
  }

  function renderInvoices() {
    var query = ($("#invoiceSearch").value || "").toLowerCase();
    var list = state.invoices.filter(function (invoice) {
      return (invoice.code + " " + invoice.service).toLowerCase().indexOf(query) >= 0;
    });
    var header = '<div class="data-row data-head"><span>Invoice</span><span>Layanan</span><span>Tanggal</span><span>Nominal</span><span>Status</span><span>Aksi</span></div>';
    var rows = list.map(function (invoice) {
      var button = invoice.status === "waiting"
        ? '<button class="pay-button" data-pay="' + safe(invoice.code) + '">Bayar</button>'
        : '<button class="pay-button" disabled>✓ Lunas</button>';
      return '<div class="data-row">' +
        '<span><strong>' + safe(invoice.code) + '</strong></span>' +
        '<span><strong>' + safe(invoice.service.split(" • ")[0]) + '</strong><small class="subcopy">' + safe(invoice.service.split(" • ")[1] || "") + '</small></span>' +
        '<span>' + safe(invoice.date) + '</span><span><strong>' + safe(invoice.amount) + '</strong></span>' +
        '<span><mark class="status ' + (invoice.status === "paid" ? "complete" : "waiting") + '">' + (invoice.status === "paid" ? "Lunas" : "Menunggu") + '</mark></span>' +
        '<span>' + button + '</span></div>';
    }).join("");
    $("#invoiceTable").innerHTML = header + rows;
    $$("[data-pay]").forEach(function (button) {
      button.addEventListener("click", function () {
        payInvoice(button.getAttribute("data-pay"));
      });
    });
  }

  function payInvoice(code) {
    var invoice = state.invoices.find(function (item) { return item.code === code; });
    if (!invoice) return;
    buttonLoading(code);
    window.setTimeout(function () {
      invoice.status = "paid";
      saveData("portara_invoices", state.invoices);
      renderInvoices();
      toast("Pembayaran berhasil", code + " telah tercatat sebagai lunas.", "success");
    }, 700);
  }

  function buttonLoading(code) {
    var button = $('[data-pay="' + code + '"]');
    if (button) {
      button.disabled = true;
      button.textContent = "Memproses...";
    }
  }

  function renderReports() {
    var list = $("#reportList");
    list.innerHTML = state.reports.map(function (report) {
      var priorityClass = report.priority === "Darurat" ? "emergency" : report.priority === "Normal" ? "normal" : "";
      return '<div class="report-row"><div><i class="report-id">' + safe(report.id.replace("SR-", "")) + '</i><div><strong>' + safe(report.title) + '</strong><span>' + safe(report.type) + '</span></div></div>' +
        '<span><mark class="priority ' + priorityClass + '">' + safe(report.priority) + '</mark></span>' +
        '<span>' + safe(report.date) + '</span><span><mark class="status approach">' + safe(report.status) + '</mark></span></div>';
    }).join("");
  }

  function createReport(event) {
    event.preventDefault();
    var formData = new FormData(event.currentTarget);
    var id = "SR-" + String(Date.now()).slice(-3);
    state.reports.unshift({
      id: id,
      title: formData.get("title"),
      type: formData.get("type"),
      priority: formData.get("priority"),
      status: "Diterima",
      date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short" }) + ", " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    });
    saveData("portara_reports", state.reports);
    event.currentTarget.reset();
    closeModal();
    navigate("service");
    toast("Laporan terkirim", id + " akan segera ditangani command center.", "success");
  }

  function renderUsers() {
    var query = ($("#userSearch").value || "").toLowerCase();
    var filtered = USERS.filter(function (user) {
      return (user.name + " " + user.email + " " + user.role).toLowerCase().indexOf(query) >= 0;
    });
    var header = '<div class="data-row data-head"><span>Pengguna</span><span>Email</span><span>Role</span><span>Terakhir aktif</span><span>Status</span><span>Aksi</span></div>';
    var rows = filtered.map(function (user) {
      var initial = user.name.split(" ").map(function (word) { return word.charAt(0); }).slice(0, 2).join("");
      return '<div class="data-row"><span class="user-cell"><i class="user-mini-avatar ' + safe(user.roleKey) + '">' + safe(initial) + '</i><strong>' + safe(user.name) + '</strong></span>' +
        '<span>' + safe(user.email) + '</span><span><mark class="status ' + (user.roleKey === "operator" ? "complete" : user.roleKey === "customer" ? "sailing" : "approach") + '">' + safe(user.role) + '</mark></span>' +
        '<span>' + safe(user.last) + '</span><span><mark class="status ' + (user.status === "Aktif" ? "complete" : "waiting") + '">' + safe(user.status) + '</mark></span>' +
        '<span><button class="row-action user-action">•••</button></span></div>';
    }).join("");
    $("#userTable").innerHTML = header + rows;
    $$(".user-action").forEach(function (button) {
      button.addEventListener("click", function () {
        toast("Manajemen akun", "Menu edit pengguna siap digunakan.", "info");
      });
    });
  }

  function openModal(id) {
    $$(".modal").forEach(function (modal) { modal.classList.remove("active"); });
    var target = $("#" + id);
    if (!target) return;
    target.classList.add("active");
    $("#modalBackdrop").classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function closeModal() {
    $("#modalBackdrop").classList.remove("show");
    document.body.style.overflow = "";
    window.setTimeout(function () {
      $$(".modal").forEach(function (modal) { modal.classList.remove("active"); });
    }, 260);
  }

  function openSidebar() {
    $("#sidebar").classList.add("open");
    $("#sidebarOverlay").classList.add("show");
  }

  function closeSidebar() {
    $("#sidebar").classList.remove("open");
    $("#sidebarOverlay").classList.remove("show");
  }

  function animateCounters() {
    $$("[data-counter]").forEach(function (counter) {
      var target = Number(counter.getAttribute("data-counter"));
      var duration = 900;
      var start = performance.now();
      function tick(now) {
        var progress = Math.min((now - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var value = Math.floor(target * eased);
        counter.textContent = target > 999 ? value.toLocaleString("id-ID") : value;
        if (progress < 1) requestAnimationFrame(tick);
      }
      requestAnimationFrame(tick);
    });
  }

  function liveClock() {
    var now = new Date();
    var formatted = now.toLocaleTimeString("id-ID", { hour12: false });
    $("#liveTime").textContent = formatted;
  }

  function generateQrPattern() {
    var qr = $("#qrCode");
    var seed = "PORTARA2609180042";
    var cells = [];
    for (var i = 0; i < 81; i += 1) {
      var code = seed.charCodeAt(i % seed.length);
      var on = ((code + i * 7) % 5) < 3;
      cells.push('<i style="background:' + (on ? "#0c2b3c" : "transparent") + '"></i>');
    }
    qr.style.backgroundImage = "none";
    qr.style.display = "grid";
    qr.style.gridTemplateColumns = "repeat(9,1fr)";
    qr.style.gridTemplateRows = "repeat(9,1fr)";
    qr.style.gap = "1px";
    qr.innerHTML = cells.join("");
  }

  function validateTicket() {
    var input = $("#ticketCodeInput");
    var result = $("#validationResult");
    var code = input.value.trim().toUpperCase();
    result.classList.remove("success", "error");
    if (code === "PRT-260918-0042" || code.indexOf("PRT-") === 0) {
      result.classList.add("success");
      result.innerHTML = "<i>✓</i><div><strong>Tiket valid — akses diizinkan</strong><span>KM Nusantara • Gate B-02 • Seat 12A</span></div>";
      toast("Validasi berhasil", code + " dapat memasuki area keberangkatan.", "success");
    } else {
      result.classList.add("error");
      result.innerHTML = "<i>!</i><div><strong>Kode tiket tidak ditemukan</strong><span>Periksa kembali kode booking yang dimasukkan</span></div>";
      toast("Periksa kode tiket", "Data tidak ditemukan pada manifest aktif.", "error");
    }
  }

  function simulateScan() {
    var button = $("#simulateScanButton");
    button.disabled = true;
    button.textContent = "Memindai QR...";
    window.setTimeout(function () {
      button.disabled = false;
      button.textContent = "Simulasikan Scan";
      closeModal();
      navigate("tickets");
      $("#ticketCodeInput").value = "PRT-260918-0042";
      validateTicket();
    }, 1100);
  }

  function downloadText(filename, content, mime) {
    var blob = new Blob([content], { type: mime || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 500);
  }

  function downloadTicket() {
    var content = [
      "PORTARA - BOARDING PASS",
      "Kode: PRT-260918-0042",
      "Penumpang: Daffa Juliansyah",
      "Rute: Batam (BTH) ke Jakarta (JKT)",
      "Kapal: KM Nusantara",
      "Tanggal: 18 September 2026",
      "Boarding: 20:45 WIB",
      "Gate: B-02",
      "Kursi: 12A",
      "",
      "Tunjukkan kode booking ini di gerbang keberangkatan."
    ].join("\n");
    downloadText("PORTARA-Ticket-PRT-260918-0042.txt", content);
    toast("Tiket diunduh", "Boarding pass tersimpan di perangkat.", "success");
  }

  function exportInvoices() {
    var lines = ["Invoice,Layanan,Tanggal,Nominal,Status"];
    state.invoices.forEach(function (invoice) {
      lines.push([invoice.code, invoice.service, invoice.date, invoice.amount, statusLabel(invoice.status)].map(function (value) {
        return '"' + String(value).replace(/"/g, '""') + '"';
      }).join(","));
    });
    downloadText("Laporan-Tagihan-PORTARA.csv", lines.join("\n"), "text/csv;charset=utf-8");
    toast("Laporan diekspor", "Data tagihan berhasil dibuat dalam format CSV.", "success");
  }

  function toggleTheme() {
    document.body.classList.toggle("light-theme");
    try {
      localStorage.setItem("portara_theme", document.body.classList.contains("light-theme") ? "light" : "dark");
    } catch (error) {
      return;
    }
  }

  function setupTilt() {
    $$(".tilt-card").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        var rect = card.getBoundingClientRect();
        var x = (event.clientX - rect.left) / rect.width - 0.5;
        var y = (event.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(700px) rotateX(" + (-y * 6) + "deg) rotateY(" + (x * 7) + "deg) translateY(-2px)";
      });
      card.addEventListener("pointerleave", function () {
        card.style.transform = "";
      });
    });

    var scene = $("#portScene");
    scene.addEventListener("pointermove", function (event) {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      var rect = scene.getBoundingClientRect();
      var x = (event.clientX - rect.left) / rect.width - 0.5;
      var y = (event.clientY - rect.top) / rect.height - 0.5;
      scene.style.transform = "perspective(1000px) rotateX(" + (-y * 3.5) + "deg) rotateY(" + (x * 5) + "deg)";
    });
    scene.addEventListener("pointerleave", function () { scene.style.transform = ""; });
  }

  function bindEvents() {
    $$(".role-card").forEach(function (card) {
      card.addEventListener("click", function () { selectRole(card.getAttribute("data-role-option")); });
    });
    $("#loginButton").addEventListener("click", login);
    $("#logoutButton").addEventListener("click", logout);

    $$(".nav-item").forEach(function (button) {
      button.addEventListener("click", function () { navigate(button.getAttribute("data-page-target")); });
    });
    $$("[data-quick-page]").forEach(function (button) {
      button.addEventListener("click", function () { navigate(button.getAttribute("data-quick-page")); });
    });
    $$("[data-open-service]").forEach(function (button) {
      button.addEventListener("click", function () { navigate("service"); });
    });

    $("#menuToggle").addEventListener("click", openSidebar);
    $("#sidebarClose").addEventListener("click", closeSidebar);
    $("#sidebarOverlay").addEventListener("click", closeSidebar);

    $("#notificationButton").addEventListener("click", function (event) {
      event.stopPropagation();
      $("#notificationPanel").classList.toggle("show");
    });
    $("#notificationPanel").addEventListener("click", function (event) { event.stopPropagation(); });
    document.addEventListener("click", function () { $("#notificationPanel").classList.remove("show"); });
    $("#markRead").addEventListener("click", function () {
      $$(".notice").forEach(function (notice) { notice.classList.remove("unread"); });
      var badge = $(".notification-btn b");
      if (badge) badge.style.display = "none";
      toast("Notifikasi dibaca", "Semua informasi telah ditandai dibaca.", "success");
    });

    $("#themeToggle").addEventListener("click", toggleTheme);
    $("#newBookingButton").addEventListener("click", function () { openModal("bookingModal"); });
    $("#bookingForm").addEventListener("submit", createBooking);
    $("#newReportButton").addEventListener("click", function () { openModal("reportModal"); });
    $("#reportForm").addEventListener("submit", createReport);
    $$(".service-card").forEach(function (card) {
      card.addEventListener("click", function () {
        $("#reportForm [name=type]").value = card.getAttribute("data-service-type");
        openModal("reportModal");
      });
    });

    $("#scanTicketButton").addEventListener("click", function () {
      if (state.role === "customer") {
        toast("Tiket aktif", "QR siap ditunjukkan di Gate B-02.", "info");
        $("#qrCode").animate([{ transform: "scale(1)" }, { transform: "scale(1.08)" }, { transform: "scale(1)" }], { duration: 650 });
      } else {
        openModal("scanModal");
      }
    });
    $("#validateTicketButton").addEventListener("click", validateTicket);
    $("#ticketCodeInput").addEventListener("keydown", function (event) {
      if (event.key === "Enter") validateTicket();
    });
    $("#simulateScanButton").addEventListener("click", simulateScan);
    $("#downloadTicketButton").addEventListener("click", downloadTicket);
    $("#exportInvoiceButton").addEventListener("click", exportInvoices);

    $$(".modal-close, .modal-cancel").forEach(function (button) { button.addEventListener("click", closeModal); });
    $("#modalBackdrop").addEventListener("click", function (event) {
      if (event.target === $("#modalBackdrop")) closeModal();
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeModal();
    });

    $("#bookingSearch").addEventListener("input", renderBookings);
    $$("[data-booking-filter]").forEach(function (button) {
      button.addEventListener("click", function () {
        state.bookingFilter = button.getAttribute("data-booking-filter");
        $$("[data-booking-filter]").forEach(function (item) { item.classList.remove("active"); });
        button.classList.add("active");
        renderBookings();
      });
    });
    $("#invoiceSearch").addEventListener("input", renderInvoices);
    $("#userSearch").addEventListener("input", renderUsers);

    $$(".vessel-marker").forEach(function (marker, index) {
      marker.addEventListener("click", function () { selectVessel(index); });
    });
    $("#map3dButton").addEventListener("click", function () {
      $("#mapGrid").classList.toggle("mode-3d");
      $("#map3dButton").classList.toggle("active");
      toast("Mode peta diubah", $("#mapGrid").classList.contains("mode-3d") ? "Perspektif 3D diaktifkan." : "Perspektif 2D diaktifkan.", "info");
    });
    $("#centerMapButton").addEventListener("click", function () {
      $("#mapGrid").animate([{ transform: "scale(.97)" }, { transform: "scale(1.02)" }, { transform: "scale(1)" }], { duration: 500 });
      toast("Peta dipusatkan", "Posisi kapal aktif berada di tengah peta.", "info");
    });
    $("#followVesselButton").addEventListener("click", function () {
      var vessel = VESSELS[state.currentVessel];
      toast("Live follow aktif", "Pembaruan " + vessel.name + " diterima setiap 5 detik.", "success");
    });
    $("#vesselSearch").addEventListener("input", function () {
      var query = this.value.toLowerCase();
      var index = VESSELS.findIndex(function (vessel) { return vessel.name.toLowerCase().indexOf(query) >= 0; });
      if (query && index >= 0) selectVessel(index, false);
    });

    $("#addUserButton").addEventListener("click", function () {
      toast("Form pengguna baru", "Fitur penambahan tiga role telah siap.", "info");
    });
  }

  function init() {
    try {
      if (localStorage.getItem("portara_theme") === "light") document.body.classList.add("light-theme");
    } catch (error) {
      return;
    }
    selectRole("admin");
    generateQrPattern();
    renderBookings();
    renderVessels();
    renderInvoices();
    renderReports();
    renderUsers();
    setupTilt();
    bindEvents();
    liveClock();
    window.setInterval(liveClock, 1000);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();