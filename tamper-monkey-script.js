// ==UserScript==
// @name         Apartments
// @namespace    http://tampermonkey.net/
// @version      2025-09-26
// @description  try to take over the world!
// @author       You
// @match        https://www.yad2.co.il/realestate/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=co.il
// @run-at       document-end
// @grant        unsafeWindow
// ==/UserScript==
(function () {
  "use strict";
  window.sleep = (ms) => {
    return new Promise((resolve) => setTimeout(resolve, ms));
  };

  window.downloadFile = async (url) => {
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const tsToday = new Date().toISOString().split("T")[0];
    const token = url.split("?")[0].split("/").pop();
    if (
      unsafeWindow.localStorage
        .getItem("already_loaded_tokens_" + tsToday)
        ?.includes(token)
    ) {
      console.log("Skipping", token);
      return;
    }
    unsafeWindow.localStorage.setItem(
      "already_loaded_tokens",
      (unsafeWindow.localStorage.getItem("already_loaded_tokens_" + tsToday) ||
        "") +
        "," +
        token
    );
    console.log("Downloading", token);
    const u = new URL(url);
    const ext = "json";
    const fname = `${u.hostname}${u.pathname.replace(
      /\W+/g,
      "_"
    )}_${ts}.${ext}`;

    const res = await fetch(url);
    const json = await res.text();
    const data = new Blob([json], { type: "text/plain" });
    const obj = URL.createObjectURL(data);
    const a = document.createElement("a");
    a.href = obj;
    a.download = fname;
    a.style.display = "none";

    // Append to the document to enable click in Firefox
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    await window.sleep(5000);
  };

  window.downloadAll = async (links) => {
    for (const link of links) {
      await window.downloadFile(link);
    }
  };

  function waitForEl(selector, cb, root = document) {
    const el = root.querySelector(selector);
    if (el) return cb(el);

    const mo = new MutationObserver(() => {
      const found = root.querySelector(selector);
      if (found) {
        mo.disconnect();
        cb(found);
      }
    });
    mo.observe(root, { childList: true, subtree: true });
  }

  waitForEl('a[href*="item"][href*="realestate/item"]', (el) => {
    console.log("Found!", el);
    console.log("~~~");
    let links = [
      ...new Set(
        [
          ...document.querySelectorAll(
            'a[href*="item"][href*="realestate/item"]'
          ),
        ]
          .map((a) => a.href)
          .map((h) => h.split("?")[0])
          .map((h) => h.replace("www", "gw"))
          .map((h) => h.replace("realestate/item", "realestate-item"))
      ),
    ];

    window.downloadAll(links);
  });

  // Your code here...
})();
