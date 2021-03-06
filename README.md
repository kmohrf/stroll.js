# stroll.js
A tiny library without dependencies for smooth scrolling in modern browsers.
Think of [Mr. Toast](https://www.youtube.com/watch?v=W8pTG9Mlm0I)!
 
## Installation

### NPM
```bash
npm install stroll.js --save
```

### Script
Just include the `dist/scroll.min.js` but refer to the polyfill section below. As the `dist` folder is not
part of the repository you still need to install the package via npm.


## Usage

```es6
import stroll from "stroll.js";

stroll(".target");
```

stroll returns native Promises. It resolves to an object once scrolling is complete. The object contains a single
property named `wasCancelled` that indicates if scrolling was completed (in case stroll was called again
before it finished it’s `false`).

stroll’s first argument can be a number (absolute position in viewport on _primary scroll axis_), a selector string,
an object with an x and/or y key or something that has a getBoundingClientRect function. You can also pass null, 
if you want to scroll from the current position.

Whenever the term _primary scroll axis_ is used it refers to the axis of an element that has the largest scroll width.
On window this most likely always is the y axis. For elements it depends. A carousel will probably use the x axis.

stroll’s second argument can be an object, with one or more of the following properties:

### duration (number|function, 500)
Time in milliseconds or a function that returns a duration for a given distance on x and y axis.
 
### offset (number|object, 0)
Is added to the final scroll position. Accepts an object with x and y key, or a number that is used
for the _primary scroll axis_.

### focus (bool, true)
Should the element you scroll to be focused once scrolling is done? this keeps keyboard navigation intact.
  
### easing (function, easeInOutQuad from [Robert Penner](http://robertpenner.com/easing/))
Timing function that is used to animate the scroll position.

### ignoreUserScroll (bool, false)
Whether or not programmatic scrolling should be aborted when a user has scrolled.
This works by checking if the last set scroll position equals the current position.

### allowInvalidPositions (bool, false)
Whether or not positions outside of the document are allowed during strolling or should trigger an early exit. 


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
the distances to the element, don’t focus and allow invalid positions during animation.

```es6
stroll(target.getAttribute("href"), {
    offset: -70,
    duration: (distance) => 10 * (distance.x + distance.y),
    focus: false,
    allowInvalidPositions: true,
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

## Scroll elements instead of window
stroll.js is able to scroll the window as well as elements. If you want to stroll an element you first
must create a stroll instance for this element.

```es6
const element = document.querySelector(".some-element");
const elementStroller = stroll.factory(element);
elementStroller.relative(500);
```

The `elementStroller` instance will have the same API as the default stroll instance (it misses the factory function 
though). 

### Browser Compatibility
stroll.js is build for modern Browsers. It uses the Object.assign, requestAnimationFrame and Promise APIs.
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
