import * as request from "request"
import { generateDifficult } from "../utils/utils"

export interface Gateway {
    GatewayId: string;
    Secret: string;
    HostAddress: string;
    PublicKey: string;
}

export class iotnxt {
    uri: string = "";
    parent: any;
    addgateway: any;
    setgatewaydevice: any;
    getgateways: any;
    removegateway: any;

    constructor(options?: any) {
        if (options) {
            this.parent = options;
            if (options.uri) this.uri = options.uri;
        }
        this.addgateway = this.addgatewayfunction;
        this.setgatewaydevice = this.setgatewaydevicefunction;
        this.getgateways = this.getgatewaysfunction;
        this.removegateway = this.removegatewayfunction;
    }


    addgatewayfunction(gateway: Gateway, cb?: any) {
        var gatewaySend = {
            GatewayId: "gateway",
            Secret: generateDifficult(16),
            HostAddress: "greenqueue.prod.iotnxt.io",
            PublicKey: "<RSAKeyValue><Exponent>AQAB</Exponent><Modulus>rbltknM3wO5/TAEigft0RDlI6R9yPttweDXtmXjmpxwcuVtqJgNbIQ3VduGVlG6sOg20iEbBWMCdwJ3HZTrtn7qpXRdJBqDUNye4Xbwp1Dp+zMFpgEsCklM7c6/iIq14nymhNo9Cn3eBBM3yZzUKJuPn9CTZSOtCenSbae9X9bnHSW2qB1qRSQ2M03VppBYAyMjZvP1wSDVNuvCtjU2Lg/8o/t231E/U+s1Jk0IvdD6rLdoi91c3Bmp00rVMPxOjvKmOjgPfE5LESRPMlUli4kJFWxBwbXuhFY+TK2I+BUpiYYKX+4YL3OFrn/EpO4bNcI0NHelbWGqZg57x7rNe9Q==</Modulus></RSAKeyValue>"
        }

        if (gateway.GatewayId) gatewaySend.GatewayId = gateway.GatewayId;
        if (gateway.Secret) gatewaySend.Secret = gateway.Secret;
        if (gateway.HostAddress) gatewaySend.HostAddress = gateway.HostAddress;
        if (gateway.PublicKey) gatewaySend.PublicKey = gateway.PublicKey;


        request.post(this.uri + "/api/v3/iotnxt/addgateway", {
            headers: this.parent.headers,
            json:
                gatewaySend
        }
            , (err, res, body) => {
                if (err) { if (cb) cb(err); }
                if (body) {
                    if (body.error) { cb(new Error(body.error)); return; }
                    cb(null, body);
                }
            });
    }

    setgatewaydevicefunction(key: string, id: string, GatewayId: string, HostAddress: string, options: any, cb: Function) {
        var setgatewayPacket = { key, id, GatewayId, HostAddress }
        if (options == "devid") { delete setgatewayPacket.key }
        request.post(this.uri + "/api/v3/iotnxt/setgatewaydevice", {
            headers: this.parent.headers,
            json:
                setgatewayPacket
        }
            , (err, res, body) => {
                if (err) { cb(new Error(body.err)); return; }
                if (body) {
                    if (body.nModified == 1) { cb(null, body); return; }
                    else { cb(new Error(body.err)); return; }
                }
            });
    }

    getgatewaysfunction(cb: Function) {
        request.get(this.uri + "/api/v3/iotnxt/gateways",
            { headers: this.parent.headers, json: true },
            (err: Error, res: any, body: any) => {
                if (err) cb(err);
                if (body) {
                    cb(null, body);
                }
            })
    }

    removegatewayfunction(gateway: any, cb: any) {
        var gatewaySend = {
            GatewayId: "gateway",
            Secret: generateDifficult(16),
            HostAddress: "greenqueue.prod.iotnxt.io",
            PublicKey: "<RSAKeyValue><Exponent>AQAB</Exponent><Modulus>rbltknM3wO5/TAEigft0RDlI6R9yPttweDXtmXjmpxwcuVtqJgNbIQ3VduGVlG6sOg20iEbBWMCdwJ3HZTrtn7qpXRdJBqDUNye4Xbwp1Dp+zMFpgEsCklM7c6/iIq14nymhNo9Cn3eBBM3yZzUKJuPn9CTZSOtCenSbae9X9bnHSW2qB1qRSQ2M03VppBYAyMjZvP1wSDVNuvCtjU2Lg/8o/t231E/U+s1Jk0IvdD6rLdoi91c3Bmp00rVMPxOjvKmOjgPfE5LESRPMlUli4kJFWxBwbXuhFY+TK2I+BUpiYYKX+4YL3OFrn/EpO4bNcI0NHelbWGqZg57x7rNe9Q==</Modulus></RSAKeyValue>"
        }

        var temp = gateway.filter((gate: any) => gate.GatewayId == gatewaySend.GatewayId)
        const arrayToObject = (array: any) =>
            array.reduce((obj: any, item: any) => {
                obj = item
                return obj
            }, {})

        var gateways = arrayToObject(temp)
        request.post(this.uri + "/api/v3/iotnxt/removegateway", {
            headers: this.parent.headers,
            json:
                gateways
        }
            , (err, res, body) => {
                if (err) { if (cb) cb(err); }
                if (body) {
                    if (body.error) { cb(new Error(body.error)); return; }
                    cb(null, body);
                }
            });
    }
}