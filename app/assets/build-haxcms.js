// overload how define works so that we can prevent bricking issues
// when classes get loaded from multiple sources with the same name space
// this is a copy of the dedup-fix.js script we use in local testing / es5 routines
const _customElementsDefine = globalThis.customElements.define;
globalThis.customElements.define = (name, cl, conf) => {
  if (!globalThis.customElements.get(name)) {
    _customElementsDefine.call(globalThis.customElements, name, cl, conf);
  } else {
    console.warn(`${name} has been defined twice`);
  }
};
// HAXcms specific clean up and platform integration
// this ties in custom theme files if this is an evergreen browser
var anchor = document.currentScript || document.getElementsByTagName('script')[0];
if (/^h/.test(document.location)) {
  if ("noModule" in HTMLScriptElement.prototype) {
    if (!globalThis.__appCustomEnv) {
      var build2 = document.createElement('script');
      build2.src = './custom/build/custom.es6.js';
      build2.type = 'module';
      anchor.parentNode.insertBefore(build2, anchor);
    }
  } else {
    console.error("ES modules not supported by this browser. HAXcms requires a modern browser.");
  }
} else {
  console.error("HAXcms requires a web server.");
}
var cdn = "./";
if (globalThis.__appCDN) {
  cdn = globalThis.__appCDN;
}
// reset styles that we apply to all hax sites for some level of normalization
// across base HTML tags as well as css vars for styling system wide things from 1 place
var baseResetStyles = 'build/es6/node_modules/@haxtheweb/haxcms-elements/lib/base.css';
// css files load faster when implemented this way
var link = document.createElement('link');
link.rel = 'stylesheet';
link.href = cdn + baseResetStyles;
link.type = 'text/css';
link.onerror = (e) => { haxcmsFallbackStylesError(e);};
// get first link in the document
var linkDef = document.getElementsByTagName('link')[0];
linkDef.parentNode.insertBefore(link, linkDef);
if (!globalThis.__appCustomEnv) {
  var link2 = document.createElement('link');
  link2.rel = 'stylesheet';
  link2.href = './theme/theme.css';
  link2.type = 'text/css';
  linkDef.parentNode.insertBefore(link2, linkDef);
}
// if we fail to load the module, we need to fall back to known sources
// and reattempt to inject the CDN location. This is a last ditch effort
// though opens the ability for us to download user sites and if plugged
// into other hax housing then it'll work but also just work stand alone
// as a downloaded package
var haxCdn = cdn;
function haxcmsFallbackStylesError(e) {
  var cdn = haxCdn;
  if (!globalThis.__appCDNBlockFallback) {
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.onerror = (e) => { haxcmsFallbackStylesError(e);};
      // if the module fails to load at the set CDN location, try to fail back to known sources
      if (cdn === "./") {
        // hax cloud fallback
        haxCdn = "https://cdn.hax.cloud/cdn/";
        link.href = haxCdn + baseResetStyles;
        linkDef.parentNode.insertBefore(link, linkDef);
        console.warn(cdn + " failed to respond, styles back to alternative: " + haxCdn);
      }
      else if (cdn === "https://cdn.hax.cloud/cdn/") {
        // psu mirror
        haxCdn = "https://cdn.webcomponents.psu.edu/cdn/";
        link.href = haxCdn + baseResetStyles;
        linkDef.parentNode.insertBefore(link, linkDef);
        console.warn(cdn + " failed to respond, styles back to alternative: " + haxCdn);
      }
      else {
          // :( we're out of options, just reset these values to default
          // but we aren't working in this scenario bc both CDNs failed
          // and local delivery could not be found
          haxCdn = "./";
          console.error("Styles Local delivery failed and all alternative CDNs failed to load. You might be offline, in a secure environment or doing testing intentionally to generate this *shrug*");
      }
  }
}