// set to avoid issues in the unbundling process w/ node vs js front end
window.process = {env: {NODE_ENV: "production"}};
// establish the default as relative to the integration point
// this isn't a cdn but is the easiest to operate obviously
var cdn = "./";
// get named path to a real CDN as the base entryway into loading the assets
if (window.WCGlobalCDNPath) {
  cdn = window.WCGlobalCDNPath;
}
// legacy location of this value; too simple not to support
if (window.__appCDN) {
  cdn = window.__appCDN;
}
// the name of the file containing the registry used to define
// all the dynamically imported element definitions. This is only
// to be changed via WCGlobalRegistryFileName if someone has a real
// desire to change the name manually or for a specific application
var fname = "wc-registry.json";
if (window.WCGlobalRegistryFileName) {
  fname = window.WCGlobalRegistryFileName;
}
// the full patht o accomplish autoloading
window.WCAutoloadRegistryFile = cdn + fname;
// location of the autoloader which we use for the entryway to the universe
// this is what does all the work in the magic script (tm)
var autoloaderScriptLocation = "build/es6/node_modules/@lrnwebcomponents/wc-autoload/wc-autoload.js";
// this try block ensures that if anything fails here we don't support it
// with a modern interface and it'll be a iframe structure. While imperfect, a dynamic import()
// will fall almost perfectly along the lines of what to ship the end user
try {
  // find the 1st script tag. We know this exists because our own script HAD
  // to be appended to the document that is running. Most likely this finds
  // the code running presently which is humorous.
  var def = document.getElementsByTagName("script")[0];
  // if a dynamic import fails, we bail over to the compiled version
  // this has to be run as a Function executed on its own otherwise FF and
  // older platforms will bomb because they read this as a parse error
  new Function("import('');");
  animationPolyfillTest();
  // create our autoloader script, which is a JS module and inject into the dom
  // this does all the real work of automatically loading our web components
  var build = document.createElement("script");
  build.src = cdn + autoloaderScriptLocation;
  build.type = "module";
  build.onerror = (e) => { fallbackChecks(e);};
  def.parentNode.insertBefore(build, def);
} catch (err) {
  // legacy platforms skip to this step. At this point we know we can inject
  // really aggressive polyfills or babel transforms in order to correctly
  // ship to older platforms but not bloating up newer platforms.
  // as of Nov 2020 this code will only run on ~%5 of web traffic at most
  // which is incredible as when we 1st did this script that was ~20%, Oct 2018
  // May 2023, we have removed support for this OOTB as we're now at incredibly small numbers that won't just get it
  // and build cycles don't justify it still being used!
  //var legacy = document.createElement("script");
  //legacy.src = cdn + "assets/build-polyfills.js";
  //def.parentNode.insertBefore(legacy, def);
  //var buildLegacy = document.createElement("script");
  //buildLegacy.src = cdn + "assets/build-legacy-es5-support.js";
  //def.parentNode.insertBefore(buildLegacy, def);
  // IntersectionObserver and other common polyfills
  var buildLegacy = document.createElement("script");
  buildLegacy.src = cdn + "assets/build-legacy.js";
  def.parentNode.insertBefore(buildLegacy, def);
}
// animation polyfill since some platforms are modern but don't entirely support this
function animationPolyfillTest() {
    // insert polyfill for web animations. We don't get here in legacy platforms
  // and this is because not everything supports web animations and it's a popular
  // thing to implement in advanced web development
  if (!Element.prototype.animate){
    var ani = document.createElement("script");
    ani.src = window.__appCDN + "build/es6/node_modules/web-animations-js/web-animations-next-lite.min.js";
    def.parentNode.insertBefore(ani, def);
  }
}
// if we fail to load the module, we need to fall back to known sources
// and reattempt to inject the CDN location. This is a last ditch effort
// though opens the ability for us to download user sites and if plugged
// into other hax housing then it'll work but also just work stand alone
// as a downloaded package
function fallbackChecks(e) {
    var cdn = window.__appCDN;
    if (!window.__appCDNBlockFallback) {
        var build = document.createElement("script");
        build.type = "module";
        build.onerror = (e) => { fallbackChecks(e);};
        // if the module fails to load at the set CDN location, try to fail back to known sources
        if (cdn === "./") {
            // psu fallback
            window.__appCDN = "https://cdn.hax.cloud/cdn/";
            window.WCAutoloadRegistryFile = window.WCAutoloadRegistryFile.replace(cdn, window.__appCDN);
            build.src = window.__appCDN + autoloaderScriptLocation;
            def.parentNode.insertBefore(build, def);
            console.warn(cdn + " failed to respond, falling back to alternative: " + window.__appCDN);
        }
        else if (cdn === "https://cdn.hax.cloud/cdn/") {
            // known mirror
            window.__appCDN = "https://cdn.webcomponents.psu.edu/cdn/";
            window.WCAutoloadRegistryFile = window.WCAutoloadRegistryFile.replace(cdn, window.__appCDN);
            build.src = window.__appCDN + autoloaderScriptLocation;
            def.parentNode.insertBefore(build, def);
            console.warn(cdn + " failed to respond, falling back to alternative: " + window.__appCDN);
        }
        else if (cdn === "https://cdn.webcomponents.psu.edu/cdn/") {
          // known mirror
          window.__appCDN = "https://cdn.waxam.io/";
          window.WCAutoloadRegistryFile = window.WCAutoloadRegistryFile.replace(cdn, window.__appCDN);
          build.src = window.__appCDN + autoloaderScriptLocation;
          def.parentNode.insertBefore(build, def);
          console.warn(cdn + " failed to respond, falling back to alternative: " + window.__appCDN);
        }
        else {
            // :( we're out of options, just reset these values to default
            // but we aren't working in this scenario bc both CDNs failed
            // and local delivery could not be found
            window.__appCDN = "./";
            window.WCAutoloadRegistryFile = window.WCAutoloadRegistryFile.replace(cdn, window.__appCDN);
            console.error("Local delivery failed and all alternative CDNs failed to load. You might be offline, in a secure environment or doing testing intentionally to generate this *shrug*");
        }
        animationPolyfillTest(); // if we just failed previously, we need to retest bc that would fail too
    }
}