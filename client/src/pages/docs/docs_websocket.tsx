import React from "react";
import { colors, theme } from "../../theme"
import { api } from "../../api"
import { CodeBlock } from "../../components/codeblock"

interface MyProps { }

interface MyState {
  //[index: string]: any
}

export class DocsWebsocket extends React.Component<MyProps, MyState> {
  state = {}

  render() {
    return (
      <div>
        <h4>WEBSOCKET</h4>

        <p>BEING UPDATED FOR 5.1 please standby</p>
        {/*                 
                <p>This webapp uses websockets for real-time connectivity in the browser.
                    This can also be used from the command line.</p>

                <p>Node.js</p>

                <p>Download <a href="https://nodejs.org/en/">Node.js</a> and duplicate the code below in a <b>test.js</b> file. This code will connect to your account and stream data to your terminal. We use this method to keep a connection open to the server and will be ready to receive data when needed. This example will stream data from all your devices if configured correctly.</p>


                <CodeBlock language='javascript' value={`var socket = require("socket.io-client")("` + window.location.origin + `", { transports: ['websocket'] });
socket.on("connect", function (data) {
  console.log("connected.");
  socket.emit("join", "` + api.data.account.apikey + `"); // your api key

  // or subscribe to a specific device: 
  // socket.emit("join", "` + api.data.account.apikey + `|yourdevice001");

  // Receive data:
  socket.on("post", data => {
    console.log(data);
  });
});

// Send some data:
setInterval( ()=>{
  socket.emit("post", {id: "yourDevice001", data: { temperature: 25.0 } } )
},1000)

`} />

                <p>Install the socket.io-client dependency from the same folder.</p>

                <CodeBlock language="js" value={`// install the socket.io-client dependeny
$ npm install socket.io-client
// run your code
$ node test.js
connected.`} /> */}

      </div>
    );
  }
}

