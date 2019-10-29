import React from "react";
import { colors, theme } from "../../theme"
import { api } from "../../api"
import { CodeBlock } from "../../components/codeblock"

interface MyProps { }

interface MyState {
    //[index: string]: any
}

export class DocsHTTPS extends React.Component<MyProps, MyState> {

    state = {
        testPacket: {
            "id": "yourDevice001",
            "data": {
                "temperature": 24.54,
                "doorOpen": false,
                "gps": {
                    "lat": 25.123,
                    "lon": 28.125
                }
            }
        },
        spec: undefined
    }

    sendHttpRestTest = () => {
        //console.log("TEST")
        fetch("/api/v3/data/post", {
            method: "POST", headers: { "Accept": "application/json", "Content-Type": "application/json" },
            body: JSON.stringify(this.state.testPacket)
        }).then(response => response.json()).then(resp => {
            //console.log(resp);
        }).catch(err => console.error(err.toString()));
    }

    componentDidMount = () => {
        api.getapispec((err, spec) => {
            //console.log(spec);
            this.setState({ spec })
        })
    }

    generateDocFromSpec = () => {
        if (this.state.spec) {
            return <div>
                {this.state.spec.map((a, i) => {
                    return <div key={i} style={{ border: colors.borders, background: colors.spotC, padding: colors.padding, marginBottom: colors.padding * 2 }}>



                        <div style={{ padding: colors.padding }}>
                            <p>{a.description}</p>
                        </div>

                        <div>
                            <div style={{ padding: colors.padding, width: "50%", boxSizing: "border-box", float: "left" }}>

                                {(a.method == "get")
                                    ? <strong><a href={a.path}>{a.method.toUpperCase()} {a.path} </a></strong>
                                    : <strong>{a.method.toUpperCase()} {a.path} </strong>
                                }


                                <CodeBlock language='json' value={JSON.stringify(a.post, null, 2)} /></div>
                            <div style={{ padding: colors.padding, width: "50%", boxSizing: "border-box", float: "right" }}>
                                Response:
                                <CodeBlock language='json' value={JSON.stringify(a.response, null, 2)} /></div>
                            <div style={{ clear: "both" }} />
                        </div>

                    </div>
                })}
            </div>
        } else {
            return <div></div>
        }
    }

    render() {
        var authheader = 'Basic ' + Buffer.from("api:key-" + api.data.account.apikey).toString('base64')
        var apiCall = { path: window.location.origin }
        var samplePacket = { "id": "yourDevice001", "data": { "temperature": 24.54, "doorOpen": false, "gps": { "lat": 25.123, "lon": 28.125 } } }

        var size = (window.innerWidth < 800) ? "small" : "large";

        //responsive
        var columnStyles: any = (window.innerWidth < 800)
            ? { width: "100%", boxSizing: "border-box" }
            : { width: "50%", float: "left", boxSizing: "border-box", padding: colors.padding, paddingRight: colors.padding * 4 };

        return (
            <div>

                <div style={columnStyles}>
                    <h4>HTTP/S API</h4>
                    <hr />

                    <p>To get started we recommend using the HTTP REST api at first.</p>

                    <div style={{ background: colors.spotC, padding: colors.padding }}>
                        <i className={"fa fa-exclamation-triangle"} ></i> NOTICE
                    <p>HTTP/S is not for instant commands to a device</p>
                        <p>Sending recieving data with http/s is often the simplest.
                                        You can send data to a server, and you can ask the server if it has data for you.
                                        The only real issue with using HTTP/S is you can not keep a connection open and wait
                                        for new data as you can with websocket/mqtt. If you require this functionality, like
                                        for instance if you need to be able to command the device to do something immediately
                    then you should look at using websocket or mqtt instead.</p>
                        <p>That said the HTTP/S API provides some functionality you can not get with WEBSOCKET/MQTT integration.
                            Examples of this would be to request a full list of all devices on your account and their last state
                        or the status of your account.</p>
                    </div>



                    <p>The procedure involves setting up the authentication headers for the
                        call and pointing the call to the correct server. You may also add
                    the body with data if applicable.</p>

                    <p>The type of authorization needs to be "Basic Auth" with these details:<br /><br />
                        Username: <span style={{ color: colors.spotA }}>api</span><br />
                        Password: <span style={{ color: colors.spotA }}>key-{api.data.account.apikey}</span>
                    </p>
                    <p>Using tools such as <a href="https://www.getpostman.com/">POSTMAN</a>, you can generate a base64 encoded
                    header automatically. Depending on the tool used to make the call, an "Authorization" header may need to be
                generated manually.</p>



                    <h3>HEADERS</h3>

                    <p>Only two headers are required. The tool/software used will usually handle the Authorization header
                    construction based on the username/password.</p>

                    <pre style={{ color: colors.spotA }}>"Authorization":"{authheader}"<br />
                        "Content-Type":"application/json"</pre>




                    <div className="col-12 commanderBgPanel" style={{ marginBottom: 20 }}>
                        <h4 className="spot" style={{ padding: "30px 0 0 0" }}>HTTP</h4>

                        <p>Documentation for HTTP(S) REST API:</p>

                        <p>Sending and recieving data using HTTP(S) is the simplest. If you need to
                        have a device connect and wait for commands from the cloud the best would
              be to use MQTT or SOCKET.IO instead.</p>

                        <p>Example code for python, C# and node/js is available here: <a href="https://github.com/IoT-nxt/prototype/tree/dev/examples">https://github.com/IoT-nxt/prototype/tree/dev/examples</a></p>
                    </div>

                    <div className="col-xl-6 commanderBgPanel" >
                        <p style={{ paddingTop: 10 }}>The API call to add a device and update a device is identical. The data will be merged in the current state. Changes will be stored as packets and these packets will represents the history of a device.</p>
                        <p>You can make the "id" anything you want as long as it is unique to your account. </p>
                        <p>The "data" section of the packet can contain anything you'd like as long as it is valid JSON.</p>
                    </div>

                    <div className="col-xl-6 commanderBgPanel" >
                        <div className="row" style={{ paddingTop: 30 }}>
                            <div className="col-md-3">
                                <h6>METHOD:</h6>
                                <pre className="commanderBgPanel">POST</pre>
                            </div>
                            <div className="col-md-9">
                                <h6>URL</h6>
                                <pre className="commanderBgPanel">{apiCall.path + "/api/v3/data/post"}</pre>
                            </div>

                            <div className="col-md-12">
                                <h6>BODY ( Content-Type: "application/json" )</h6>
                                <CodeBlock language='javascript' value={`{
  "id": "yourDevice001", 
  "data": { 
    "temperature": 24.54, 
    "doorOpen": false, 
    "gps": { 
      "lat": 25.123, 
      "lon": 28.125 
    } 
  } 
}`} />

                            </div>
                            <div className="col-md-12">
                                <button onClick={this.sendHttpRestTest}>TEST</button>
                            </div>

                            <div className="col-md-12">
                                <h5 style={{ paddingTop: 20 }}>QUICK CURL SNIPPET:</h5>

                                <CodeBlock language='bash' value={"curl --user 'api:key-" +
                                    api.data.account.apikey +
                                    '\' -X POST -H "Content-Type: application/json" -d \'' + JSON.stringify(samplePacket) + '\' ' +
                                    window.location.origin +
                                    "/api/v3/data/post"} />
                            </div>

                        </div>
                    </div>





                    <div className="col-md-6 commanderBgPanel" >
                        <h4 className="spot" style={{ paddingTop: 50 }}></h4>
                        <p>To get all the current device state data is simple. Just click on the url on the right.</p>
                    </div>

                    <div className="col-md-6 commanderBgPanel" >

                        <div className="row" style={{ paddingTop: 60 }}>
                            <div className="col-md-3">
                                <h6>METHOD:</h6>
                                <pre className="commanderBgPanel">GET</pre>
                            </div>
                            <div className="col-md-9">
                                <h6>URL</h6>
                                <div className="commanderBgPanel"><a className="apidocsLinkUrl" href={apiCall.path + "/api/v3/states"}>{apiCall.path + "/api/v3/states"}</a></div>
                            </div>

                            <div className="col-12">
                                <h5 style={{ paddingTop: 20 }}>QUICK CURL SNIPPET:</h5>

                                <CodeBlock language='bash' value={"curl --user 'api:key-" +
                                    api.data.account.apikey +
                                    '\' -X GET -H "Content-Type: application/json" ' +
                                    window.location.origin +
                                    "/api/v3/states"} />
                            </div>

                        </div>

                    </div>


                </div>

                <div style={columnStyles}>
                    {this.generateDocFromSpec()}
                </div>

                <div style={{ clear: "both" }} />
            </div>
        );
    }
}

