// ==UserScript==
// @name         Disable Alerts
// @namespace    http://tampermonkey.net/
// @version      1.0.0
// @description  Disables alert pop-ups on the Pohrib site
// @author       Austin
// @match        https://pohrib.gybsupport.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=premium.gotyourbacksupport.com
// @run-at       document-end
// @grant        none
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/DisableAlerts.js
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/DisableAlerts.js
// ==/UserScript==

window.alert = function(message) {
    console.log("Hidden alert: " + message);
    return true;
};