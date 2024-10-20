// ==UserScript==
// @name         Uj Neptunhoz Infinite Session
// @namespace    http://tampermonkey.net/
// @version      1.4
// @description  Figyeli a /Authenticate végpontot, kiolvassa a Bearer tokent, és egyszer frissíti azt
// @author       Te
// @match        https://neptun-web3.tr.pte.hu/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';

    let bearerToken = null;
    let refreshTokenValue = null;

    // Eredeti XMLHttpRequest mentése
    const originalXHR = window.XMLHttpRequest;

    // XMLHttpRequest felülírása
    window.XMLHttpRequest = function() {
        const xhr = new originalXHR();

        xhr.addEventListener('load', function() {
            // Ellenőrizzük, hogy a kérés a megfelelő végpontra vonatkozott-e
            if (this.responseURL.includes('/hallgatoing/api/Account/Authenticate') && this.status === 200) {
                console.log("Kérés válasz érkezett a /Authenticate végpontról.");

                // A válasz tartalmából Bearer token kinyerése
                try {
                    const response = JSON.parse(this.responseText);
                    if (response.data && response.data.accessToken) {
                        bearerToken = response.data.accessToken;
                        refreshTokenValue = response.data.refreshToken;
                        console.log("Bearer Token:", bearerToken);
                        console.log("Refresh Token:", refreshTokenValue);
                        console.log("A teljes válasz:", response);
                        const x = 8 * 60 * 1000
                        setTimeout(refreshToken, x);
                    } else {
                        console.log("Nem található Bearer Token a válaszban.");
                    }
                } catch (e) {
                    console.error("Hiba történt a válasz feldolgozása során:", e);
                }
            }
        });

        return xhr;
    };

    // Token frissítő funkció
    function refreshToken() {
        if (!refreshTokenValue) {
            console.log("Nincs elérhető refreshToken a frissítéshez.");
            return;
        }

        const xhr = new XMLHttpRequest();
        xhr.open('POST', 'https://neptun-web3.tr.pte.hu/hallgatoing/api/Account/GetNewTokens');
        xhr.setRequestHeader('Authorization', 'Bearer ' + refreshTokenValue);
        xhr.setRequestHeader('Content-Type', 'application/json');

        const requestBody = JSON.stringify({
            "refreshToken": refreshTokenValue
        });

        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const response = JSON.parse(xhr.responseText);
                    if (response && response.accessToken) {
                        bearerToken = response.accessToken;
                        refreshTokenValue = response.refreshToken;
                        console.log("Frissített Bearer Token:", bearerToken);
                    } else {
                        console.log("Nem található új Bearer Token a válaszban.");
                    }
                } catch (e) {
                    console.error("Hiba történt a token frissítése során:", e);
                }
            } else if (xhr.status === 401) {
                console.error("Érvénytelen token, új autentikáció szükséges.");
            } else {
                console.error("Hiba történt a token frissítési kérés során, státusz:", xhr.status);
            }
        };

        xhr.onerror = function() {
            console.error("Hiba történt a hálózati kérés során.");
        };

        xhr.send(requestBody);
    }
})();
