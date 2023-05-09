var ancient=false;
var cdn = "./";
// get named path to a real CDN as the base entryway into loading the assets
if (window.WCGlobalCDNPath) {
  cdn = window.WCGlobalCDNPath;
}
// legacy location of this value; too simple not to support
if (window.__appCDN) {
  cdn = window.__appCDN;
}
// this block is where we figure out if it's IE 11 / something really old
try {
  if (typeof Symbol == "undefined") { // IE 11, at least try to serve a watered down site
    ancient = true;
  }
  new Function("let a;"); // bizarre but needed for Safari 9 bc of when it was made
}
catch (err) {
  ancient = true;
}
// if we have something super old, the app can define if the user MUST upgrade
// in order to view the site. This is deployment policy specific
if ((window.__appForceUpgrade || window.WCForceUpgrade) && ancient) {
  window.location = "assets/upgrade-browser.html";
}