(function () {
  const selections = {};

  // ── Client Name ──

  function getClientName() {
    var parts = window.location.pathname.split("/").filter(Boolean);
    var last = parts[parts.length - 1] || "";
    // If the last segment is a file (has an extension), step back one
    var folder = last.indexOf(".") !== -1 ? parts[parts.length - 2] : last;
    var name = folder || "client";
    return name.charAt(0).toUpperCase() + name.slice(1);
  }

  var CLIENT_NAME = getClientName();

  // ── Render ──

  function init() {
    document.getElementById("client-name").textContent = CLIENT_NAME;
    document.getElementById("description").textContent = CONFIG.description;

    readHash();
    renderGallery();

    document.getElementById("btn-submit").addEventListener("click", submitMailto);
    document.getElementById("btn-copy").addEventListener("click", copyURL);
    document.getElementById("btn-download").addEventListener("click", downloadZip);
    document.getElementById("panel-expand-btn").addEventListener("click", toggleExpand);
  }

  function toggleExpand() {
    var panel = document.getElementById("selection-panel");
    panel.classList.toggle("panel-expanded");
  }

  function renderGallery() {
    const gallery = document.getElementById("gallery");
    gallery.innerHTML = "";

    CONFIG.assets.forEach(function (filename) {
      const card = document.createElement("div");
      card.className = "asset-card";
      card.dataset.asset = filename;

      const label = document.createElement("span");
      label.className = "asset-label";
      label.textContent = filename;
      card.appendChild(label);

      const ext = filename.split(".").pop().toLowerCase();
      let media;

      if (ext === "mp4" || ext === "webm" || ext === "mov") {
        media = document.createElement("video");
        media.src = "_assets/" + filename;
        media.controls = true;
        media.loop = true;
        media.muted = true;
        media.playsInline = true;
      } else {
        media = document.createElement("img");
        media.src = "_assets/" + filename;
        media.alt = filename;
        media.loading = "lazy";
      }

      card.appendChild(media);

      const buttons = document.createElement("div");
      buttons.className = "selection-buttons";

      const loveBtn = document.createElement("button");
      loveBtn.type = "button";
      loveBtn.className = "love-btn";
      loveBtn.textContent = "Love";
      loveBtn.addEventListener("click", function () {
        toggle(filename, "love");
      });

      const hateBtn = document.createElement("button");
      hateBtn.type = "button";
      hateBtn.className = "hate-btn";
      hateBtn.textContent = "Hate";
      hateBtn.addEventListener("click", function () {
        toggle(filename, "hate");
      });

      buttons.appendChild(loveBtn);
      buttons.appendChild(hateBtn);
      card.appendChild(buttons);

      gallery.appendChild(card);
    });

    syncButtonStates();
  }

  // ── Selection Logic ──

  var LIMITS = { love: 5, hate: 4 };
  var toastTimer = null;

  function showToast(msg) {
    var el = document.getElementById("toast");
    el.textContent = msg;
    el.classList.add("toast-show");
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("toast-show");
    }, 2800);
  }

  function toggle(filename, choice) {
    if (selections[filename] === choice) {
      delete selections[filename];
    } else {
      var currentCount = Object.values(selections).filter(function (v) {
        return v === choice;
      }).length;
      if (currentCount >= LIMITS[choice]) {
        var label = choice === "love" ? "love" : "hate";
        var limit = LIMITS[choice];
        showToast("You've reached your " + limit + " " + label + " limit — remove one to swap it out");
        return;
      }
      selections[filename] = choice;
    }
    syncButtonStates();
    writeHash();
  }

  function syncButtonStates() {
    document.querySelectorAll(".asset-card").forEach(function (card) {
      var asset = card.dataset.asset;
      var loveBtn = card.querySelector(".love-btn");
      var hateBtn = card.querySelector(".hate-btn");

      loveBtn.classList.toggle("love-active", selections[asset] === "love");
      hateBtn.classList.toggle("hate-active", selections[asset] === "hate");
    });

    syncPanel();
  }

  function syncPanel() {
    var panel = document.getElementById("selection-panel");
    var thumbsEl = document.getElementById("panel-thumbnails");

    var loved = CONFIG.assets.filter(function (f) { return selections[f] === "love"; });
    var hated = CONFIG.assets.filter(function (f) { return selections[f] === "hate"; });

    if (loved.length === 0 && hated.length === 0) {
      panel.classList.remove("panel-visible");
      panel.classList.remove("panel-expanded");
      document.body.classList.remove("panel-open");
      return;
    }

    panel.classList.add("panel-visible");
    document.body.classList.add("panel-open");

    thumbsEl.innerHTML = "";

    ["love", "hate"].forEach(function (choice) {
      var list = choice === "love" ? loved : hated;

      var group = document.createElement("div");
      group.className = "panel-group " + choice + "-group";

      var iconBox = document.createElement("div");
      iconBox.className = "panel-group-icon";
      if (choice === "love") {
        iconBox.innerHTML =
          '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 0 1-.383-.218 25.18 25.18 0 0 1-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0 1 12 5.052 5.5 5.5 0 0 1 16.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 0 1-4.244 3.17 15.247 15.247 0 0 1-.383.218l-.022.012-.007.003-.003.001a.752.752 0 0 1-.704 0l-.003-.001z"/>' +
          '</svg>';
      } else {
        iconBox.innerHTML =
          '<svg viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">' +
          '<path d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06z"/>' +
          '</svg>';
      }
      group.appendChild(iconBox);

      var countEl = document.createElement("span");
      countEl.className = "panel-group-count";
      countEl.textContent = list.length;
      group.appendChild(countEl);

      var thumbsRow = document.createElement("div");
      thumbsRow.className = "panel-group-thumbs";

      if (list.length === 0) {
        var empty = document.createElement("span");
        empty.className = "panel-group-empty";
        empty.textContent = "None";
        thumbsRow.appendChild(empty);
      } else {
        list.forEach(function (filename) {
          var ext = filename.split(".").pop().toLowerCase();
          var isVideo = ext === "mp4" || ext === "webm" || ext === "mov";

          var thumb = document.createElement("div");
          thumb.className = "panel-thumb " + choice + "-thumb";

          if (isVideo) {
            var vid = document.createElement("video");
            vid.src = "_assets/" + filename;
            vid.muted = true;
            vid.playsInline = true;
            thumb.appendChild(vid);
          } else {
            var img = document.createElement("img");
            img.src = "_assets/" + filename;
            img.alt = filename;
            thumb.appendChild(img);
          }

          var deleteOverlay = document.createElement("div");
          deleteOverlay.className = "panel-thumb-delete";
          deleteOverlay.innerHTML =
            '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
            '<line x1="3" y1="3" x2="13" y2="13"/>' +
            '<line x1="13" y1="3" x2="3" y2="13"/>' +
            '</svg>';
          deleteOverlay.addEventListener("click", (function (f) {
            return function () {
              delete selections[f];
              syncButtonStates();
              writeHash();
            };
          })(filename));
          thumb.appendChild(deleteOverlay);

          thumbsRow.appendChild(thumb);
        });
      }

      group.appendChild(thumbsRow);
      thumbsEl.appendChild(group);
    });

    renderExpandedView(loved, hated);
  }

  function renderExpandedView(loved, hated) {
    var view = document.getElementById("panel-expanded-view");
    view.innerHTML = "";

    [
      { label: "Love", list: loved, choice: "love" },
      { label: "Hate", list: hated, choice: "hate" }
    ].forEach(function (group) {
      if (group.list.length === 0) return;

      var section = document.createElement("div");
      section.className = "expanded-section";

      var labelEl = document.createElement("div");
      labelEl.className = "expanded-section-label " + group.choice + "-label";
      labelEl.textContent = group.label + " (" + group.list.length + ")";
      section.appendChild(labelEl);

      var grid = document.createElement("div");
      grid.className = "expanded-grid";

      group.list.forEach(function (filename) {
        var ext = filename.split(".").pop().toLowerCase();
        var isVideo = ext === "mp4" || ext === "webm" || ext === "mov";

        var thumb = document.createElement("div");
        thumb.className = "expanded-thumb";

        if (isVideo) {
          var vid = document.createElement("video");
          vid.src = "_assets/" + filename;
          vid.muted = true;
          vid.playsInline = true;
          thumb.appendChild(vid);
        } else {
          var img = document.createElement("img");
          img.src = "_assets/" + filename;
          img.alt = filename;
          thumb.appendChild(img);
        }

        var delBtn = document.createElement("button");
        delBtn.className = "expanded-thumb-delete";
        delBtn.type = "button";
        delBtn.innerHTML =
          '<svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">' +
          '<line x1="4" y1="4" x2="12" y2="12"/>' +
          '<line x1="12" y1="4" x2="4" y2="12"/>' +
          '</svg>';
        delBtn.addEventListener("click", (function (f) {
          return function () {
            delete selections[f];
            syncButtonStates();
            writeHash();
          };
        })(filename));
        thumb.appendChild(delBtn);

        grid.appendChild(thumb);
      });

      section.appendChild(grid);
      view.appendChild(section);
    });
  }

  // ── URL Hash State ──

  function writeHash() {
    var loved = [];
    var hated = [];

    Object.keys(selections).forEach(function (key) {
      var name = key.replace(/\.[^.]+$/, "");
      if (selections[key] === "love") loved.push(name);
      else if (selections[key] === "hate") hated.push(name);
    });

    var parts = [];
    if (loved.length) parts.push("love=" + loved.join(","));
    if (hated.length) parts.push("hate=" + hated.join(","));

    var hash = parts.length ? "#" + parts.join("&") : "";
    history.replaceState(null, "", window.location.pathname + hash);
  }

  function readHash() {
    var hash = window.location.hash.slice(1);
    if (!hash) return;

    var params = hash.split("&");
    params.forEach(function (param) {
      var parts = param.split("=");
      if (parts.length !== 2) return;

      var choice = parts[0];
      var names = parts[1].split(",");

      if (choice !== "love" && choice !== "hate") return;

      names.forEach(function (name) {
        var match = CONFIG.assets.find(function (a) {
          return a.replace(/\.[^.]+$/, "") === name;
        });
        if (match) {
          selections[match] = choice;
        }
      });
    });
  }

  // ── Submission ──

  function getSelectionLists() {
    var loved = [];
    var hated = [];

    CONFIG.assets.forEach(function (filename) {
      if (selections[filename] === "love") loved.push(filename);
      else if (selections[filename] === "hate") hated.push(filename);
    });

    return { loved: loved, hated: hated };
  }

  function getAssetBaseURL() {
    // Resolve the _assets/ folder as an absolute URL relative to this page
    var href = window.location.href.split("#")[0].split("?")[0];
    var base = href.substring(0, href.lastIndexOf("/") + 1);
    return base + "_assets/";
  }

  function submitMailto() {
    var lists = getSelectionLists();
    var subject = CLIENT_NAME + " Style Align Submission";
    var baseURL = getAssetBaseURL();

    var body = "Review URL:\n" + window.location.href + "\n\n";

    body += "━━━  LOVE (" + lists.loved.length + ")  ━━━\n\n";
    if (lists.loved.length) {
      lists.loved.forEach(function (f) {
        body += f + "\n" + baseURL + f + "\n\n";
      });
    } else {
      body += "(none)\n\n";
    }

    body += "━━━  HATE (" + lists.hated.length + ")  ━━━\n\n";
    if (lists.hated.length) {
      lists.hated.forEach(function (f) {
        body += f + "\n" + baseURL + f + "\n\n";
      });
    } else {
      body += "(none)\n\n";
    }

    var mailto =
      "mailto:" +
      encodeURIComponent(CONFIG.email) +
      "?subject=" +
      encodeURIComponent(subject) +
      "&body=" +
      encodeURIComponent(body);

    window.location.href = mailto;
  }

  function copyURL() {
    var btn = document.getElementById("btn-copy");
    var iconCopy = document.getElementById("icon-copy");
    var iconCheck = document.getElementById("icon-check");
    navigator.clipboard.writeText(window.location.href).then(function () {
      iconCopy.style.display = "none";
      iconCheck.style.display = "";
      btn.classList.add("copied");
      setTimeout(function () {
        iconCopy.style.display = "";
        iconCheck.style.display = "none";
        btn.classList.remove("copied");
      }, 2000);
    });
  }

  // ── Download ZIP ──

  function loadJSZip() {
    return new Promise(function (resolve, reject) {
      if (window.JSZip) return resolve(window.JSZip);
      var script = document.createElement("script");
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js";
      script.onload = function () { resolve(window.JSZip); };
      script.onerror = function () { reject(new Error("Failed to load JSZip")); };
      document.head.appendChild(script);
    });
  }

  function downloadZip() {
    var lists = getSelectionLists();
    if (lists.loved.length === 0 && lists.hated.length === 0) {
      showToast("Make some selections first");
      return;
    }

    var btn = document.getElementById("btn-download");
    btn.style.pointerEvents = "none";
    btn.style.opacity = "0.4";

    loadJSZip().then(function (JSZip) {
      var zip = new JSZip();
      var loveFolder = zip.folder("love");
      var hateFolder = zip.folder("hate");
      var fetches = [];

      lists.loved.forEach(function (filename) {
        fetches.push(
          fetch("_assets/" + filename)
            .then(function (r) { return r.blob(); })
            .then(function (blob) { loveFolder.file(filename, blob); })
        );
      });

      lists.hated.forEach(function (filename) {
        fetches.push(
          fetch("_assets/" + filename)
            .then(function (r) { return r.blob(); })
            .then(function (blob) { hateFolder.file(filename, blob); })
        );
      });

      return Promise.all(fetches).then(function () {
        return zip.generateAsync({ type: "blob" });
      });
    }).then(function (content) {
      var a = document.createElement("a");
      a.href = URL.createObjectURL(content);
      a.download = CLIENT_NAME + "_style_align.zip";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(a.href);
    }).catch(function () {
      showToast("Download failed — try again");
    }).finally(function () {
      btn.style.pointerEvents = "";
      btn.style.opacity = "";
    });
  }

  // ── Boot ──

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
