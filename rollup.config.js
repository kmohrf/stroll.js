import babel from "rollup-plugin-babel";

export default {
    entry: "src/stroll.js",
    dest: "dist/stroll.js",
    format: "umd",
    moduleName: "stroll",
    plugins: [ babel() ]
};
