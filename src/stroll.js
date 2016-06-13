let current_stroll;

function is_pos_outside_document(pos) {
    if(typeof pos !== "number") return true;

    const max = Math.max(
        document.body.scrollHeight,
        document.body.offsetHeight,
        document.documentElement.clientHeight,
        document.documentElement.scrollHeight,
        document.documentElement.offsetHeight
    ) - window.innerHeight;

    return pos < 0 || pos > max;
}

function current_position() {
    return window.scrollY || window.pageYOffset;
}

function create_options(options) {
    return Object.assign({
        ignore_user_scroll: false,
        allow_invalid_positions: false,
        offset: 0,
        duration: 500,
        focus: true,
        // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
        easing: (t, b, c, d) => {
            t /= d / 2;
            if(t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
    }, stroll.DEFAULTS, options, {
        start: current_position()
    });
}

function resolve_target(user_target, start, offset) {
    const type = typeof user_target;
    const target = type === "string" ? document.querySelector(user_target) : user_target;
    const result = {};

    if(user_target === null || type === "undefined") {
        result.target = offset;
        result.focus = false;
        return result;
    }

    if(type === "number") {
        result.target = user_target - start + offset;
        result.focus = false;
        return result;
    }

    if(!target || !target.getBoundingClientRect) {
        throw new Error("invalid target");
    }

    result.element = target;
    result.target = target.getBoundingClientRect().top + offset;

    return result;
}

function resolve_duration(duration, distance) {
    const type = typeof duration;

    if(type === "number") return duration;
    if(type === "function") return duration(distance);

    const parsed = parseFloat(duration);

    if(isNaN(parsed)) {
        throw Error("invalid duration");
    }

    return parsed;
}

function create_loop(options) {
    function start_loop(resolve) {
        let animation_frame;
        let time_start;
        let last_pos;

        function loop(time_current) {
            if(!time_start) {
                time_start = time_current
            }

            const time_elapsed = time_current - time_start;
            const new_pos = Math.round(options.easing(time_elapsed, options.start, options.target, options.duration));

            if(!options.allow_invalid_positions && is_pos_outside_document(new_pos)) {
                return current_stroll("invalid_position");
            }

            if(!options.ignore_user_scroll && last_pos && last_pos !== current_position()) {
                return current_stroll("user_scrolled");
            }

            if(time_elapsed > options.duration) {
                done(resolve);
            } else {
                window.scrollTo(0, new_pos);
                last_pos = current_position();
                next();
            }
        }

        function next() {
            animation_frame = requestAnimationFrame(loop);
        }

        if(current_stroll) {
            current_stroll("new_stroll");
        }

        next();

        return current_stroll = (cancel_reason) => {
            cancelAnimationFrame(animation_frame);
            resolve({ was_cancelled: true, cancel_reason });
        }
    }

    function done(resolve) {
        current_stroll = null;

        // easing might create small offsets from the requested target
        window.scrollTo(0, options.start + options.target);

        // keyboard navigation might reset the scroll position
        // this sets focus to the element to prevent such problems
        if(options.element && options.focus) {
            if(!options.element.hasAttribute("tabindex")) {
                options.element.setAttribute("tabindex", "-1")
            }

            options.element.focus()
        }

        resolve({ was_cancelled: false });
    }

    return { start: start_loop };
}

function stroll(target, options = {}) {
    return new Promise((resolve) => {
        const stroll_options = create_options(options);
        const stroll_target = resolve_target(target, stroll_options.start, stroll_options.offset);
        const duration = resolve_duration(stroll_options.duration, Math.abs(stroll_target.target));
        const loop = create_loop(Object.assign({}, stroll_options, stroll_target, { duration }));

        loop.start(resolve);
    });
}

stroll.relative = (offset, options = {}) => stroll(null, Object.assign({ offset }, options));
stroll.DEFAULTS = {};

export default stroll;
