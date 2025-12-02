// ==UserScript==
// @name         Apptivo Tab Rename
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Changes Tab name to Customer name
// @author       Austin
// @match        https://app.apptivo.com/app/cases.jsp*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apptivo.com
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ApptivoTabRename.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ApptivoTabRename.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const SELECTOR = '#apptivo-attribute-container_case_cust_attr a';

    let lastSetCustomerName = '';

    function updateTitle() {
        try {
            const element = document.querySelector(SELECTOR);

            if (element) {
                let customerName = element.innerText.trim().replace(/\s+/g, ' ');

                if (customerName && document.title.startsWith(customerName)) {
                    return;
                }

                if (customerName) {
                    let currentTitle = document.title;

                    if (lastSetCustomerName && currentTitle.startsWith(lastSetCustomerName)) {
                        currentTitle = currentTitle.replace(lastSetCustomerName + ' | ', '');
                    }

                    document.title = `${customerName}`;

                    lastSetCustomerName = customerName;
                }
            }
        } catch (e) {
        }
    }

    setInterval(updateTitle, 1000);

})();