# stroll.js
stroll.js is strolling along in your viewport

## Usage

```es6
import stroll from "stroll.js";

stroll(".target");
```

stroll returns native Promises. It resolves, once scrolling is complete or rejects
if it was cancelled (by calling stroll again while it’s strolling along).

stroll’s first argument can be a number (absolute position in viewport), a selector string
or something that has a getBoundingClientRect function.

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
Scroll 100px from the current position

```es6
stroll(null, { offset: 100 })
// or
stroll.relative(100)
```

### Changing defaults
Change default duration to 2 seconds

```es6
stroll.DEFAULTS.duration = 2 * 1000
```

### ALL the settings
Scroll to target link anchor - 70px with easeInOutElastic easing for a duration of 10 times 
the distance to the element and don’t focus

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

## Shout-out
... goes to jump.js for inspiring me to create my own implementation. They’ve worked on v1.0.0,
when I created this, and I wasn’t happy with 0.4.0 :).
