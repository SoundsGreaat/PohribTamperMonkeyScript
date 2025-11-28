// ==UserScript==
// @name         Apptivo QA Watcher
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  Watches for QA comments
// @author       Austin
// @match        https://app.apptivo.com/app/cases.jsp*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=apptivo.com
// @grant        none
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/RequestButtonAutoClick.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/RequestButtonAutoClick.js
// ==/UserScript==

(function () {
    'use strict';

    let isMinimized = localStorage.getItem('qa_watcher_minimized') === 'true';
    let activeTab = localStorage.getItem('qa_watcher_tab') || 'qa';

    const initialHeight = isMinimized ? '40px' : '400px';

    const styles = `
        #qa-watcher-box {
            position: fixed; bottom: 10px; left: 10px; width: 450px; height: ${initialHeight};
            background: #fff; border: 2px solid #d9534f; z-index: 999999;
            box-shadow: 0 0 15px rgba(0,0,0,0.3); display: none; flex-direction: column;
            font-family: 'Segoe UI', Arial, sans-serif; border-radius: 8px; font-size: 13px;
            transition: height 0.3s ease; overflow: hidden;
        }
        #qa-watcher-header {
            background: #d9534f; color: #fff; padding: 8px 12px; cursor: pointer;
            font-weight: bold; display: flex; justify-content: space-between; align-items: center;
        }
        #qa-watcher-tabs {
            display: flex; background: #c9302c;
        }
        .watcher-tab {
            flex: 1; text-align: center; padding: 8px 0; color: rgba(255,255,255,0.7);
            cursor: pointer; font-size: 12px; border-bottom: 3px solid transparent;
            transition: all 0.2s;
        }
        .watcher-tab:hover { background: #b52b27; color: #fff; }
        .watcher-tab.active {
            color: #fff; font-weight: bold; border-bottom: 3px solid #fff; background: #d9534f;
        }
        #qa-watcher-content {
            flex: 1; overflow-y: auto; background: #f9f9f9; display: ${isMinimized ? 'none' : 'block'};
        }
        .qa-list-container { display: none; padding: 10px; }
        .qa-list-container.active { display: block; }
        .qa-item {
            background: white; border-left: 4px solid #d9534f; padding: 8px;
            margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        .note-item {
            background: white; border-left: 4px solid #337ab7; padding: 8px;
            margin-bottom: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
    `;

    $('<style>').text(styles).appendTo('head');

    const $box = $('<div id="qa-watcher-box"></div>');

    const $header = $(`
        <div>
            <div id="qa-watcher-header">
                <span id="header-title">Apptivo Watcher</span>
                <div>
                    <span id="qa-count" style="background:white; color:#d9534f; padding:0 6px; border-radius:10px; font-size:11px; margin-right:5px;">0</span>
                    <span id="notes-count" style="background:white; color:#337ab7; padding:0 6px; border-radius:10px; font-size:11px;">0</span>
                </div>
            </div>
            <div id="qa-watcher-tabs">
                <div id="tab-qa" class="watcher-tab ${activeTab === 'qa' ? 'active' : ''}">QA Updates</div>
                <div id="tab-notes" class="watcher-tab ${activeTab === 'notes' ? 'active' : ''}">Notes</div>
            </div>
        </div>
    `);

    const $content = $('<div id="qa-watcher-content"></div>');
    const $qaList = $('<div id="list-qa" class="qa-list-container"></div>');
    const $notesList = $('<div id="list-notes" class="qa-list-container"></div>');

    if (activeTab === 'qa') $qaList.addClass('active'); else $notesList.addClass('active');

    $content.append($qaList).append($notesList);
    $box.append($header).append($content);
    $('body').append($box);

    $('#qa-watcher-header').on('click', function () {
        if (isMinimized) {
            $box.css('height', '400px');
            $content.show();
            isMinimized = false;
        } else {
            $box.css('height', '40px');
            $content.hide();
            isMinimized = true;
        }
        localStorage.setItem('qa_watcher_minimized', isMinimized);
    });

    $('.watcher-tab').on('click', function () {
        const target = $(this).attr('id').replace('tab-', '');
        activeTab = target;
        localStorage.setItem('qa_watcher_tab', activeTab);

        $('.watcher-tab').removeClass('active');
        $(this).addClass('active');

        $('.qa-list-container').removeClass('active');
        $(`#list-${target}`).addClass('active');

        if (target === 'qa') scanFeed();
        if (target === 'notes') scanNotes();
    });

    const seenQA = new Set();
    const seenNotes = new Set();
    let isScanningQA = false;
    let isScanningNotes = false;
    let lastCaseId = null;


    function getCaseIdFromUrl() {
        const match = window.location.hash.match(/\/view\/(\d+)\//);
        return match ? match[1] : null;
    }

    function resetWidget() {
        seenQA.clear();
        seenNotes.clear();
        $qaList.empty();
        $notesList.empty();
        $('#qa-count').text('0');
        $('#notes-count').text('0');
        $('#qa-watcher-frame').remove();
        $('#notes-watcher-frame').remove();
        isScanningQA = false;
        isScanningNotes = false;
        $('#header-title').text('Apptivo Watcher');
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
            setTimeout(scanNotes, 2000);
        }
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
        if (isScanningQA || $box.css('display') === 'none') return;

        if (window.location.hash.includes('/newsfeed')) {
            parseQADom($('body'));
            return;
        }

        const targetUrl = getNewsfeedUrl();
        if (!targetUrl) return;

        isScanningQA = true;
        $('#header-title').text('Scanning QA...');

        runIframeScanner('qa-watcher-frame', targetUrl, parseQADom, () => {
            isScanningQA = false;
            $('#header-title').text('Apptivo Watcher');
        });
    }

    function parseQADom($context) {
        const newsEntries = $context.find('.newsfeed-cntr');
        newsEntries.each(function () {
            const $container = $(this);
            const $msgBlock = $container.find('.stable-responsive');
            const htmlContent = $msgBlock.html();

            if (!htmlContent || !htmlContent.includes("Comment for QA")) return;

            let authorName = $container.find('.text-cmtname').text().trim() || "Unknown";
            let timeStr = $container.find('.likerow .pull-right.ng-binding').text().trim() || "Unknown";

            const lines = htmlContent.split(/<br\s*\/?>/i);
            lines.forEach(line => {
                const tempDiv = $('<div>').html(line);
                const cleanText = tempDiv.text().trim();
                if (cleanText.includes("Comment for QA")) {
                    const uniqueKey = authorName + "|" + timeStr + "|" + cleanText;
                    if (!seenQA.has(uniqueKey)) {
                        seenQA.add(uniqueKey);
                        addQAEntry(authorName, timeStr, cleanText);
                    }
                }
            });
        });
    }

    function addQAEntry(author, time, text) {
        const $row = $('<div class="qa-item"></div>');
        const $meta = $('<div></div>').css({
            'font-size': '11px',
            'color': '#777',
            'margin-bottom': '4px',
            'display': 'flex',
            'justify-content': 'space-between'
        }).html(`<span><i class="fa fa-user"></i> <b>${author}</b></span> <span>${time}</span>`);

        const $msg = $('<div></div>').css({
            'font-size': '12px', 'color': '#333', 'word-wrap': 'break-word'
        });

        let updatedText = text
            .replace("Updated Comment for QA from", "<b style='color:#d9534f'>Updated Comment for QA from</b>")
            .replace("Comment for QA is set to", "<b style='color:#d9534f'>Comment for QA is set to</b>");

        $msg.html(updatedText);
        $row.append($meta).append($msg);
        $qaList.prepend($row);
        $('#qa-count').text(seenQA.size);
    }

    function getNotesUrl() {
        const currentHash = window.location.hash;
        if (currentHash.includes('/notes/mynotes')) return null;
        if (currentHash.match(/\/view\/\d+\//)) {
            const newHash = currentHash.replace(/\/view\/(\d+)\/(\w+)/, '/view/$1/notes/mynotes');
            return window.location.origin + window.location.pathname + newHash;
        }
        return null;
    }

    function scanNotes() {
        if (isScanningNotes || $box.css('display') === 'none') return;

        if (window.location.hash.includes('/notes/mynotes')) {
            parseNotesDom($('body'));
            return;
        }

        const targetUrl = getNotesUrl();
        if (!targetUrl) return;

        isScanningNotes = true;
        if (activeTab === 'notes') $('#header-title').text('Scanning Notes...');

        runIframeScanner('notes-watcher-frame', targetUrl, parseNotesDom, () => {
            isScanningNotes = false;
            $('#header-title').text('Apptivo Watcher');
        });
    }

    function parseNotesDom($context) {
        const noteRows = $context.find('tr[ng-repeat*="listViewData in listViewDatas"]');

        noteRows.each(function () {
            const $row = $(this);

            const $textContainer = $row.find('[ng-bind-html*="noteText"]');
            if ($textContainer.length === 0) return;

            const rawText = $textContainer.text().trim();
            if (!rawText) return;

            const $metaSpan = $row.find('div.col-sm-12 span.pull-left');
            const $blueSpans = $metaSpan.find('span.clrblue');

            let author = "Unknown";
            let time = "Unknown";

            if ($blueSpans.length >= 2) {
                author = $blueSpans.eq(0).text().trim();
                time = $blueSpans.eq(1).text().trim();
            } else if ($blueSpans.length === 1) {
                time = $blueSpans.eq(0).text().trim();
            }

            const uniqueKey = author + "|" + time + "|" + rawText.substring(0, 50);

            if (!seenNotes.has(uniqueKey)) {
                seenNotes.add(uniqueKey);
                addNoteEntry(author, time, $textContainer.html());
            }
        });
    }

    function addNoteEntry(author, time, htmlContent) {
        const $row = $('<div class="note-item"></div>');
        const $meta = $('<div></div>').css({
            'font-size': '11px',
            'color': '#777',
            'margin-bottom': '4px',
            'display': 'flex',
            'justify-content': 'space-between'
        }).html(`<span><i class="fa fa-pencil"></i> <b>${author}</b></span> <span>${time}</span>`);

        const $msg = $('<div></div>').css({
            'font-size': '12px', 'color': '#333', 'word-wrap': 'break-word'
        });

        $msg.html(htmlContent);

        $row.append($meta).append($msg);
        $notesList.prepend($row);
        $('#notes-count').text(seenNotes.size);
    }

    function runIframeScanner(frameId, url, parserCallback, doneCallback) {
        $('#' + frameId).remove();

        const $iframe = $('<iframe>')
            .attr('id', frameId)
            .attr('src', url)
            .css({
                'position': 'absolute',
                'width': '1000px',
                'height': '1000px',
                'top': '-9999px',
                'left': '-9999px',
                'visibility': 'hidden'
            });

        $('body').append($iframe);

        let attempts = 0;
        let scrollCount = 0;
        let maxScrolls = 20;
        let lastHeight = 0;
        let stableHeightCount = 0;

        const checkInterval = setInterval(() => {
            attempts++;

            if (!getCaseIdFromUrl()) {
                clearInterval(checkInterval);
                $iframe.remove();
                if (doneCallback) doneCallback();
                return;
            }

            try {
                const iframeContents = $iframe.contents();
                const iframeBody = iframeContents.find('body');
                const iframeWindow = $iframe[0].contentWindow;

                const hasContent = iframeBody.find('.newsfeed-cntr').length > 0 || iframeBody.find('tr[ng-repeat]').length > 0;

                if (hasContent) {
                    const currentHeight = iframeBody[0].scrollHeight;

                    if (currentHeight > lastHeight) {
                        lastHeight = currentHeight;
                        stableHeightCount = 0;
                        if (scrollCount < maxScrolls) {
                            iframeWindow.scrollTo(0, currentHeight);
                            scrollCount++;
                        } else {
                            finish();
                        }
                    } else {
                        stableHeightCount++;
                        if (stableHeightCount >= 3) {
                            finish();
                        } else {
                            iframeWindow.scrollTo(0, 9999999);
                        }
                    }
                } else if (attempts >= 20) {
                    finish();
                }
            } catch (e) {
                console.error("Watcher Error:", e);
                finish();
            }

            function finish() {
                clearInterval(checkInterval);
                try {
                    parserCallback($iframe.contents().find('body'));
                } catch (e) {
                    console.error(e);
                }
                $iframe.remove();
                if (doneCallback) doneCallback();
            }

        }, 1000);
    }

    setInterval(checkState, 1500);
    setInterval(() => {
        if (activeTab === 'qa') scanFeed(); else if (activeTab === 'notes') scanNotes();
    }, 60000);

})();