// ==UserScript==
// @name          Auto-Bet userscript
// @namespace     https://zornco.com
// @description	  This will use the most recent version of the auto-bet script at all times
// @author        SystemDisc
// @downloadURL   https://raw.githubusercontent.com/SystemDisc/auto-bet/master/auto-bet.user.js
// @updateURL     https://raw.githubusercontent.com/SystemDisc/auto-bet/master/auto-bet.user.js
// @include       https://www.bitdice.me/
// @include       https://www.litedice.me/
// @include       https://www.dogedice.me/
// @include       https://www.reddice.me/
// @run-at        document-end
// @grant         GM_xmlhttpRequest
// @version       1.10
// ==/UserScript==

GM_xmlhttpRequest({
  method: "GET",
  url: "https://raw.githubusercontent.com/SystemDisc/auto-bet/master/auto-bet.js",
  onload: function(response) {
    eval(response.responseText);
  }
});
