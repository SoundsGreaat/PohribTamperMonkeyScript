// ==UserScript==
// @name         GYB Audio Player
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Volume slider under Play button + Speed highlight
// @author       Austin
// @match        https://pohrib.gybsupport.com:444/index.php?p=calls*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gybsupport.com
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/PohribAudioPlayer.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/PohribAudioPlayer.js
// @grant        GM_addStyle
// @grant        unsafeWindow
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    const checkInterval = setInterval(function() {
        if (unsafeWindow.wavesurfer && document.querySelector('button[onclick*="wavesurfer.playPause"]')) {
            clearInterval(checkInterval);
            initEnhancements();
        }
    }, 500);

    function initEnhancements() {
        addStyles();
        setupSpeedButtons();
        addVolumeControl();
    }

    function addStyles() {
        GM_addStyle(`
            .btn-speed-active {
                background-color: #28a745 !important;
                border-color: #1e7e34 !important;
                color: white !important;
                box-shadow: 0 0 0 0.2rem rgba(40, 167, 69, 0.4);
            }
            .volume-control-container {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 10px auto;
                padding: 5px;
                width: 100%;
            }
            .volume-control-wrapper {
                display: flex;
                align-items: center;
                background-color: #f8f9fa;
                border: 1px solid #ddd;
                border-radius: 20px;
                padding: 5px 15px;
            }
            .volume-icon {
                font-size: 1.2em;
                margin-right: 10px;
                color: #555;
                cursor: pointer;
            }
            .volume-icon:hover { color: #000; }
            .custom-volume-slider {
                -webkit-appearance: none;
                width: 150px;
                height: 4px;
                background: #ccc;
                border-radius: 2px;
                outline: none;
            }
            .custom-volume-slider::-webkit-slider-thumb {
                -webkit-appearance: none;
                width: 16px;
                height: 16px;
                border-radius: 50%;
                background: #007bff;
                cursor: pointer;
                border: 2px solid white;
                box-shadow: 0 1px 3px rgba(0,0,0,0.3);
            }
        `);
    }

    function setupSpeedButtons() {
        const buttons = document.querySelectorAll('button[onclick*="setPlaybackRate"]');
        if (buttons.length === 0) return;

        buttons.forEach(btn => {
            const match = btn.getAttribute('onclick').match(/setPlaybackRate\(([\d\.]+)\)/);
            const rate = match ? parseFloat(match[1]) : 1.0;

            if (rate === 1.0) {
                btn.classList.add('btn-speed-active');
            }

            btn.addEventListener('click', function() {
                buttons.forEach(b => b.classList.remove('btn-speed-active'));
                this.classList.add('btn-speed-active');
            });
        });
    }

    function addVolumeControl() {
        const playBtn = document.querySelector('button[onclick*="wavesurfer.playPause"]');
        if (!playBtn) return;

        const mainContainer = document.createElement('div');
        mainContainer.className = 'volume-control-container';

        const wrapper = document.createElement('div');
        wrapper.className = 'volume-control-wrapper';

        const icon = document.createElement('i');
        icon.className = 'fa fa-volume-up volume-icon';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = '0';
        slider.max = '1';
        slider.step = '0.05';
        slider.value = '1';
        slider.className = 'custom-volume-slider';

        wrapper.appendChild(icon);
        wrapper.appendChild(slider);
        mainContainer.appendChild(wrapper);

        playBtn.parentNode.insertBefore(mainContainer, playBtn.nextSibling);

        const ws = unsafeWindow.wavesurfer;
        const savedVol = localStorage.getItem('gyb_vol');

        if (savedVol !== null) {
            ws.setVolume(savedVol);
            slider.value = savedVol;
            updateIcon(savedVol);
        }

        slider.addEventListener('input', function() {
            const val = this.value;
            ws.setVolume(val);
            localStorage.setItem('gyb_vol', val);
            updateIcon(val);
        });

        let lastVol = 1;
        icon.addEventListener('click', function() {
            const current = parseFloat(slider.value);
            if (current > 0) {
                lastVol = current;
                ws.setVolume(0);
                slider.value = 0;
            } else {
                ws.setVolume(lastVol);
                slider.value = lastVol;
            }
            updateIcon(slider.value);
        });

        function updateIcon(val) {
            icon.className = 'fa volume-icon';
            if (val == 0) icon.classList.add('fa-volume-off');
            else if (val < 0.5) icon.classList.add('fa-volume-down');
            else icon.classList.add('fa-volume-up');
        }
    }
})();