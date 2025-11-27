// ==UserScript==
// @name         Highlight Root Rows
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Highlight rows where the Owner is "Root"
// @author       Austin
// @match        https://pohrib.gybsupport.com:444/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gybsupport.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/HighlightRootRows.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/HighlightRootRows.js
// ==/UserScript==

(function() {
    'use strict';

    function colorizeRows() {
        const table = document.getElementById('main-table');
        if (!table) return;

        const rows = table.querySelectorAll('tbody tr');

        rows.forEach(row => {
            const cells = Array.from(row.children);
            const isRoot = cells.some(td => td.innerText.trim() === 'root:root');

            if (isRoot) {
                row.style.cssText = "background-color: #d1e7dd !important;";
            }
        });
    }

    colorizeRows();

    const observer = new MutationObserver(() => {
        colorizeRows();
    });

    const tableBody = document.querySelector('#main-table tbody');
    if (tableBody) {
        observer.observe(tableBody, { childList: true });
    }
})();