import { PluginConfigTestProps } from "../../server/tests/tests"
import { describe, it } from "mocha";

import * as request from "request";
import { generateDifficult } from "../../server/utils/utils";
var mqtt = require('mqtt');

export default function mqtt_test(props: PluginConfigTestProps) {

    var mqtturi = props.mqtturi


    describe("PLUGIN TEST: [MQTT]", () => {

        it("MQTT can connect", done => {
            var client = mqtt.connect(mqtturi, {
                username: "api",
                password: "key-" + props.account.apikey
            });

            client.on('connect', () => {
                done();
            })
        })



        it("HTTP -> MQTT (APIKEY WIDE SUB)", function (done) {
            this.timeout(props.timeout); // crazy slow on prod.

            var packet = {
                id: "prottesthttpmqtt" + generateDifficult(8), // more unique devid
                data: { random: Math.random() }
            }

            var client = mqtt.connect(mqtturi, { username: "api", password: "key-" + props.account.apikey });

            client.on('connect', () => {
                client.subscribe(props.account.apikey, { qos: 1 }, (err: Error) => {
                    if (err) { console.log(err) }
                    request.post(props.uri + "/api/v4/data/post", { headers: props.headers, json: packet })
                })
            })

            client.on('message', (topic: string, message: Buffer) => {
                var parsed = JSON.parse(message.toString());
                if (parsed.data.random == packet.data.random) {

                    client.end(false, () => {
                        done();
                    });

                } else {
                    // might recieve multiple packets so removing this.
                    // done(new Error("MQTT Packet does not match posted over HTTP"))
                }

            })
        })



        it("HTTP -> MQTT (PER DEVICE SUB)", function (done) {
            this.timeout(props.timeout); // crazy slow on prod.

            var packet = {
                id: "prottesthttpmqtt" + generateDifficult(8), // more unique devid
                data: { random: Math.random() }
            }

            var dummypacket = {
                id: "shouldnotseethis" + generateDifficult(8), // more unique devid
                data: { random: Math.random() }
            }

            var client = mqtt.connect(mqtturi, { username: "api", password: "key-" + props.account.apikey });

            client.on('connect', () => {
                client.subscribe(props.account.apikey + "|" + packet.id, { qos: 1 }, (err: Error) => {
                    if (err) { console.log(err) }

                    request.post(props.uri + "/api/v4/data/post", { headers: props.headers, json: dummypacket }, () => {
                        // once done we post the real one.
                        request.post(props.uri + "/api/v4/data/post", { headers: props.headers, json: packet });
                    })

                })
            })

            client.on('message', (topic: string, message: Buffer) => {
                var parsed = JSON.parse(message.toString());
                if (parsed.data.random == packet.data.random) {
                    client.end(false, () => {
                        done();
                    });
                } else {
                    done(new Error("MQTT Packet does not match posted over HTTP"))
                }
            })
        })


        /** We test publishing on MQTT and using HTTP API to check if data was recieved correctly. */
        it("MQTT -> HTTP", done => {
            const packet = { id: "mqttdevicetest1", data: { a: Math.random() } };

            var client = mqtt.connect(mqtturi, { username: "api", password: "key-" + props.account.apikey });

            client.on('connect', function () {
                client.publish(props.account.apikey, JSON.stringify(packet), { qos: 1 }, () => {
                    request.post(props.uri + "/api/v4/view", { headers: props.headers, json: { id: packet.id } }, (err, res, response) => {
                        if (err) done(err);
                        if (response) {
                            if (response.data.a = packet.data.a) { done() } else { done(new Error("faulty data packet")); }
                        }
                    });
                });
            })

        })



    });


}
