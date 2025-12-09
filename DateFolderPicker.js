// ==UserScript==
// @name         Date picker + Folder selector
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Date picker + Folder selector
// @author       Austin
// @match        https://pohrib.gybsupport.com:444/*
// @run-at       document-start
// @grant        none
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gybsupport.com
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/DateFolderPicker.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/DateFolderPicker.js
// ==/UserScript==

(function() {
    'use strict';

    function init() {
        if (document.querySelector('#gyb-custom-nav-container')) return;

        const urlParams = new URLSearchParams(window.location.search);
        let pParam = urlParams.get('p');

        if (!pParam) return;

        pParam = decodeURIComponent(pParam);
        pParam = pParam.replace(/\/$/, '');

        const parts = pParam.split('/');
        let currentType = parts[0];

        const validTypes = ['calls', 'remote_sessions'];
        if (!validTypes.includes(currentType)) {
            if (parts.length === 1 && parts[0] === "") currentType = 'remote_sessions';
        }

        let currentDate;
        if (parts.length === 4 && !isNaN(parts[1]) && !isNaN(parts[2]) && !isNaN(parts[3])) {
            const year = parseInt(parts[1]);
            const month = parseInt(parts[2]) - 1;
            const day = parseInt(parts[3]);
            currentDate = new Date(year, month, day);
        } else {
            currentDate = new Date();
        }

        function formatDateLocal(date) {
            const y = date.getFullYear();
            const m = String(date.getMonth() + 1).padStart(2, '0');
            const d = String(date.getDate()).padStart(2, '0');
            return `${y}-${m}-${d}`;
        }

        function navigate(type, dateObj) {
            const dateStr = formatDateLocal(dateObj);
            const newPath = `${type}/${dateStr.replace(/-/g, '/')}`;
            urlParams.set('p', newPath);
            window.location.search = urlParams.toString();
        }

        function applyContainerStyles(element) {
            element.style.background = '#f8f9fa';
            element.style.borderRadius = '5px';
            element.style.padding = '2px 5px';
            element.style.border = '1px solid #dee2e6';
            element.style.height = '31px';
        }

        const fragment = document.createDocumentFragment();

        const typeLi = document.createElement('li');
        typeLi.id = 'gyb-custom-nav-container';
        typeLi.className = 'nav-item d-flex align-items-center ml-3';
        applyContainerStyles(typeLi);

        const typeSelect = document.createElement('select');
        typeSelect.className = 'form-control form-control-sm border-0 bg-transparent';
        typeSelect.style.width = 'auto';
        typeSelect.style.cursor = 'pointer';
        typeSelect.style.fontWeight = 'bold';
        typeSelect.style.color = '#495057';
        typeSelect.style.height = '100%';
        typeSelect.style.paddingTop = '0';
        typeSelect.style.paddingBottom = '0';
        typeSelect.style.boxShadow = 'none';

        const optionCalls = new Option('Calls', 'calls');
        const optionSessions = new Option('Remote Sessions', 'remote_sessions');
        typeSelect.add(optionCalls);
        typeSelect.add(optionSessions);

        typeSelect.value = validTypes.includes(currentType) ? currentType : 'remote_sessions';

        typeSelect.onchange = (e) => {
            const newType = e.target.value;
            const currentInputDateParts = dateInput.value.split('-');
            const dateObj = new Date(currentInputDateParts[0], currentInputDateParts[1] - 1, currentInputDateParts[2]);
            navigate(newType, dateObj);
        };

        typeLi.appendChild(typeSelect);
        fragment.appendChild(typeLi);

        const dateLi = document.createElement('li');
        dateLi.className = 'nav-item d-flex align-items-center ml-2 mr-3';
        applyContainerStyles(dateLi);

        const prevBtn = document.createElement('button');
        prevBtn.className = 'btn btn-sm btn-outline-secondary border-0';
        prevBtn.innerHTML = '<i class="fa fa-chevron-left"></i>';
        prevBtn.style.padding = '0 5px';
        prevBtn.title = 'Previous Day';
        prevBtn.onclick = (e) => {
            e.preventDefault();
            const prevDate = new Date(currentDate);
            prevDate.setDate(currentDate.getDate() - 1);
            navigate(typeSelect.value, prevDate);
        };

        const dateInput = document.createElement('input');
        dateInput.type = 'date';
        dateInput.className = 'form-control form-control-sm border-0 bg-transparent';
        dateInput.style.width = '130px';
        dateInput.style.textAlign = 'center';
        dateInput.style.fontWeight = 'bold';
        dateInput.style.color = '#495057';
        dateInput.style.height = '100%';
        dateInput.style.padding = '0';
        dateInput.style.boxShadow = 'none';
        dateInput.value = formatDateLocal(currentDate);

        dateInput.onchange = (e) => {
            if (e.target.value) {
                const parts = e.target.value.split('-');
                const newDate = new Date(parts[0], parts[1] - 1, parts[2]);
                navigate(typeSelect.value, newDate);
            }
        };

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-sm btn-outline-secondary border-0';
        nextBtn.innerHTML = '<i class="fa fa-chevron-right"></i>';
        nextBtn.style.padding = '0 5px';
        nextBtn.title = 'Next Day';
        nextBtn.onclick = (e) => {
            e.preventDefault();
            const nextDate = new Date(currentDate);
            nextDate.setDate(currentDate.getDate() + 1);
            navigate(typeSelect.value, nextDate);
        };

        dateLi.appendChild(prevBtn);
        dateLi.appendChild(dateInput);
        dateLi.appendChild(nextBtn);
        fragment.appendChild(dateLi);

        const navbarRight = document.querySelector('.navbar-collapse .navbar-nav.mr-auto.float-right');
        if (navbarRight) {
            navbarRight.insertBefore(fragment, navbarRight.firstChild);
        } else {
            const navbarCollapse = document.querySelector('.navbar-collapse');
            if (navbarCollapse) navbarCollapse.appendChild(fragment);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();