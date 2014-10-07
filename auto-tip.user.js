// ==UserScript==
// @name          Auto-Tip userscript
// @namespace     https://zornco.com
// @description	  This will use the most recent version of the auto-tip script at all times
// @author        SystemDisc
// @downloadURL   https://raw.githubusercontent.com/SystemDisc/auto-bet/master/auto-tip.user.js
// @include       https://www.bitdice.me/
// @include       https://www.litedice.me/
// @include       https://www.dogedice.me/
// @include       https://www.reddice.me/
// @run-at        document-end
// @grant         GM_xmlhttpRequest
// @version       1.01
// ==/UserScript==

GM_xmlhttpRequest({
  method: "GET",
  url: "https://raw.githubusercontent.com/SystemDisc/auto-bet/master/auto-tip.js",
  onload: function(response) {
    unsafeWindow.eval(response.responseText);
  }
});
