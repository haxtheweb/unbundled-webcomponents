## unbundled webcomponents
This is an optimized workflow for those implementing unbundled builds for web components. The goal is to provide the easiest integration for unbundled builds, made popular by CDNs in large organizations. You have to use yarn because it supports `"flat": true,` which is required for unbundling to work

## Example from the advanced.html file
[Check out the advanced HTML file on rawgit](https://ghcdn.rawgit.org/elmsln/unbundled-webcomponents/master/advanced.html) to see what's happening. Your site hydrates based on finding tags that are undefined. You'd put these in your application or on a CDN and then the integration methodology is the same every time regardless of app!

## Using this repo in anything
This is a starting point to do a build. Here's how to fork and customize it to be your own:
- Install [yarn](https://classic.yarnpkg.com/en/docs/install/)
- `git clone https://github.com/elmsln/unbundled-webcomponents.git` this repo
- `cd unbundled-webcomponents/app` to move into the directory
- `yarn add` to add / install new elements or edit `app/package.json` directly
- reference all the elements you want to import in `app/dist/app.js` or reference them in `app/dist/index.html`
- `yarn install` to install dependencies
- run `yarn run build` which will generate a build
- copy the `/app/dist/` folder to your server / app location
- add `<script src="./dist/build.js"></script>` to the bottom of your app / CMS or review `app/index.html` or `app/advanced.html` for more complete examples

### Adding assets not caught by the bundler
`app/polymer.json` has a `extraDependencies` property that accepts GLOBs to match files / assets not going to be caught by the bundler. The bundler will find anythign directly referenced (like `import "whatever.js";`) but will miss dynamically created things such as `style.css` file references in the HTML of a component. Adding to this array the specific additional assets to include helps ensure that everything is included in the output of the bundler.

> Wait... I didn't think this was a bundler?!
Well, polymer.json happens to do unbundled builds. It is a bundler / compiler but we're leveraging it just for the compiling capabilites and multiple output targets it provides. As a result, it does have some bundler-isms like having to define additional assets to include in the output, though they are left unbundled as well :)

### Using this repo in Drupal CMS (as an example of implementation, works with anything though)
- download this repo
- add new web components via `yarn add @lrnwebcomponents/h-a-x`
- add `import "@lrnwebcomponents/h-a-x/h-a-x.js";` to the `app/src/app.js` file
- do the build routine spelled out above
- after `yarn run build`, rename the `app/dist/` folder to `webcomponents`
- place this in `sites/all/libraries/`
- You should now have everything in place for this to be wired up

### Why unbundled
- If you are using a CDN approach where elements power multiple sites
- If you build your app as if there is unbundled references and want to leverage optimizations as a result
- If you are using a CMS or application that controls its own JS via a different workflow, this is probably the safer option
- This is a stepping stone to the future. In the next few years unbundling will be possible without tooling thanks to importmaps
- Your running an HTTP/2 server / CDN and know it's faster!

### Why not to unbundle
- anti-pattern in the JS community of today
- still uses `polymer build` to keep things separate
- webpack / rollup by themselves will make smaller asset bundles and your shipping 1 stand alone app as opposed to several sites across a CDN

## Tools in here
This has a configuration of polymer.json, a format used by the polymer CLI in order to create 3 builds of your assets.
- es6+ - This is labeled es6 but is running es8 capable build which all Evergreen browsers support.
- es6-amd - a few rare versions of Safari and many older versions of Firefox could handle ES6 spec but NOT `import`
- es5-amd - compiled to work on IE11, older versions of Edge, Firefox and Safari

### Polymer? We don't want no stinkin..
This uses the polymer CLI for the time being. Once other plugins are written to do in-place, unbundled file building we'll update but for now it does a great job and has no requirement on using polymer in your project as it's just for commandline.

## How does it work?
The file in `/build.js` does feature detection in order to establish if this is an ESM capable platform or needs a different build at run time. This reduces the integration with your platform / CMS / application down to two lines of `<script>` tags. The 1st adds support for CDNs as well as an option for `forceUpdate` which if the browser can't serve the build.js file it will force the user to a page asking them to upgrade.

We feature detect `import()` which 90+% of traffic supports as of end of 2019 and inject ES module based `<script type="module">` imports. From there we try and detect which polyfills are needed based on the platform.

It has been heavily battle tested and is used in production in mutliple domains and websites.

## Who dis
This approach was developed by Penn State and tested by The US National Archives for accuracy.
