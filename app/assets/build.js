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
// this try block ensures that if anything fails here we always fall back
// to the ES5 version of the assets. While imperfect, a dynamic import()
// will fall almost perfectly along the lines of what to ship the
// end user
try {
  // find the 1st script tag. We know this exists because our own script HAD
  // to be appended to the document that is running. Most likely this finds
  // the code running presently which is humorous.
  var def = document.getElementsByTagName("script")[0];
  // if a dynamic import fails, we bail over to the compiled version
  // this has to be run as a Function executed on its own otherwise FF and
  // older platforms will bomb because they read this as a parse error
  new Function("import('');");
  // insert polyfill for web animations. We don't get here in legacy platforms
  // and this is because not everything supports web animations and it's a popular
  // thing to implement in advanced web development
  var ani = document.createElement("script");
  ani.src = cdn + "build/es6/node_modules/web-animations-js/web-animations-next-lite.min.js";
  def.parentNode.insertBefore(ani, def);
  // create our autoloader script, which is a JS module and inject into the dom
  // this does all the real work of automatically loading our web components
  var build = document.createElement("script");
  build.src = cdn + "build/es6/node_modules/@lrnwebcomponents/wc-autoload/wc-autoload.js";
  build.type = "module";
  def.parentNode.insertBefore(build, def);
} catch (err) {
  // legacy platforms skip to this step. At this point we know we can inject
  // really aggressive polyfills or babel transforms in order to correctly
  // ship to older platforms but not bloating up newer platforms.
  // as of Nov 2020 this code will only run on ~%5 of web traffic at most
  // which is incredible as when we 1st did this script that was ~20%, Oct 2018
  var legacy = document.createElement("script");
  legacy.src = cdn + "assets/build-polyfills.js";
  def.parentNode.insertBefore(legacy, def);
  // IntersectionObserver and other common polyfills
  var buildLegacy = document.createElement("script");
  buildLegacy.src = cdn + "assets/build-legacy.js";
  def.parentNode.insertBefore(buildLegacy, def);
}