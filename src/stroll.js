import create_stroller from "./factory";
import { create_element_adapter, create_window_adapter } from "./adapters";

const public_adapters = {
    element: create_element_adapter
};

const stroll = create_stroller(create_window_adapter());

stroll.factory = function(el, adapter = "element") {
    if(typeof adapter === "string") {
        adapter = public_adapters[adapter];
    }
    
    return create_stroller(adapter(el));
};

export default stroll;
