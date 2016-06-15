function resolve_target_factory(el, create_pos_from_number) {
    return function resolve_target(user_target, start, offset) {
        const type = typeof user_target;
        const target = type === "string" ? el.querySelector(user_target) : user_target;
        const result = {};

        if(user_target === null || type === "undefined") {
            const zero = { x: 0, y: 0 };
            return resolve_target(offset, zero, zero);
        }

        if(type === "number") {
            const pos = create_pos_from_number(user_target);

            // add start and offset to axes, that are not 0 by default
            pos.x = pos.x - start.x + offset.x;
            pos.y = pos.y - start.y + offset.y;

            result.target = pos;
            result.focus = false;
            return result;
        }

        if(type === "object") {
            result.target = {
                x: (user_target.x || 0) - start.x + offset.x,
                y: (user_target.y || 0) - start.y + offset.y
            };
            result.focus = false;
            return result;
        }

        if(!target || !target.getBoundingClientRect) {
            throw new Error("invalid target");
        }

        const bounding_rect = target.getBoundingClientRect();
        result.element = target;
        result.target = {
            x: bounding_rect.left + offset.x,
            y: bounding_rect.top + offset.y
        };

        return result;
    }
}

function create_pos_from_number_factory(calculate_maxima) {
    return function(number) {
        const maxima = calculate_maxima();
        const primary_axis = maxima.y > maxima.x ? "y" : "x";
        const result = {};

        result[primary_axis] = number;
        result[primary_axis === "x" ? "y" : "x"] = 0;

        return result;
    }
}

function is_pos_outside_el_factory(calculate_maxima) {
    return function(pos) {
        if(typeof pos !== "object") return true;
        const maxima = calculate_maxima();
        return (pos.x < 0 || pos.x > maxima.x) || (pos.y < 0 || pos.y > maxima.y);
    }
}

function create_base_adapter(el, calculate_maxima) {
    const create_pos_from_number = create_pos_from_number_factory(calculate_maxima);
    const is_pos_outside_el = is_pos_outside_el_factory(calculate_maxima);
    const resolve_target = resolve_target_factory(el, create_pos_from_number);

    return { create_pos_from_number, resolve_target, is_pos_outside_el };
}

function create_window_adapter() {
    function calculate_maxima() {
        const doc_width = Math.max(
                document.body.scrollWidth,
                document.body.offsetWidth,
                document.documentElement.clientWidth,
                document.documentElement.scrollWidth,
                document.documentElement.offsetWidth
            ) - window.innerWidth;
        const x = Math.max(0, doc_width);

        const doc_height = Math.max(
                document.body.scrollHeight,
                document.body.offsetHeight,
                document.documentElement.clientHeight,
                document.documentElement.scrollHeight,
                document.documentElement.offsetHeight
            ) - window.innerHeight;
        const y = Math.max(0, doc_height);

        return { x, y };
    }

    return Object.assign(create_base_adapter(document, calculate_maxima), {
        get_current_position() {
            return {
                x: window.scrollX || window.pageXOffset,
                y: window.scrollY || window.pageYOffset
            };
        },
        scroll_to(pos) {
            window.scrollTo(pos.x, pos.y);
        }
    });
}

function create_element_adapter(el) {
    function calculate_maxima() {
        return {
            x: Math.max(0, el.scrollWidth - el.clientWidth),
            y: Math.max(0, el.scrollHeight - el.clientHeight)
        };
    }

    return Object.assign(create_base_adapter(el, calculate_maxima), {
        get_current_position() {
            return { x: el.scrollLeft, y: el.scrollTop };
        },
        scroll_to(pos) {
            el.scrollLeft = pos.x;
            el.scrollTop = pos.y;
        }
    });
}

export {
    create_window_adapter,
    create_element_adapter
}
