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

### duration (number, 500)
time in milliseconds
 
### offset (number, 0)
is added to the final scroll position. pass a negative number, if you want some space for your fixed header ;)

### focus (bool, true)
should the element you scroll to be focused once scrolling is done? this keeps keyboard navigation intact.
  
### easing (function, easeInOutQuad from [Robert Penner](http://robertpenner.com/easing/))
timing function

## Shout-out

... goes to jump.js for inspiring me to create my own implementation. They’ve worked on v1.0.0,
when I created this, and I wasn’t happy with 0.4.0 :).
