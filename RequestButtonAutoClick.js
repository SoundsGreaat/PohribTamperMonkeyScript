// ==UserScript==
// @name         Auto Click Request Button
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  try to take over the world!
// @author       Austin
// @match        https://pohrib.gybsupport.com:444/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gybsupport.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/RequestButtonAutoClick.js
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/RequestButtonAutoClick.js
// ==/UserScript==

(function() {
    'use strict';

    let hasClicked = false;

    setInterval(function() {
        if (typeof $ === 'undefined') return;

        const $modal = $('#requestFileAccessModal');
        const $fileName = $('#accessModalFileName');
        const $btn = $('.requestFileAccessModalRequestButton');

        if (!$modal.is(':visible')) {
            hasClicked = false;
            return;
        }

        if (hasClicked) return;

        if ($fileName.text().trim().length === 0) {
            return;
        }

        if ($btn.length > 0 && !$btn.prop('disabled')) {
            hasClicked = true;

            $btn.trigger('click');

            setTimeout(() => {
                if ($btn[0]) $btn[0].click();
            }, 50);
        }

    }, 300);

})();