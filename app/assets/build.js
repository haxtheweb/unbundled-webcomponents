// set to avoid issues in the unbundling process w/ node vs js front end
globalThis.process = {env: {NODE_ENV: "production"}};
// establish the default as relative to the integration point
// this isn't a cdn but is the easiest to operate obviously
var cdn = "./";
// get named path to a real CDN as the base entryway into loading the assets
if (globalThis.WCGlobalCDNPath) {
  cdn = globalThis.WCGlobalCDNPath;
}
// legacy location of this value; too simple not to support
if (globalThis.__appCDN) {
  cdn = globalThis.__appCDN;
}
// the name of the file containing the registry used to define
// all the dynamically imported element definitions. This is only
// to be changed via WCGlobalRegistryFileName if someone has a real
// desire to change the name manually or for a specific application
var fname = "wc-registry.json";
if (globalThis.WCGlobalRegistryFileName) {
  fname = globalThis.WCGlobalRegistryFileName;
}
// the full patht o accomplish autoloading
globalThis.WCAutoloadRegistryFile = cdn + fname;
// location of the autoloader which we use for the entryway to the universe
// this is what does all the work in the magic script (tm)
var autoloaderScriptLocation = "build/es6/node_modules/@haxtheweb/wc-autoload/wc-autoload.js";
// this try block ensures that if anything fails here we don't support it
// with a modern interface and it'll be a iframe structure. While imperfect, a dynamic import()
// will fall almost perfectly along the lines of what to ship the end user
// capture the current script as a stable DOM insertion anchor
var anchor = globalThis.document.currentScript || globalThis.document.getElementsByTagName("script")[0];

// ESM detection via native feature check
if ("noModule" in HTMLScriptElement.prototype) {
  // create our autoloader script, which is a JS module and inject into the dom
  // this does all the real work of automatically loading our web components
  var build = globalThis.document.createElement("script");
  build.src = cdn + autoloaderScriptLocation;
  build.type = "module";
  build.onerror = (e) => { fallbackChecks(e); };
  anchor.parentNode.insertBefore(build, anchor);
} else {
  console.error("ES modules not supported by this browser.");
}
// if we fail to load the module, we need to fall back to known sources
// and reattempt to inject the CDN location. This is a last ditch effort
// though opens the ability for us to download user sites and if plugged
// into other hax housing then it'll work but also just work stand alone
// as a downloaded package
function fallbackChecks(e) {
    var cdn = globalThis.__appCDN;
    if (!globalThis.__appCDNBlockFallback) {
        var build = globalThis.document.createElement("script");
        build.type = "module";
        build.onerror = (e) => { fallbackChecks(e);};
        // if the module fails to load at the set CDN location, try to fail back to known sources
        if (cdn === "./") {
            // psu fallback
            globalThis.__appCDN = "https://cdn.hax.cloud/cdn/";
            globalThis.WCAutoloadRegistryFile = globalThis.WCAutoloadRegistryFile.replace(cdn, globalThis.__appCDN);
            build.src = globalThis.__appCDN + autoloaderScriptLocation;
            anchor.parentNode.insertBefore(build, anchor);
            console.warn(cdn + " failed to respond, falling back to alternative: " + globalThis.__appCDN);
        }
        else if (cdn === "https://cdn.hax.cloud/cdn/") {
            // known mirror
            globalThis.__appCDN = "https://cdn.webcomponents.psu.edu/cdn/";
            globalThis.WCAutoloadRegistryFile = globalThis.WCAutoloadRegistryFile.replace(cdn, globalThis.__appCDN);
            build.src = globalThis.__appCDN + autoloaderScriptLocation;
            anchor.parentNode.insertBefore(build, anchor);
            console.warn(cdn + " failed to respond, falling back to alternative: " + globalThis.__appCDN);
        }
        else {
            // :( we're out of options, just reset these values to default
            // but we aren't working in this scenario bc both CDNs failed
            // and local delivery could not be found
            globalThis.__appCDN = "./";
            globalThis.WCAutoloadRegistryFile = globalThis.WCAutoloadRegistryFile.replace(cdn, globalThis.__appCDN);
            console.error("Local delivery failed and all alternative CDNs failed to load. You might be offline, in a secure environment or doing testing intentionally to generate this *shrug*");
        }
    }
}