import { PluginConfigTestProps } from "../../server/tests/tests"
import { describe, it, reporters } from "mocha";

import * as request from "request";
import { GatewayAdd, GatewayRemove } from "./lib/iotnxt";
import { generate } from "../../server/utils/utils"
var mqtt = require('mqtt');

export default function iotnxt_test(props: PluginConfigTestProps) {

    describe("PLUGIN TEST: [IOTNXT]", () => {

        const gateway: GatewayAdd = {
            GatewayId: 'automatedTestGateway_' + generate(32),
            Secret: 'gn2waKFXHoBuLSQs',
            HostAddress: 'greenqueue.prod.iotnxt.io',
            PublicKey: '<RSAKeyValue><Exponent>AQAB</Exponent><Modulus>rbltknM3wO5/TAEigft0RDlI6R9yPttweDXtmXjmpxwcuVtqJgNbIQ3VduGVlG6sOg20iEbBWMCdwJ3HZTrtn7qpXRdJBqDUNye4Xbwp1Dp+zMFpgEsCklM7c6/iIq14nymhNo9Cn3eBBM3yZzUKJuPn9CTZSOtCenSbae9X9bnHSW2qB1qRSQ2M03VppBYAyMjZvP1wSDVNuvCtjU2Lg/8o/t231E/U+s1Jk0IvdD6rLdoi91c3Bmp00rVMPxOjvKmOjgPfE5LESRPMlUli4kJFWxBwbXuhFY+TK2I+BUpiYYKX+4YL3OFrn/EpO4bNcI0NHelbWGqZg57x7rNe9Q==</Modulus></RSAKeyValue>'
        }

        /** ----------------------------------------------------------------- */

        it("Can add a gateway", done => {
            request.post(props.uri + "/api/v3/iotnxt/addgateway",
                { headers: props.headers, json: gateway }, (err, res, response) => {
                    if (err) done(err);
                    if (!response) { done(new Error("invalid response")); return; }

                    if (response.GatewayId != gateway.GatewayId.toUpperCase()) {
                        done(new Error("GatewayId does not match!"));
                        return;
                    }

                    if (response.Secret != gateway.Secret) {
                        done(new Error("Secret does not match!"));
                        return;
                    }

                    if (response.HostAddress != gateway.HostAddress) {
                        done(new Error("HostAddress does not match!"));
                        return;
                    }

                    if (!response.unique) {
                        done(new Error("Missing unique parameter"));
                        return;
                    }

                    if (!response["_created_on"]) {
                        done(new Error("Missing _created_on parameter"));
                        return;
                    }

                    if (!response["_created_by"]) {
                        done(new Error("Missing _created_by parameter"));
                        return;
                    }

                    if (!response._created_by.publickey) {
                        done(new Error("Missing user publickey on _created_by"));
                        return;
                    }


                    done();

                })
        })

        /** ----------------------------------------------------------------- */


        it("Can delete a gateway", function (done) {
            this.timeout(props.timeout); // crazy slow on prod.

            const gatewayremove: GatewayRemove = {
                GatewayId: gateway.GatewayId,
                HostAddress: gateway.HostAddress
            }

            request.post(props.uri + "/api/v3/iotnxt/removegateway",
                { headers: props.headers, json: gatewayremove },
                (err, res, response) => {

                    if (response.deletedCount == 1) {
                        done();
                    } else {
                        console.log(err, response);
                    }
                })

            /** ----------------------------------------------------------------- */

        });
    });
}
