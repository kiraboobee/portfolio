/* 網站主程式：讀 content/site.js 與 content/works.js，把內容畫到頁面上 */
(function () {
  "use strict";
  var S = {}, WORKS = [];
  var view = document.getElementById("view");
  var nav = document.getElementById("nav");
  var brand = document.querySelector(".brand");
  var toggle = document.querySelector(".menu-toggle");
  var dlg = document.getElementById("work");
  var dlgBody = dlg.querySelector(".work-body");
  var current = { list: [], index: 0 };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function url(p) { return String(p || "").replace(/^\/+/, ""); }   // 一律用相對路徑

  /* 睡著的企鵝寶寶：沒有封面圖、或這一頁還沒有作品時出現 */
  function sleepy(label) {
    return '<svg class="sleepy" viewBox="0 0 240 180" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + esc(label || "睡著的企鵝寶寶") + '">' +
      '<rect width="240" height="180" fill="#EEF3EE"/><ellipse cx="120" cy="150" rx="82" ry="9" fill="#DCE9E6"/>' +
      '<ellipse cx="76" cy="146" rx="12" ry="5" fill="#F2A65A"/>' +
      '<ellipse cx="126" cy="122" rx="54" ry="30" fill="#45ADA8"/><ellipse cx="130" cy="132" rx="38" ry="17" fill="#FBF7EC"/>' +
      '<ellipse cx="150" cy="104" rx="26" ry="9" fill="#2E8C8A" transform="rotate(-12 150 104)"/>' +
      '<circle cx="84" cy="112" r="27" fill="#45ADA8"/><ellipse cx="78" cy="118" rx="17" ry="14" fill="#FBF7EC"/>' +
      '<path d="M68 114 q5 4 10 0 M82 114 q5 4 10 0" fill="none" stroke="#17323A" stroke-width="2" stroke-linecap="round"/>' +
      '<path d="M74 122 Q79 128 84 122 Q79 120 74 122Z" fill="#F2A65A"/><circle cx="66" cy="122" r="3.5" fill="#F6C3B4" opacity=".7"/>' +
      '<g fill="#56707A" font-family="Georgia,serif" font-style="italic"><text x="118" y="78" font-size="15">z</text><text x="132" y="62" font-size="20">z</text><text x="150" y="42" font-size="26">z</text></g></svg>';
  }

  function coverHTML(w) {
    if (w.cover) return '<img src="' + esc(url(w.cover)) + '" alt="' + esc(w.title) + '" loading="lazy">';
    var yt = (w.media || []).filter(function (m) { return m.type === "youtube" && m.id; })[0];
    if (yt) return '<img src="https://i.ytimg.com/vi/' + encodeURIComponent(yt.id) + '/hqdefault.jpg" alt="' + esc(w.title) + '" loading="lazy">';
    return sleepy(w.title);
  }
  /* 圖片載入失敗時，換成睡著的企鵝 */
  document.addEventListener("error", function (e) {
    var t = e.target;
    if (t && t.tagName === "IMG" && t.closest(".frame, .portrait")) t.outerHTML = sleepy(t.alt);
  }, true);
  function kindOf(w) {
    var t = (w.media || []).map(function (m) { return m.type; });
    if (t.some(function (x) { return x === "model" || x === "sketchfab"; })) return "3D";
    if (t.some(function (x) { return x === "video" || x === "youtube" || x === "vimeo"; })) return "影片";
    return "";
  }
  function yearOf(w) { return String(w.date || "").slice(0, 4); }

  /* ── 各種頁面 ── */
  function renderHome() {
    view.innerHTML = '<section class="hero"><h1>' + esc(S.name) +
      '<span class="latin">' + esc(S.nickname || "") + "</span></h1>" +
      "<p>" + (S.nameZh ? esc(S.nameZh) + "。" : "") + esc(S.tagline) + '</p><p class="hint">' +
      esc(window.matchMedia("(hover: none)").matches && S.hintTouch ? S.hintTouch : S.hint) + "</p></section>";
  }

  function renderGallery(sec) {
    var list = WORKS.filter(function (w) { return w.section === sec.slug; });
    var tags = [];
    list.forEach(function (w) { (w.tags || []).forEach(function (t) { if (tags.indexOf(t) < 0) tags.push(t); }); });
    var html = '<header class="page-head"><h1 class="page-title">' + esc(sec.label) + "</h1>" +
      (sec.intro ? '<p class="page-intro">' + esc(sec.intro) + "</p>" : "") + "</header>";
    if (!list.length) {
      view.innerHTML = html + '<div class="empty">' + sleepy() + "<p>這裡還沒有作品，企鵝寶寶先睡一下。</p></div>";
      return;
    }
    if (tags.length > 1) {
      html += '<ul class="filters" aria-label="依標籤篩選"><li><button type="button" data-tag="" aria-pressed="true">全部</button></li>' +
        tags.map(function (t) { return '<li><button type="button" data-tag="' + esc(t) + '" aria-pressed="false">' + esc(t) + "</button></li>"; }).join("") + "</ul>";
    }
    html += '<div class="wall"></div>';
    view.innerHTML = html;
    var wall = view.querySelector(".wall");

    function draw(tag) {
      var shown = tag ? list.filter(function (w) { return (w.tags || []).indexOf(tag) >= 0; }) : list;
      wall.innerHTML = shown.map(function (w, i) {
        var k = kindOf(w);
        return '<button type="button" class="tile" data-i="' + i + '"><div class="frame">' + coverHTML(w) +
          (k ? '<span class="kind">' + k + "</span>" : "") + '</div><div class="cap"><span class="t">' + esc(w.title) +
          '</span><span class="y">' + esc(yearOf(w)) + '</span></div><div class="m">' + esc(w.medium || "") + "</div></button>";
      }).join("");
      wall.onclick = function (e) {
        var b = e.target.closest(".tile");
        if (b) openWork(shown, +b.dataset.i);
      };
    }
    draw("");
    var filters = view.querySelector(".filters");
    if (filters) filters.addEventListener("click", function (e) {
      var b = e.target.closest("button");
      if (!b) return;
      filters.querySelectorAll("button").forEach(function (x) { x.setAttribute("aria-pressed", x === b ? "true" : "false"); });
      draw(b.dataset.tag);
    });
  }

  function renderAbout(sec) {
    var a = S.about || {};
    view.innerHTML = '<header class="page-head"><h1 class="page-title">' + esc(sec.label) + '</h1></header><div class="about">' +
      '<div class="portrait">' + (a.portrait ? '<img src="' + esc(url(a.portrait)) + '" alt="' + esc(S.name) + '">' : sleepy()) + "</div>" +
      '<div class="prose">' + (a.paragraphs || []).map(function (p) { return "<p>" + esc(p) + "</p>"; }).join("") + "</div></div>";
  }

  function renderCV(sec) {
    view.innerHTML = '<header class="page-head"><h1 class="page-title">' + esc(sec.label) + "</h1></header>" +
      (S.cv || []).map(function (g) {
        return '<section class="cv-group"><h2>' + esc(g.title) + '</h2><ul class="cv-list">' +
          g.items.map(function (it) {
            return '<li><span class="when">' + esc(it.when) + "</span><span>" + esc(it.what) +
              (it.note ? '<span class="note">' + esc(it.note) + "</span>" : "") + "</span></li>";
          }).join("") + "</ul></section>";
      }).join("");
  }

  function renderContact(sec) {
    view.innerHTML = '<header class="page-head"><h1 class="page-title">' + esc(sec.label) +
      "</h1>" + (sec.intro ? '<p class="page-intro">' + esc(sec.intro) + "</p>" : "") + '</header><ul class="contact-list">' +
      (S.contact || []).map(function (c) {
        return '<li><span class="k">' + esc(c.k) + '</span><span class="v">' +
          (c.href ? '<a href="' + esc(c.href) + '" rel="noopener">' + esc(c.v) + "</a>" : esc(c.v)) + "</span></li>";
      }).join("") + "</ul>";
  }

  /* ── 作品詳細視窗 ── */
  var modelViewerLoaded = false;
  function mediaHTML(m, w) {
    var f = esc(url(m.file || m.src)), id = encodeURIComponent(m.id || ""), h = "";
    switch (m.type) {
      case "image": h = '<img src="' + f + '" alt="' + esc(m.caption || w.title) + '">'; break;
      case "video": h = '<video src="' + f + '" controls playsinline preload="metadata"' + (w.cover ? ' poster="' + esc(url(w.cover)) + '"' : "") + "></video>"; break;
      case "youtube": h = '<iframe src="https://www.youtube-nocookie.com/embed/' + id + '" title="' + esc(w.title) + '" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>'; break;
      case "vimeo": h = '<iframe src="https://player.vimeo.com/video/' + id + '" title="' + esc(w.title) + '" allow="fullscreen; picture-in-picture" allowfullscreen loading="lazy"></iframe>'; break;
      case "sketchfab": h = '<iframe src="https://sketchfab.com/models/' + id + '/embed" title="' + esc(w.title) + '" allow="fullscreen; xr-spatial-tracking" allowfullscreen loading="lazy"></iframe>'; break;
      case "model":
        if (!modelViewerLoaded) {
          modelViewerLoaded = true;
          var sc = document.createElement("script");
          sc.type = "module";
          sc.src = "https://cdn.jsdelivr.net/npm/@google/model-viewer@4/dist/model-viewer.min.js";
          document.head.appendChild(sc);
        }
        h = '<model-viewer src="' + f + '" alt="' + esc(w.title) + '" camera-controls auto-rotate shadow-intensity="0.6"></model-viewer>'; break;
    }
    if (!h) return "";
    return "<figure>" + h + (m.caption ? "<figcaption>" + esc(m.caption) + "</figcaption>" : "") + "</figure>";
  }

  function showWork() {
    var w = current.list[current.index];
    if (!w) return;
    var media = (w.media || []).map(function (m) { return mediaHTML(m, w); }).join("") || '<figure class="frame">' + coverHTML(w) + "</figure>";
    var links = (w.links || []).filter(function (l) { return l.url; }).map(function (l) {
      return '<li><a href="' + esc(l.url) + '" target="_blank" rel="noopener">' + esc(l.label || l.url) + "</a></li>";
    }).join("");
    var rows = [["時間", w.date], ["媒材", w.medium], ["尺寸", w.size]].filter(function (r) { return r[1]; });
    dlgBody.innerHTML = '<div class="work-media">' + media + '</div><div class="work-info"><h2>' + esc(w.title) + '</h2><dl class="meta">' +
      rows.map(function (r) { return "<dt>" + r[0] + "</dt><dd>" + esc(r[1]) + "</dd>"; }).join("") + "</dl>" +
      ((w.tags || []).length ? '<ul class="tags">' + w.tags.map(function (t) { return "<li>" + esc(t) + "</li>"; }).join("") + "</ul>" : "") +
      '<p class="work-desc">' + esc(w.description || "") + "</p>" + (links ? '<ul class="work-links">' + links + "</ul>" : "") + "</div>";
    dlg.scrollTop = 0;
    var many = current.list.length > 1;
    dlg.querySelector(".w-prev").hidden = !many;
    dlg.querySelector(".w-next").hidden = !many;
  }
  function openWork(list, i) {
    current = { list: list, index: i };
    showWork();
    if (!dlg.open) dlg.showModal();
  }
  function step(d) {
    var n = current.list.length;
    current.index = (current.index + d + n) % n;
    showWork();
  }
  dlg.querySelector(".w-prev").onclick = function () { step(-1); };
  dlg.querySelector(".w-next").onclick = function () { step(1); };
  dlg.querySelector(".w-close").onclick = function () { dlg.close(); };
  dlg.addEventListener("close", function () { dlgBody.innerHTML = ""; });
  dlg.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") step(1);
    if (e.key === "ArrowLeft") step(-1);
  });

  /* ── 導覽與換頁 ── */
  toggle.onclick = function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  };

  function route() {
    var slug = decodeURIComponent(location.hash.replace(/^#/, "")) || "home";
    var sec = (S.sections || []).filter(function (s) { return s.slug === slug; })[0];
    if (dlg.open) dlg.close();
    document.body.classList.toggle("is-home", !sec);
    nav.classList.remove("open");
    toggle.setAttribute("aria-expanded", "false");
    nav.querySelectorAll("a").forEach(function (a) {
      if (sec && a.getAttribute("href") === "#" + sec.slug) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    if (!sec) renderHome();
    else if (sec.type === "gallery") renderGallery(sec);
    else if (sec.type === "about") renderAbout(sec);
    else if (sec.type === "cv") renderCV(sec);
    else renderContact(sec);
    document.title = (sec ? sec.label + "｜" : "") + S.name + " Portfolio";
    window.scrollTo(0, 0);
  }

  /* ── 啟動：先讀內容檔，再畫頁面 ── */
  function getJSON(path) {
    return fetch(path, { cache: "no-cache" }).then(function (r) {
      if (!r.ok) throw new Error(path);
      return r.json();
    });
  }
  Promise.all([getJSON("content/site.json"), getJSON("content/works.json")]).then(function (d) {
    S = d[0]; WORKS = d[1].works || [];
    brand.innerHTML = esc(S.name) + "<small>" + esc(S.nickname || "") + "</small>";
    nav.innerHTML = (S.sections || []).map(function (s) {
      return '<a href="#' + s.slug + '"' + (s.gap ? ' class="gap"' : "") + ">" + esc(s.label) + "</a>";
    }).join("");
    window.addEventListener("hashchange", route);
    route();
  }).catch(function () {
    view.innerHTML = '<div class="empty">' + sleepy() + "<p>內容讀取失敗。請重新整理頁面；若在自己電腦上預覽，請用 docker compose up 開啟，不要直接點兩下 index.html。</p></div>";
  });
})();
