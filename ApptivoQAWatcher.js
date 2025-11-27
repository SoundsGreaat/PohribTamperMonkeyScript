// ==UserScript==
// @name         Apptivo QA Watcher
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Watches for QA comments
// @author       Austin
// @match        https://app.apptivo.com/app/cases.jsp*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apptivo.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/RequestButtonAutoClick.js
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/RequestButtonAutoClick.js
// ==/UserScript==

(function() {
    'use strict';

    let isMinimized = localStorage.getItem('qa_watcher_minimized') === 'true';

    const initialHeight = isMinimized ? '40px' : '350px';

    const $box = $('<div id="qa-watcher-box"></div>').css({
        'position': 'fixed',
        'bottom': '10px',
        'left': '10px',
        'width': '450px',
        'height': initialHeight,
        'background': '#fff',
        'border': '2px solid #d9534f',
        'z-index': '999999',
        'box-shadow': '0 0 15px rgba(0,0,0,0.3)',
        'display': 'none',
        'flex-direction': 'column',
        'font-family': 'Segoe UI, Arial, sans-serif',
        'border-radius': '8px',
        'font-size': '13px',
        'transition': 'height 0.3s ease'
    });

    const $header = $('<div id="qa-watcher-header"></div>').css({
        'background': '#d9534f',
        'color': '#fff',
        'padding': '8px 12px',
        'cursor': 'pointer',
        'font-weight': 'bold',
        'border-radius': '6px 6px 0 0',
        'display': 'flex',
        'justify-content': 'space-between',
        'align-items': 'center'
    }).html('<span>QA Updates Found</span> <span id="qa-count" style="background:white; color:#d9534f; padding:0 6px; border-radius:10px; font-size:11px;">0</span>');

    const $content = $('<div id="qa-watcher-content"></div>').css({
        'flex': '1',
        'overflow-y': 'auto',
        'padding': '10px',
        'background': '#f9f9f9',
        'display': isMinimized ? 'none' : 'block'
    });

    $('body').append($box);
    $box.append($header);
    $box.append($content);

    $header.on('click', function() {
        if (isMinimized) {
            $box.css('height', '350px');
            $content.show();
            isMinimized = false;
        } else {
            $box.css('height', '40px');
            $content.hide();
            isMinimized = true;
        }
        localStorage.setItem('qa_watcher_minimized', isMinimized);
    });

    const seenItems = new Set();
    let isScanning = false;
    let lastCaseId = null;

    function getCaseIdFromUrl() {
        const match = window.location.hash.match(/\/view\/(\d+)\//);
        return match ? match[1] : null;
    }

    function resetWidget() {
        seenItems.clear();
        $content.empty();
        $('#qa-count').text('0');
        $('#qa-watcher-frame').remove();
        isScanning = false;
        $header.find('span:first').text('QA Updates Found');
    }

    function checkState() {
        const currentId = getCaseIdFromUrl();

        if (currentId) {
            if ($box.css('display') === 'none') {
                $box.css('display', 'flex');
            }
        } else {
            $box.hide();
            if (lastCaseId !== null) {
                lastCaseId = null;
                resetWidget();
            }
            return;
        }

        if (currentId !== lastCaseId) {
            lastCaseId = currentId;
            resetWidget();
            scanFeed();
        }
    }

    function parseDom($context) {
        const newsEntries = $context.find('.newsfeed-cntr');
        newsEntries.each(function() {
            const $container = $(this);
            const $msgBlock = $container.find('.stable-responsive');
            const htmlContent = $msgBlock.html();

            if (!htmlContent || !htmlContent.includes("Comment for QA")) return;

            let authorName = $container.find('.text-cmtname').text().trim() || "Unknown Author";
            let timeStr = $container.find('.likerow .pull-right.ng-binding').text().trim() || "Unknown Time";

            const lines = htmlContent.split(/<br\s*\/?>/i);
            lines.forEach(line => {
                const tempDiv = $('<div>').html(line);
                const cleanText = tempDiv.text().trim();
                if (cleanText.includes("Comment for QA")) {
                    const uniqueKey = authorName + "|" + timeStr + "|" + cleanText;
                    if (!seenItems.has(uniqueKey)) {
                        seenItems.add(uniqueKey);
                        addEntryToBox(authorName, timeStr, cleanText);
                    }
                }
            });
        });
    }

    function addEntryToBox(author, time, text) {
        const $row = $('<div class="qa-item"></div>').css({
            'background': 'white',
            'border-left': '4px solid #d9534f',
            'padding': '8px',
            'margin-bottom': '8px',
            'box-shadow': '0 1px 3px rgba(0,0,0,0.1)'
        });
        const $meta = $('<div></div>').css({
            'font-size': '11px', 'color': '#777', 'margin-bottom': '4px',
            'display': 'flex', 'justify-content': 'space-between'
        }).html(`<span><i class="fa fa-user"></i> <b>${author}</b></span> <span>${time}</span>`);

        const $msg = $('<div></div>').css({
            'font-size': '12px', 'color': '#333', 'word-wrap': 'break-word'
        });
        let updatedText = text
            .replace("Updated Comment for QA from", "<b style='color:#d9534f'>Updated Comment for QA from</b>")
            .replace("Comment for QA is set to", "<b style='color:#d9534f'>Comment for QA is set to</b>");

        $msg.html(updatedText);

        $row.append($meta).append($msg);
        $content.prepend($row);
        $('#qa-count').text(seenItems.size);
    }

    function getNewsfeedUrl() {
        const currentHash = window.location.hash;
        if (currentHash.includes('/newsfeed')) return null;
        if (currentHash.match(/\/view\/\d+\//)) {
            const newHash = currentHash.replace(/\/view\/(\d+)\/(\w+)/, '/view/$1/newsfeed');
            return window.location.origin + window.location.pathname + newHash;
        }
        return null;
    }

    function scanFeed() {
        if (isScanning) return;
        if ($box.css('display') === 'none') return;

        if (window.location.hash.includes('/newsfeed')) {
            parseDom($('body'));
            return;
        }

        const targetUrl = getNewsfeedUrl();
        if (!targetUrl) return;

        isScanning = true;
        $header.find('span:first').text('QA Updates (Scanning...)');

        const $iframe = $('<iframe>')
            .attr('id', 'qa-watcher-frame')
            .attr('src', targetUrl)
            .css({
                'position': 'absolute', 'width': '1000px', 'height': '1000px',
                'top': '-9999px', 'left': '-9999px', 'visibility': 'hidden'
            });

        $('body').append($iframe);

        let attempts = 0;
        const checkInterval = setInterval(() => {
            attempts++;
            if (!getCaseIdFromUrl()) {
                clearInterval(checkInterval);
                cleanup();
                return;
            }

            try {
                const iframeBody = $iframe.contents().find('body');
                if (iframeBody.find('.newsfeed-cntr').length > 0) {
                    clearInterval(checkInterval);
                    parseDom(iframeBody);
                    cleanup();
                } else if (attempts >= 20) {
                    clearInterval(checkInterval);
                    cleanup();
                }
            } catch (e) {
                clearInterval(checkInterval);
                cleanup();
            }
        }, 1000);

        function cleanup() {
            $iframe.remove();
            isScanning = false;
            if (getCaseIdFromUrl()) {
                $header.find('span:first').text('QA Updates Found');
            }
        }
    }

    setInterval(checkState, 1000);

    setTimeout(checkState, 2000);

})();