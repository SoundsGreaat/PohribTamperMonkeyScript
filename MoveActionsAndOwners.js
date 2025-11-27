// ==UserScript==
// @name         Move Actions & Owner to Left
// @namespace    http://tampermonkey.net/
// @version      1.0.2
// @description  Move Actions and Owner columns to the left side of the table
// @author       Austin
// @match        https://pohrib.gybsupport.com:444/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gybsupport.com
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/MoveActionsAndOwners.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/MoveActionsAndOwners.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const targetTableId = 'main-table';

    function reorderColumns() {
        const table = document.getElementById(targetTableId);
        if (!table) return;

        const theadRow = table.querySelector('thead tr');
        if (!theadRow) return;

        const headers = Array.from(theadRow.children);

        const actionsTh = headers.find(th => th.innerText.includes('Actions'));
        const ownerTh = headers.find(th => th.innerText.includes('Owner'));

        const actionsIndex = headers.indexOf(actionsTh);
        const ownerIndex = headers.indexOf(ownerTh);

        if (actionsIndex === -1 || ownerIndex === -1) return;

        if (theadRow.children[1] === actionsTh && theadRow.children[2] === ownerTh) {
            return;
        }

        theadRow.insertBefore(actionsTh, theadRow.children[1]);
        theadRow.insertBefore(ownerTh, theadRow.children[3]);


        const rows = table.querySelectorAll('tbody tr');
        rows.forEach(row => {
            const cells = Array.from(row.children);
            const actionsTd = cells[actionsIndex];
            const ownerTd = cells[ownerIndex];

            if (actionsTd && ownerTd) {
                row.insertBefore(actionsTd, row.children[1]);
                row.insertBefore(ownerTd, row.children[3]);
            }
        });
    }

    reorderColumns();

    const observer = new MutationObserver(() => {
        reorderColumns();
    });

    const tableBody = document.querySelector(`#${targetTableId} tbody`);
    if (tableBody) {
        observer.observe(tableBody, { childList: true });
    }
})();