// ==UserScript==
// @name         Apptivo Tab Rename
// @namespace    http://tampermonkey.net/
// @version      1.2.0
// @description  Changes Tab name to Customer/Agent name and Case Number
// @author       Austin
// @match        https://app.apptivo.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apptivo.com
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ApptivoTabRename.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ApptivoTabRename.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const CASE_NUMBER_SELECTOR = 'span[ng-bind="uiGenOptions.objectIdx.caseNumber"]';

    const CUSTOMER_NAME_SELECTORS = [
        '#apptivo-attribute-container_case_cust_attr a',
        '#apptivo-attribute-container_cust_name_attr .viewObject'
    ];

    const AGENT_NAME_SELECTOR = '.apptivo-attribute-container-reference .chat-meta div[ng-bind-html]';

    function updateTitle() {
        try {
            let caseNumberText = '';
            const caseEl = document.querySelector(CASE_NUMBER_SELECTOR);
            if (caseEl && caseEl.innerText.trim().length > 0) {
                caseNumberText = caseEl.innerText.trim();
            }

            let finalTitle = '';

            if (caseNumberText.startsWith('Support_QA-')) {
                const cleanCaseNum = caseNumberText.replace('Support_QA-', '');
                const referenceEls = document.querySelectorAll(AGENT_NAME_SELECTOR);
                let agentName = '';

                for (let el of referenceEls) {
                    if (el.innerText && el.innerText.trim().length > 0) {
                        agentName = el.innerText.trim();
                        break;
                    }
                }

                if (agentName) {
                    finalTitle = `SupportQA #${cleanCaseNum} - ${agentName}`;
                } else {
                    finalTitle = `SupportQA #${cleanCaseNum}`;
                }

            } else {
                let customerName = '';
                for (const selector of CUSTOMER_NAME_SELECTORS) {
                    const el = document.querySelector(selector);
                    if (el && el.innerText.trim().length > 0) {
                        customerName = el.innerText.trim().replace(/\s+/g, ' ');
                        break;
                    }
                }

                if (customerName) {
                    if (caseNumberText) {
                        finalTitle = `${customerName} #${caseNumberText}`;
                    } else {
                        finalTitle = customerName;
                    }
                }
            }

            if (finalTitle && document.title !== finalTitle) {
                document.title = finalTitle;
            }

        } catch (e) {
        }
    }

    setInterval(updateTitle, 1000);

})();