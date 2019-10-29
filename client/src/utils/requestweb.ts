/*
    thin compatiblity layer for node request code to work in the browser.
*/

export class RequestWeb {
    constructor() { }

    get(uri, options, cb: (err: Error, res?: any, body?: object) => void) {
        fetch(uri, {
            method: "GET",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: "same-origin"
        }).then(response => response.json())
            .then(resp => {
                if (resp.err) {
                    cb(resp);
                    return;
                }
                cb(undefined, true, resp);
            }).catch((err) => {
                console.log(err.toString());
                cb(err);
            });
    }

    post(uri: string, options: { json: object }, cb: (err: Error, res?: any, body?: object) => void) {
        fetch(uri, {
            method: "POST",
            headers: {
                "Accept": "application/json",
                "Content-Type": "application/json"
            },
            credentials: "same-origin",
            body: JSON.stringify(options.json)
        }).then(response => response.json())
            .then(resp => {
                if (resp.err) {
                    cb(resp);
                    return;
                }
                if (resp.error) {
                    cb(resp);
                    return;
                }
                cb(undefined, true, resp);
            }).catch((err) => {
                console.log(err.toString());
                cb(err);
            });
    }
}

export var request = new RequestWeb();