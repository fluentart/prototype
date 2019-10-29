import React from "react";
import { colors, theme } from "../../theme"
import { api } from "../../api"

interface MyProps { }

interface MyState {
    //[index: string]: any
}

export class DocsApikey extends React.Component<MyProps, MyState> {

    state = {
        reveal: false,
        hiddenkey: ""
    }

    componentDidMount() {
        var hiddenkey = ""
        for (var x = 0; x < api.data.account.apikey.length; x++) { hiddenkey += "_" }
        this.setState({ hiddenkey })
    }



    render() {
        return (
            <div>
                <h4>APIKEY:</h4>
                <div>
                    <div style={{ display: "inline", float: "left" }} onMouseEnter={() => { this.setState({ reveal: true }); }} onMouseLeave={() => {
                        setTimeout(() => { this.setState({ reveal: false }) }, 500)
                    }}>
                        {(this.state.reveal)
                            ? <span style={{ color: colors.spotA, background: colors.spotC, padding: colors.padding }} id="accountApikey">{api.data.account.apikey}</span>
                            : <span style={{ color: colors.spotB, background: colors.spotC, padding: colors.padding }} id="accountApikey">{this.state.hiddenkey}</span>}

                        <button ><i className={"fa fa-key"} ></i> show</button>
                    </div>
                    <div style={{ clear: "both" }}></div>
                </div>
                <p>Hover to reveal it. Keep it secret, keep it safe. <br />
                    To get started we recommend using the HTTP REST api at first. See the next tab.</p>


            </div>
        );
    }
}

