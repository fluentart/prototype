export class MomentAlt {
    date;
    constructor(input) {
        if (input == undefined) {
            // no data input...
        } else {
            this.date = new Date(input);
        }

    }

    fromNow() {
        if (this.date == undefined) { return "never" }
        var seconds = Math.floor((new Date().getTime() - this.date.getTime()) / 1000);

        var interval = Math.floor(seconds / 31536000);

        if (interval > 1) {
            return interval + "y ago";
        }
        interval = Math.floor(seconds / 2592000);
        if (interval > 1) {
            return interval + "m ago";
        }
        interval = Math.floor(seconds / 86400);
        if (interval > 1) {
            return interval + "d ago";
        }
        interval = Math.floor(seconds / 3600);
        if (interval > 1) {
            return interval + "h ago";
        }
        interval = Math.floor(seconds / 60);
        if (interval > 1) {
            return interval + "m ago";
        }

        if ((seconds >= 60) && (seconds < 120)) {
            return "a minute ago"
        }

        if (seconds > 0) {
            return Math.floor(seconds) + "s";
        }
        return "just now";
    }

    timeDelta() {
        var seconds = Math.floor((new Date().getTime() - this.date.getTime()) / 1000);

        var years = Math.floor(seconds / 31536000);
        var months = Math.floor(seconds / 2592000);
        var days = Math.floor(seconds / 86400);
        var hours = Math.floor(seconds / 3600);
        var minutes = Math.floor(seconds / 60);

        var output = "";
        if (days >= 1) {
            output += days + "d "
        }

        if (hours >= 1) {
            output += this.pad((hours % 24), 2, "0") + ":"
        }

        if (minutes >= 1) {
            output += this.pad((minutes % 60), 2, "0") + ":"
        }

        output += this.pad((seconds % 60), 2, "0") + "s"

        return output + " ago";
    }

    pad(input, digits, padString) {
        var str = input + "";
        while (str.length < digits)
            str = padString + str;
        return str;
    }
}

export function moment(input) {
    return new MomentAlt(input);
}