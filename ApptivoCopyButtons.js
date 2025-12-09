// ==UserScript==
// @name         Apptivo Copy Buttons
// @namespace    http://tampermonkey.net/
// @version      1.4.1
// @description  Adds copy buttons for LMI/TV IDs, Phone, Email, and Customer Name in Apptivo
// @author       Austin
// @match        https://app.apptivo.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apptivo.com
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ApptivoCopyButtons.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ApptivoCopyButtons.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const style = document.createElement('style');
    style.innerHTML = `
        .apptivo-copy-btn {
            background-color: #4A90E2;
            color: white;
            border: none;
            border-radius: 4px;
            padding: 3px 10px;
            font-size: 11px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s ease;
            box-shadow: 0 1px 3px rgba(0,0,0,0.15);
            line-height: 1.4;
            text-align: center;
        }
        .apptivo-copy-btn:hover {
            background-color: #357ABD;
            box-shadow: 0 2px 5px rgba(0,0,0,0.25);
            transform: translateY(-1px);
        }
        .apptivo-copy-btn:active {
            transform: translateY(0);
            box-shadow: 0 1px 2px rgba(0,0,0,0.1);
        }
        .apptivo-copy-btn.copied {
            background-color: #5CB85C !important;
            pointer-events: none;
        }
        .lmi-id-wrapper {
            display: flex;
            flex-direction: column;
            width: fit-content;
            align-items: stretch;
        }
    `;
    document.head.appendChild(style);

    const LMI_CONTAINER_ID = "apptivo-attribute-container_input_1554640209203_351_1268321554640209203_190";

    const SIMPLE_FIELDS = [
        {
            name: "Ref Phone Field",
            containerId: "apptivo-attribute-container_referenceField_59_1015",
            selector: "font[cleavevalue='phoneNumbers']"
        },
        {
            name: "Ref Email Field",
            containerId: "apptivo-attribute-container_referenceField_1557691443950_485_998651557691443950_929",
            selector: "a"
        },
        {
            name: "Customer Name",
            containerId: "apptivo-attribute-container_case_cust_attr",
            selector: ".chat-meta a"
        },
        {
            name: "Main Phone Attribute",
            containerId: "apptivo-attribute-container_cust_phone_attr",
            selector: "font[cleavevalue='phoneNumbers']"
        },
        {
            name: "Main Email Attribute",
            containerId: "apptivo-attribute-container_email_attr",
            selector: "a"
        }
    ];

    function createCopyButton(textToCopy, isFullWidth = false) {
        const copyBtn = document.createElement('button');
        copyBtn.textContent = 'Copy';
        copyBtn.className = 'apptivo-copy-btn';

        if (isFullWidth) {
            copyBtn.style.width = '100%';
            copyBtn.style.marginTop = '2px';
        } else {
            copyBtn.style.marginLeft = '10px';
        }

        copyBtn.onclick = function(e) {
            e.preventDefault();
            e.stopPropagation();

            navigator.clipboard.writeText(textToCopy).then(() => {
                const originalText = copyBtn.textContent;
                copyBtn.textContent = 'Copied!';
                copyBtn.classList.add('copied');

                setTimeout(() => {
                    copyBtn.textContent = originalText;
                    copyBtn.classList.remove('copied');
                }, 1500);
            });
        };
        return copyBtn;
    }

    function processLmiField() {
        const container = document.getElementById(LMI_CONTAINER_ID);
        if (!container) return;

        const viewObject = container.querySelector('.viewObject');
        if (!viewObject) return;

        if (viewObject.dataset.processed === "true") return;

        const rawText = viewObject.innerText.trim();
        if (!rawText) return;

        const ids = rawText.split(/\s+/);

        viewObject.innerHTML = '';
        viewObject.style.display = 'flex';
        viewObject.style.flexWrap = 'wrap';
        viewObject.style.gap = '15px';

        ids.forEach(id => {
            const wrapper = document.createElement('div');
            wrapper.className = 'lmi-id-wrapper';

            const idSpan = document.createElement('span');
            idSpan.textContent = id;
            idSpan.style.fontWeight = 'bold';
            idSpan.style.marginBottom = '2px';
            idSpan.style.color = '#333';
            idSpan.style.textAlign = 'center';

            const copyBtn = createCopyButton(id, true);

            wrapper.appendChild(idSpan);
            wrapper.appendChild(copyBtn);
            viewObject.appendChild(wrapper);
        });

        viewObject.dataset.processed = "true";
    }

    function processSimpleFields() {
        SIMPLE_FIELDS.forEach(fieldConfig => {
            const container = document.getElementById(fieldConfig.containerId);
            if (!container) return;

            const targetElement = container.querySelector(fieldConfig.selector);

            if (!targetElement) return;
            if (targetElement.dataset.processed === "true") return;

            const textToCopy = targetElement.innerText.trim();
            if (!textToCopy) return;

            const copyBtn = createCopyButton(textToCopy, false);
            copyBtn.style.verticalAlign = 'middle';

            if (targetElement.parentNode) {
                targetElement.parentNode.insertBefore(copyBtn, targetElement.nextSibling);
            }

            targetElement.dataset.processed = "true";
        });
    }

    const observer = new MutationObserver((mutations) => {
        processLmiField();
        processSimpleFields();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    processLmiField();
    processSimpleFields();

})();