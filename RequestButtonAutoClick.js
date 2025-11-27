// ==UserScript==
// @name         Auto Click Request Button & Unlock Icon
// @namespace    http://tampermonkey.net/
// @version      1.0.3
// @description  Automatically clicks request and updates lock icon on Pohrib
// @author       Austin
// @match        https://pohrib.gybsupport.com:444/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gybsupport.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/RequestButtonAutoClick.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/RequestButtonAutoClick.js
// ==/UserScript==

(function () {
    'use strict';

    let hasClicked = false;

    setInterval(function () {
        if (typeof $ === 'undefined') return;

        const $modal = $('#requestFileAccessModal');
        const $fileNameElement = $('#accessModalFileName');
        const $btn = $('.requestFileAccessModalRequestButton');

        if (!$modal.is(':visible')) {
            hasClicked = false;
            return;
        }

        if (hasClicked) return;

        let currentFileName = $fileNameElement.text().trim();

        if (currentFileName.length === 0) {
            return;
        }

        if ($btn.length > 0 && !$btn.prop('disabled')) {
            hasClicked = true;

            $btn.trigger('click');
            setTimeout(() => {
                if ($btn[0]) $btn[0].click();
            }, 50);

            updateLockIcon(currentFileName);
        }

    }, 300);

    function updateLockIcon(fileName) {
        let safeFileName = fileName.replace(/"/g, '\\"');
        let $lockLink = $('a.access_button[file_name="' + safeFileName + '"]');

        if ($lockLink.length > 0) {
            $lockLink.attr('access_status', 'allowed');
            $lockLink.attr('title', 'Access Granted');

            let $icon = $lockLink.find('i');

            if ($icon.hasClass('fa-lock')) {
                $icon.removeClass('fa-lock').addClass('fa-unlock');
            }
        }
    }

})();