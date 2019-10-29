// https://github.com/you-dont-need/You-Dont-Need-Lodash-Underscore

export function clone(obj) {
    return JSON.parse(JSON.stringify(obj));
}

export function filter(obj, func) {
    return obj.filter(func);
}

export function sortBy(obj, func) {
    return obj.concat().sort(func);
}