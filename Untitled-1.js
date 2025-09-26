//gw.yad2.co.il/realestate-item/9giqcfjq



downloadAll([... new Set($$('a[href*="item"][href*="realestate/item"]').map(a=>a.href).map(h=>h.split('?')[0]).map(h=>h.replace('www','gw')).map(h=>h.replace('realestate/item','realestate-item')))]
  $$('a[href*="item"][href*="realestate/item"]')
    .map((a) => a.href)
    .map((h) => h.split("?")[0])
    .map((h) => h.replace("www", "gw"))
    .map((h) => h.replace("realestate/item", "realestate-item"))
);


[... new Set($$('a[href*="item"][href*="realestate/item"]').map(a=>a.href).map(h=>h.split('?')[0]).map(h=>h.replace('www','gw')).map(h=>h.replace('realestate/item','realestate-item')))]



(function () {
  console.log('~')
  const PATTERN = /.*rent\.json.*/; // <-- change me
    //https://www.yad2.co.il/realestate/_next/data/EP8KxKdIcW5myv-UsXeDL/rent.json?page=5
    

  const mimeToExt = (ct = "") =>
    ct.includes("json") ? "json" :
    ct.includes("csv")  ? "csv"  :
    ct.includes("xml")  ? "xml"  : "bin";

  const triggerDownload = (blob, url, contentType) => {
    const u = new URL(url);
    const ts = new Date().toISOString().replace(/[:.]/g, "-");
    const ext = mimeToExt(contentType);
    const fname = `${u.hostname}${u.pathname.replace(/\W+/g, "_")}_${ts}.${ext}`;

    const obj = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = obj;
    a.download = fname;
    document.documentElement.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(obj), 5000);
  };

  // --- fetch ---
  const _fetch = window.fetch;
  window.fetch = async function (...args) {
    const req = new Request(...args);
    const res = await _fetch(req);
    try {
      if (PATTERN.test(req.url)) {
        const clone = res.clone();
        const ct = clone.headers.get("content-type") || "";
        const buf = await clone.arrayBuffer();
        triggerDownload(new Blob([buf], { type: ct }), req.url, ct);
      }
    } catch (_) {}
    return res;
  };

  // --- XHR ---
  const _open = XMLHttpRequest.prototype.open;
  const _send = XMLHttpRequest.prototype.send;
  XMLHttpRequest.prototype.open = function (method, url, ...rest) {
    this.__url = url;
    return _open.call(this, method, url, ...rest);
  };
  XMLHttpRequest.prototype.send = function (...args) {
    this.addEventListener("load", function () {
      try {
        if (PATTERN.test(this.responseURL)) {
          const ct = this.getResponseHeader("content-type") || "";
          let data;
          if (this.responseType === "" || this.responseType === "text") {
            data = new Blob([this.responseText], { type: ct || "text/plain" });
          } else if (this.responseType === "arraybuffer") {
            data = new Blob([this.response], { type: ct || "application/octet-stream" });
          } else if (this.responseType === "blob") {
            data = this.response;
          } else {
            // fallback
            data = new Blob([String(this.response)], { type: "application/octet-stream" });
          }
          triggerDownload(data, this.responseURL, ct);
        }
      } catch (_) {}
    });
    return _send.apply(this, args);
  };
})();






let links = [... new Set($$('a[href*="item"][href*="realestate/item"]').map(a=>a.href).map(h=>h.split('?')[0]).map(h=>h.replace('www','gw')).map(h=>h.replace('realestate/item','realestate-item')))]

(function() {
    'use strict';
    window.sleep = (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    window.downloadFile = async (url)=> {
        const ts = new Date().toISOString().replace(/[:.]/g, "-");

      const token = url.split('?')[0].split('/').pop()  
        console.log('Downloading', token)
        const u = new URL(url);
        localStorage.setItem('lastDownloaded', url)
        const ext = 'json';
        const fname = `${u.hostname}${u.pathname.replace(/\W+/g, "_")}_${ts}.${ext}`;

        const res = await fetch(url)
        const json = await res.text()
        const data = new Blob([json], { type: "text/plain" } )
        const obj = URL.createObjectURL(data);
        const a = document.createElement('a');
        a.href = obj;
        a.download = fname;
        a.style.display = 'none';

        // Append to the document to enable click in Firefox
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        await window.sleep(5000)
    }

    window.downloadAll = async (links)=>{
        for (const link of links) {
            await window.downloadFile(link)
        }
    }


    // Your code here...
})();

downloadAll(links)




