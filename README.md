#### [The language of this respository is Hungarian.]
---
# Új Neptunhoz Infinite Session Mod
# Tampermonkey script (sajnos nem működő, kísérleti verzió).

Ez a Tampermonkey felhasználói szkript az **új Neptun webes felületén** figyeli az autentikációs folyamatot, kimenti a **Bearer** és **Refresh** tokent, majd megpróbálja automatikusan frissíteni a munkamenetet, hogy elkerüld a kijelentkeztetést.

---
## A talált kiskapu

Az új Neptun felület kétféle tokent és végpontot használ hitelesítésre:

- Kezdetben az /Authenticate végponton megadott felhasználónév és jelszó páros alapján visszaküld egy Access (Bearer) és egy Refresh tokent.
- Ezek után az Access (Bearer) tokent használva a felhasználó 10 percig hozzá tud férni a Neptun szerver védett végpontjaihoz.
- Ha lejár a megadott időablak (10 perc), a rendszer automatikusan kijelentkeztet, érvényteleníti az Access (Bearer) tokent. S utána rögtön meghívja a /GetNewTokens végpontot, ami szinte minden esetben 404-es hibakóddal tér vissza.
- A /GetNewTokens végponttal lehet új Access (Bearer) tokent kérni a Refresh token birtokában. Amivel aztán továbbra is hozzá tud a felhasználó férni a védett végpontokhoz, tehát nem fogja a rendszer 10 perc után "kidobni".
### A kiskaput már észrevették és javították!
---
## A tervezett algoritmus

- Figyeli a `/hallgatoing/api/Account/Authenticate` végpontra érkező válaszokat.
- Kimenti a **Bearer** és **Refresh** tokeneket a válaszból.
- 8 percenként (`8 * 60 * 1000 ms`) automatikusan próbál új tokent kérni a `/hallgatoing/api/Account/GetNewTokens` végpontról.
- Konzolban naplózza a folyamatot (sikeres token frissítés, hibák, státuszkódok). **Ez itt elég veszélyes! Token kiíratást kommenteld ki!**

---

## Így lehet kipróbálni

**Tampermonkey telepítése**

- Elérhető Chrome Web Store-ban, Firefox Add-ons oldalon.

**Új szkript hozzáadása**

- Nyisd meg a Tampermonkey-t.
- Kattints az **"Új szkript"** gombra.
- Illeszd be a kódot.

**Mentés és futtatás**  
- Mentés (`Ctrl+S`).
- Lépj be a `https://neptun-web3.tr.pte.hu/` oldalra.

---

### Metaadatok
- Kiszolgáló root URL: ```https://neptun-web3.tr.pte.hu/*```
- Authentikációs végpont: ```https://neptun-web3.tr.pte.hu/hallgatoing/api/Account/Authenticate```
- Új token kérés itt lehetséges: ```https://neptun-web3.tr.pte.hu/hallgatoing/api/Account/GetNewTokens```
