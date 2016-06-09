# stroll.js
A tiny library without dependencies for smooth scrolling in modern browsers.
 
## Installation

### NPM
```bash
npm install stroll.js --save
```

### Script
Just include the `dist/scroll.min.js` but refer to the polyfill section below. As the `dist` is not
part of the repository you still need to install the package via npm.


## Usage

```es6
import stroll from "stroll.js";

stroll(".target");
```

stroll returns native Promises. It resolves once scrolling is complete or rejects
if it was cancelled (by calling stroll again while it’s strolling along).

stroll’s first argument can be a number (absolute position in viewport), a selector string
or something that has a getBoundingClientRect function. You can also pass null, if you want to
scroll from the current position.

stroll’s second argument can be an object, with one or more of the following properties:

### duration (number|function, 500)
time in milliseconds or a function that returns a duration for a given distance
 
### offset (number, 0)
is added to the final scroll position. pass a negative number, if you want some space for your fixed header ;)

### focus (bool, true)
should the element you scroll to be focused once scrolling is done? this keeps keyboard navigation intact.
  
### easing (function, easeInOutQuad from [Robert Penner](http://robertpenner.com/easing/))
timing function


## Examples

### Relative Scrolling
Scroll 100px from the current position.

```es6
stroll(null, { offset: 100 })
// or
stroll.relative(100)
```

### Changing defaults
Change default duration to 2 seconds.

```es6
stroll.DEFAULTS.duration = 2 * 1000
```

### ALL the settings
Scroll to target link anchor - 70px with easeInOutElastic easing for a duration of 10 times 
the distance to the element and don’t focus.

```es6
stroll(target.getAttribute("href"), {
    offset: -70,
    duration: (distance) => 10 * distance,
    focus: false,
    easing: (t, b, c, d) => {
        var s=1.70158;var p=0;var a=c;
        if (t==0) return b;  if ((t/=d/2)==2) return b+c;  if (!p) p=d*(.3*1.5);
        if (a < Math.abs(c)) { a=c; var s=p/4; }
        else var s = p/(2*Math.PI) * Math.asin (c/a);
        if (t < 1) return -.5*(a*Math.pow(2,10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )) + b;
        return a*Math.pow(2,-10*(t-=1)) * Math.sin( (t*d-s)*(2*Math.PI)/p )*.5 + c + b;
    }
});
```

### Promise API
Stroll to `.target`, wait 2 seconds, scroll +500px from current position, wait 1 second, scroll
to beginning of the document.

```es6
function wait(time) {
    return new Promise((resolve, reject) => {
        setTimeout(resolve, time);    
    });
}

stroll(".target")
    .then(() => wait(2 * 1000))
    .then(() => stroll.relative(500))
    .then(() => wait(1 * 1000))
    .then(() => stroll(0));
```


### Browser Compatibility
stroll.js uses is build for modern Browsers. It uses the  Object.assign, requestAnimationFrame and Promise APIs.
You may want to polyfill these. requestAnimationFrame is widespread nowadays, but Object.assign and Promises
are quite new additions and part of ES-2015. Polyfills that should work for you:

* requestAnimationframe: [raf](https://www.npmjs.com/package/raf) 
* Object.assign: [object-assign-shim](https://www.npmjs.com/package/object-assign-shim)
* Promise: [es6-promise](https://www.npmjs.com/package/es6-promise)

Without polyfills you should be fine in Edge (12+), Safari 9 and and all current versions of Firefox 
and Chromium/Chrome.


## Shout-out
... goes to [jump.js](https://github.com/callmecavs/jump.js) for inspiring me to create my own implementation. 
They’ve worked on v1.0.0, when I created this, and I wasn’t happy with 0.4.0 :).
