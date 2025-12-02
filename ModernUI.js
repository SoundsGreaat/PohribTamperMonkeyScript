// ==UserScript==
// @name         Modern UI
// @namespace    http://tampermonkey.net/
// @version      1.0.1
// @description  Restyles file manager.
// @author       Austin
// @match        https://pohrib.gybsupport.com:444/*
// @grant        GM_addStyle
// @run-at       document-start
// @icon         https://www.google.com/s2/favicons?sz=64&domain=gybsupport.com
// @updateURL    https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ModernUI.js
// @downloadURL  https://raw.githubusercontent.com/SoundsGreaat/PohribTamperMonkeyScript/refs/heads/main/ModernUI.js
// ==/UserScript==

(function() {
    'use strict';

    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const css = `
        :root {
            --bg-body: #f4f6f8;
            --bg-card: #ffffff;
            --text-main: #212529;
            --text-muted: #6c757d;
            --accent: #007bff;
            --accent-hover: #0056b3;

            --danger: #dc3545;
            --danger-hover: #c82333;
            --success: #28a745;
            --success-hover: #218838;
            --warning: #ffc107;
            --warning-hover: #e0a800;

            --border: #e9ecef;
            --shadow: 0 2px 8px rgba(0,0,0,0.05);
            --radius: 8px;
        }

        body {
            font-family: 'Inter', sans-serif !important;
            background-color: var(--bg-body) !important;
            color: var(--text-main) !important;
            font-size: 14px;
        }

        a { color: var(--text-main) !important; text-decoration: none !important; transition: 0.2s; }
        a:hover { color: var(--accent) !important; }

        .card, .modal-content, .btn, .form-control {
            border-radius: var(--radius) !important;
        }

        .navbar {
            background-color: var(--bg-card) !important;
            box-shadow: var(--shadow);
            border-bottom: 1px solid var(--border);
        }

        .bread-crumb { color: var(--text-muted) !important; margin: 0 5px; }
        .col-xs-6.col-sm-5 { color: var(--text-muted); font-weight: 500; }
        .col-xs-6.col-sm-5 a { color: var(--accent) !important; }

        .form-control {
            background-color: #f8f9fa !important;
            border: 1px solid var(--border) !important;
            color: var(--text-main) !important;
            box-shadow: none !important;
        }
        .form-control:focus {
            background-color: #fff !important;
            border-color: var(--accent) !important;
            box-shadow: 0 0 0 3px rgba(0,123,255,0.1) !important;
        }
        .input-group-text {
            background-color: #f8f9fa !important;
            border: 1px solid var(--border) !important;
            color: var(--text-muted);
        }

        .table-responsive {
            background: var(--bg-card);
            border-radius: var(--radius);
            box-shadow: var(--shadow);
            border: 1px solid var(--border);
            padding: 0;
        }

        #main-table {
            background-color: var(--bg-card) !important;
            margin-bottom: 0;
            border: none !important;
        }

        #main-table thead { background-color: #ffffff; border-bottom: 2px solid var(--border); }
        #main-table th {
            border: none !important;
            color: var(--text-muted);
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            font-weight: 600;
            padding: 15px !important;
        }

        #main-table td {
            border-top: 1px solid var(--border) !important;
            border-bottom: none !important;
            border-left: none !important;
            border-right: none !important;
            padding: 8px 15px !important;
            vertical-align: middle !important;
            color: var(--text-main);
        }

        #main-table tbody tr:hover td {
            background-color: #ececec !important;
        }

        .fa-folder-o { color: #ffc107 !important; text-shadow: 0 1px 2px rgba(0,0,0,0.1); }
        .fa-file-o { color: #6c757d !important; }

        .filename {
            max-width: 100% !important;
            white-space: normal !important;
        }

        .filename a {
            color: #333 !important;
            font-weight: 500;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        .filename a:hover { color: var(--accent) !important; }

        td.inline-actions,
        th[aria-label="Actions"],
        th:last-child {
            min-width: 1% !important;
            white-space: nowrap !important;
            padding-right: 15px !important;
        }

        .inline-actions {
            display: flex !important;
            align-items: center !important;
            gap: 5px !important;
        }

        .inline-actions a,
        .access_button,
        .sensitive_file_button {
            width: 42px !important;
            height: 36px !important;
            display: inline-flex !important;
            justify-content: center !important;
            align-items: center !important;
            padding: 0 !important;
            border-radius: 6px !important;
            background-color: #f1f3f5;
            color: #495057 !important;
            transition: all 0.2s ease;
            margin: 0 !important;
            border: 1px solid transparent !important;
        }

        .inline-actions a:hover {
            background-color: #e2e6ea !important;
            box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .inline-actions a i {
            font-size: 14px !important;
            margin: 0 !important;
            background: none !important;
            color: inherit !important;
        }

        .sensitive_file_button[is_sensitive="1"] {
            background-color: var(--danger) !important;
            color: white !important;
            box-shadow: 0 2px 5px rgba(220, 53, 69, 0.3);
        }
        .sensitive_file_button[is_sensitive="1"]:hover {
            background-color: var(--danger-hover) !important;
        }
        .sensitive_file_button[is_sensitive="1"] i { color: white !important; }

        .access_button[access_status="allowed"] {
            background-color: var(--success) !important;
            color: white !important;
            box-shadow: 0 2px 5px rgba(40, 167, 69, 0.3);
        }
        .access_button[access_status="allowed"]:hover {
            background-color: var(--success-hover) !important;
        }
        .access_button[access_status="allowed"] i { color: white !important; }

        .access_button[access_status="pending"] {
            background-color: var(--warning) !important;
            color: #212529 !important;
            box-shadow: 0 2px 5px rgba(255, 193, 7, 0.3);
        }
        .access_button[access_status="pending"]:hover {
            background-color: var(--warning-hover) !important;
        }
        .access_button[access_status="pending"] i { color: #212529 !important; }

        tfoot td.gray {
            background-color: #ffffff !important;
            border-top: 2px solid var(--border) !important;
            padding: 20px !important;
            color: var(--text-muted);
        }
        .badge {
            background-color: #f1f3f5 !important;
            color: #495057 !important;
            border: 1px solid #dee2e6 !important;
            font-weight: 500;
            padding: 5px 8px;
            border-radius: 4px;
        }
        .modal-content { border: none; box-shadow: 0 10px 40px rgba(0,0,0,0.1); }
        .modal-header { border-bottom: 1px solid var(--border); }
        .modal-footer { border-top: 1px solid var(--border); background-color: #f8f9fa; }

        .btn { padding: 6px 15px; font-weight: 500; font-size: 13px; }
        .btn-success { background-color: #28a745 !important; border-color: #28a745 !important; }
        .btn-outline-primary { color: var(--accent) !important; border-color: var(--border) !important; }
        .btn-outline-primary:hover { background-color: var(--accent) !important; color: #fff !important; }
    `;

    GM_addStyle(css);

    window.addEventListener('load', function() {
        const table = document.getElementById('main-table');

        if (table) {
            const headRow = table.querySelector('thead tr');
            if (headRow) {
                const actionsTh = headRow.lastElementChild;
                const nameTh = headRow.children[1];

                if (actionsTh) {
                    actionsTh.style.width = '1%';
                }

                if (actionsTh && nameTh) {
                    headRow.insertBefore(actionsTh, nameTh);
                }
            }

            const bodyRows = table.querySelectorAll('tbody tr');
            bodyRows.forEach(row => {
                const actionsTd = row.lastElementChild;
                const nameTd = row.children[1];

                if (actionsTd && nameTd) {
                    row.insertBefore(actionsTd, nameTd);
                }
            });

            table.classList.remove('bg-white');
        }

        const tables = document.querySelectorAll('.table');
        tables.forEach(t => { t.classList.remove('table-bordered'); });

        const goBack = document.querySelector('.fa-chevron-circle-left');
        if(goBack) {
            goBack.className = 'fa fa-arrow-left';
            goBack.style.marginRight = '5px';
        }
    });

})();