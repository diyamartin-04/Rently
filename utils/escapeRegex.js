// Escapes user input so it can be safely used inside a RegExp
// (prevents regex injection when searching listings by text).
module.exports = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
