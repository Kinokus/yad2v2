// ==UserScript==
// @name         Apartments
// @namespace    http://tampermonkey.net/
// @version      2025-09-30
// @description  try to take over the world!
// @author       You
// @match        https://www.yad2.co.il/realestate/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=co.il
// @run-at       document-end
// @grant        unsafeWindow
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_deleteValue
// @grant        GM_listValues
// ==/UserScript==
(async function () {
    "use strict";


    function getStartOfWeek(date = new Date()) {
        const d = new Date(date);
        const day = d.getDay(); // 0 = Sunday, 1 = Monday, ... 6 = Saturday
        const diff = (day === 0 ? -6 : 1) - day; // Monday as start
        d.setDate(d.getDate() + diff);
        d.setHours(0, 0, 0, 0);
        return d;
    }

    function formatYYMMDD(date) {
        const yy = String(date.getFullYear()).slice(-2);
        const mm = String(date.getMonth() + 1).padStart(2, "0"); // month is 0-based
        const dd = String(date.getDate()).padStart(2, "0");
        return `${yy}${mm}${dd}`;
    }

    async function downloadAll(links) {
        for (const [idx, link] of links.entries()) {
            console.log(idx, links.length, link)
            await downloadFile(link);
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

    function onUrlChange() {
        console.log('URL changed to:', location.href);
        waitForEl('a[href*="item"][href*="realestate/item"]', (el) => {
            console.log('Found!', el);
            let links = [
                ...new Set(
                    [...document.querySelectorAll('a[href*="item"][href*="realestate/item"]')]
                    .map((a) => a.href)
                    .map((h) => h.split("?")[0])
                    .map((h) => h.replace("www", "gw"))
                    .map((h) => h.replace("realestate/item", "realestate-item"))
                ),
            ];
            downloadAll(links).then(()=>{
                console.log('~~~\npage complete\n~~~')
                document.querySelector('a[aria-label="עמוד הבא"]')?.click()
            });
        });
        // do something here...
    }

    // Patch pushState/replaceState
    const _pushState = history.pushState;
    history.pushState = function(...args) {
        _pushState.apply(this, args);
        window.dispatchEvent(new Event('urlchange'));
    };
    const _replaceState = history.replaceState;
    history.replaceState = function(...args) {
        _replaceState.apply(this, args);
        window.dispatchEvent(new Event('urlchange'));
    };

    // Listen to back/forward navigation
    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('urlchange'));
    });

    // Subscribe
    window.addEventListener('urlchange', onUrlChange);

    // Run initially too
    onUrlChange();

    window.sleep = (ms) => {
        return new Promise((resolve) => setTimeout(resolve, ms));
    };

    async function downloadFile (url) {
        const tsToday = formatYYMMDD(getStartOfWeek(new Date()));
        const token = url.split("?")[0].split("/").pop();
        const todayLoaded = await GM.getValue("already_loaded_tokens_" + tsToday)
        //console.log(tsToday, todayLoaded)
        if (
            todayLoaded?.includes(token)
        ) {
            console.log("Skipping", token);
            return;
        }
        await GM.setValue(
            "already_loaded_tokens_"+tsToday,
            (todayLoaded || "") +
            "," +
            token
        );
        console.log("Downloading", token);
        const u = new URL(url);
        const ext = "json";
        const fname = `${u.hostname}${u.pathname.replace(
            /\W+/g,
            "_"
        )}_${tsToday}.${ext}`;

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







    // Your code here...
})();
