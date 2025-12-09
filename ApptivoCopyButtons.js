// ==UserScript==
// @name         Apptivo Copy Buttons
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Adds separate copy buttons under each LMI/TV ID in Apptivo
// @author       Austin
// @match        https://app.apptivo.com/app/cases.jsp*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apptivo.com
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ApptivoCopyButtons.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ApptivoCopyButtons.js
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    const TARGET_CONTAINER_ID = "apptivo-attribute-container_input_1554640209203_351_1268321554640209203_190";

    function processLmiField() {
        const container = document.getElementById(TARGET_CONTAINER_ID);
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
            wrapper.style.display = 'flex';
            wrapper.style.flexDirection = 'column';
            wrapper.style.alignItems = 'flex-start';

            const idSpan = document.createElement('span');
            idSpan.textContent = id;
            idSpan.style.fontWeight = 'bold';
            idSpan.style.marginBottom = '3px';
            idSpan.style.color = '#333';

            const copyBtn = document.createElement('button');
            copyBtn.textContent = 'Copy';
            copyBtn.style.cursor = 'pointer';
            copyBtn.style.fontSize = '10px';
            copyBtn.style.padding = '2px 8px';
            copyBtn.style.border = '1px solid #ccc';
            copyBtn.style.borderRadius = '3px';
            copyBtn.style.backgroundColor = '#f0f0f0';
            copyBtn.style.lineHeight = '1.2';

            copyBtn.onclick = function(e) {
                e.preventDefault();
                e.stopPropagation();

                navigator.clipboard.writeText(id).then(() => {
                    const originalText = copyBtn.textContent;
                    copyBtn.textContent = 'Copied!';
                    copyBtn.style.backgroundColor = '#dff0d8';
                    setTimeout(() => {
                        copyBtn.textContent = originalText;
                        copyBtn.style.backgroundColor = '#f0f0f0';
                    }, 1500);
                });
            };

            wrapper.appendChild(idSpan);
            wrapper.appendChild(copyBtn);
            viewObject.appendChild(wrapper);
        });

        viewObject.dataset.processed = "true";
    }

    const observer = new MutationObserver((mutations) => {
        processLmiField();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

    processLmiField();

})();