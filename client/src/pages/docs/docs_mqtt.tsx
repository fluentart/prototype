import React from "react";
import { colors, theme } from "../../theme"
import { api } from "../../api"
import { CodeBlock } from "../../components/codeblock"

interface MyProps { }

interface MyState {
    //[index: string]: any
}

export class DocsMQTT extends React.Component<MyProps, MyState> {
    state = {}

    render() {
        return (
            <div>
                <h4>MQTT</h4>

                <p>This code example is for nodejs users, but should be similar for other mqtt clients</p>

                <CodeBlock language="javascript" value={`
var mqtt = require('mqtt');
var config = { apikey: "` + api.data.account.apikey + `" };
var client  = mqtt.connect("mqtt://` + window.location.hostname + `", {username:"api", password:"key-" + config.apikey });

client.on('connect', function () {
  console.log("connected.");
  client.subscribe(config.apikey, function (err) {
    if (err) { console.log(err) }
    console.log("subscribed.")
  })
  
  setInterval(()=>{
    client.publish(config.apikey, JSON.stringify({id:"mqttDevice01", data: { a: Math.random() }}) );
  },1000)
})

client.on('message', (topic, message) => { console.log(message.toString()); })`} />
            </div>
        );
    }
}

