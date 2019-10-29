export function blendrgba(x: any, y: any, ratio: number) {

    if (ratio <= 0) {
        return "rgba(" + Math.round(x.r) + "," + Math.round(x.g) + "," + Math.round(x.b) + "," + x.a + ")"
    } else if (ratio >= 1) {
        return "rgba(" + Math.round(y.r) + "," + Math.round(y.g) + "," + Math.round(y.b) + "," + y.a + ")"
    } else {
        var blended = {
            r: (x.r * (1 - ratio)) + (y.r * ratio),
            g: (x.g * (1 - ratio)) + (y.g * ratio),
            b: (x.b * (1 - ratio)) + (y.b * ratio),
            a: (x.a * (1 - ratio)) + (y.a * ratio),
        }
        return "rgba(" + Math.round(blended.r) + "," + Math.round(blended.g) + "," + Math.round(blended.b) + "," + blended.a + ")"
    }

}