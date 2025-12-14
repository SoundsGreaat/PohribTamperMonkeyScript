// ==UserScript==
// @name         Pohrib Player
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Video Player (Persistent Progress Bar, No Blur on Hide, Button in Corner)
// @author       Austin
// @match        https://pohrib.gybsupport.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=premium.gotyourbacksupport.com
// @run-at       document-end
// @grant        none
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ModernUI.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ModernUI.js
// ==/UserScript==

(function() {
    'use strict';

    function initPlayer() {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = 'https://cdn.plyr.io/3.7.8/plyr.css';
        document.head.appendChild(link);

        const style = document.createElement('style');
        style.textContent = `
            .plyr {
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 10px 40px rgba(0,0,0,0.4);
                width: 100% !important;
                height: auto !important;
                max-height: 75vh !important;
                margin: 0 auto !important;
                display: block !important;
            }

            .plyr--video { background: #000; }

            .plyr__control--overlaid {
                background: rgba(255,255,255,0.95);
                color: #000;
                padding: 20px;
                position: absolute !important;
                top: auto !important;
                right: auto !important;
                bottom: 20px !important;
                left: 20px !important;
                transform: none !important;
            }
            .plyr__control--overlaid:hover { background: #fff; }

            .plyr__controls {
                background: linear-gradient(rgba(0,0,0,0.85), transparent) !important;
                padding: 15px 15px 30px !important;
                position: absolute !important;
                top: 0 !important;
                bottom: auto !important;
                left: 0 !important;
                right: 0 !important;
                transition: padding 0.3s ease, background 0.3s ease, backdrop-filter 0.3s ease !important;
                backdrop-filter: blur(10px);
            }

            .plyr--video.plyr--hide-controls .plyr__controls {
                transform: translateY(0) !important;
                opacity: 1 !important;
                background: transparent !important;
                pointer-events: none;
                padding-top: 0 !important;
                padding-bottom: 0 !important;
                backdrop-filter: none !important;
            }

            .plyr--video.plyr--hide-controls .plyr__controls > .plyr__control,
            .plyr--video.plyr--hide-controls .plyr__controls > .plyr__time,
            .plyr--video.plyr--hide-controls .plyr__controls > .plyr__volume,
            .plyr--video.plyr--hide-controls .plyr__controls > button {
                opacity: 0;
                pointer-events: none;
            }

            .plyr--video.plyr--hide-controls .plyr__controls .plyr__progress {
                opacity: 1;
                pointer-events: auto;
                transform: translateY(-10px);
            }

            .plyr__tooltip {
                top: 100% !important;
                bottom: auto !important;
                margin-top: 10px !important;
            }

            .plyr__tooltip::before {
                display: none !important;
            }

            .plyr__menu__container {
                top: 100% !important;
                bottom: auto !important;
                margin-top: 10px !important;
                transform: none !important;
            }

            .plyr__menu__container::after {
                display: none !important;
            }

            .plyr__control { transition: all 0.2s; }
            .plyr__control:hover { color: #fff; }

            .plyr__menu__container .plyr__control { color: #fff; }
            .plyr__menu__container .plyr__control:hover { color: #fff; }

            .plyr__menu__container { background: rgba(0,0,0,0.95); border-radius: 8px; }
            .plyr--full-ui input[type=range] { color: #00b3ff; }
            .plyr__progress__buffer { color: rgba(255,255,255,0.3); }
            .plyr__volume { display: none;}
        `;
        document.head.appendChild(style);

        const script = document.createElement('script');
        script.src = 'https://cdn.plyr.io/3.7.8/plyr.js';
        script.onload = function() {
            setTimeout(() => {
                if (typeof window.Plyr !== 'undefined') {
                    const videos = document.querySelectorAll('video');
                    videos.forEach(video => {
                        const player = new window.Plyr(video, {
                            controls: [
                                'play-large', 'restart', 'rewind', 'play', 'fast-forward',
                                'progress', 'current-time', 'duration', 'mute', 'volume',
                                'settings', 'pip', 'fullscreen'
                            ],
                            settings: ['captions', 'quality', 'speed', 'loop'],
                            speed: { selected: 1, options: [0.25, 0.5, 0.75, 1, 1.5, 1.75, 2, 2.5, 3, 4, 5] },
                            keyboard: { focused: true, global: true },
                            tooltips: { controls: true, seek: true },
                            captions: { active: false, language: 'auto' },
                            fullscreen: { enabled: true, fallback: true, iosNative: true },
                            ratio: '16:9',
                            clickToPlay: true,
                            hideControls: true,
                            resetOnEnd: false,
                            volume: 1
                        });

                        const adjustPlayerSize = () => {
                            const videoEl = player.media;
                            const container = player.elements.container;
                            if (videoEl && container && videoEl.videoWidth && videoEl.videoHeight) {
                                const ratio = videoEl.videoWidth / videoEl.videoHeight;
                                container.style.maxWidth = (ratio * 75) + 'vh';
                            }
                        };

                        player.on('loadedmetadata', adjustPlayerSize);
                        player.on('ready', adjustPlayerSize);
                        adjustPlayerSize();

                        document.addEventListener('keydown', (e) => {
                            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
                            switch(e.key) {
                                case 'j':
                                case 'о':
                                case 'J': player.rewind(60); break;
                                case 'l':
                                case 'д':
                                case 'L': player.forward(60); break;
                                case 'ArrowRight': player.forward(5); break;
                                case 'ArrowLeft': player.rewind(5); break;
                                case 'ArrowUp': e.preventDefault(); player.increaseVolume(0.1); break;
                                case 'ArrowDown': e.preventDefault(); player.decreaseVolume(0.1); break;
                                case 'л':
                                case 'space': e.preventDefault(); player.togglePlay(); break;
                                case 'f': player.fullscreen.toggle(); break;
                                case 'm': player.muted = !player.muted; break;
                            }
                        });

                        console.log('✅ Persistent Progress Bar (No Blur) activated!');
                    });
                }
            }, 500);
        };
        document.head.appendChild(script);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPlayer);
    } else {
        initPlayer();
    }
})();
