function create_options(defaults, options, adapter) {
    return Object.assign({
        ignore_user_scroll: false,
        allow_invalid_positions: false,
        offset: { x: 0, y: 0 },
        duration: 500,
        focus: true,
        // Robert Penner's easeInOutQuad - http://robertpenner.com/easing/
        easing: (t, b, c, d) => {
            t /= d / 2;
            if(t < 1) return c / 2 * t * t + b;
            t--;
            return -c / 2 * (t * (t - 2) - 1) + b;
        }
    }, defaults, options, {
        start: adapter.get_current_position()
    });
}

function resolve_duration(duration, distance) {
    const type = typeof duration;

    if(type === "number") return duration;
    if(type === "function") return duration(distance);

    const parsed = parseFloat(duration);

    if(isNaN(parsed)) {
        throw new Error("invalid duration");
    }

    return parsed;
}

function resolve_offset(offset, adapter) {
    const type = typeof offset;

    if(type === "number") {
        return adapter.create_pos_from_number(offset);
    }

    if(type === "object") {
        if(typeof offset.x === "undefined") offset.x = 0;
        if(typeof offset.y === "undefined") offset.y = 0;
        
        return offset;
    }
    
    throw new Error("invalid offset");
}

function pos_abs(distance) {
    return { x: Math.abs(distance.x), y: Math.abs(distance.y) };
}

function pos_cmp(pos1, pos2) {
    return pos1.x === pos2.x && pos1.y === pos2.y;
}

function pos_add(pos1, pos2) {
    return { x: pos1.x + pos2.x, y: pos1.y + pos2.y };
}

function ease(easing, time_elapsed, start, target, duration) {
    return {
        x: Math.round(easing(time_elapsed, start.x, target.x, duration)),
        y: Math.round(easing(time_elapsed, start.y, target.y, duration))
    };
}

function create_loop(stroll, options) {
    const adapter = options.adapter;
    
    function start_loop(resolve) {
        let animation_frame;
        let time_start;
        let last_pos;

        function loop(time_current) {
            if(!time_start) {
                time_start = time_current
            }

            const time_elapsed = time_current - time_start;
            const new_pos = ease(options.easing, time_elapsed, options.start, options.target, options.duration);

            if(!options.allow_invalid_positions && adapter.is_pos_outside_el(new_pos)) {
                return stroll.current_stroll("invalid_position");
            }

            if(!options.ignore_user_scroll && last_pos && !pos_cmp(last_pos, adapter.get_current_position())) {
                return stroll.current_stroll("user_scrolled");
            }

            if(time_elapsed > options.duration) {
                done(resolve);
            } else {
                adapter.scroll_to(new_pos);
                last_pos = adapter.get_current_position();
                next();
            }
        }

        function next() {
            animation_frame = requestAnimationFrame(loop);
        }

        if(stroll.current_stroll) {
            stroll.current_stroll("new_stroll");
        }

        next();

        return stroll.current_stroll = (cancel_reason) => {
            cancelAnimationFrame(animation_frame);
            resolve({ was_cancelled: true, cancel_reason });
        }
    }

    function done(resolve) {
        stroll.current_stroll = null;

        // easing might create small offsets from the requested target
        adapter.scroll_to(pos_add(options.start, options.target));

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

function create_stroller(adapter) {
    function stroll(target, options = {}) {
        return new Promise((resolve) => {
            const stroll_options = create_options(stroll.DEFAULTS, options, adapter);
            const offset = resolve_offset(stroll_options.offset, adapter);
            const stroll_target = adapter.resolve_target(target, stroll_options.start, offset);
            const duration = resolve_duration(stroll_options.duration, pos_abs(stroll_target.target));
            const loop = create_loop(stroll, Object.assign({}, stroll_options, stroll_target, { 
                duration, offset, adapter
            }));

            loop.start(resolve);
        });
    }

    stroll.current_stroll = null;
    stroll.relative = (offset, options = {}) => stroll(null, Object.assign({ offset }, options));
    stroll.DEFAULTS = {};

    return stroll;
}

export default create_stroller;
