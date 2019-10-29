import React from "react";
import { theme, colors } from "../../theme"
import { Popup, PopupProps, PopUpState } from "./popup"
import { SearchBox } from "../searchbox"
import { CorePacket } from "../../../../server/shared/interfaces";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";
import { api } from "../../api"

/** To manage sharing of device(s) we need to pass in an array of devices. */
interface Props extends PopupProps {

}

interface MenuState {

}

/** This component needs to recieve an array of device(s) to allow the user to manage the share/access */
export class PopupAddWizard extends Popup<Props> {

    state = {
        title: "ADD DEVICE WIZARD",
        addBlankId: ""
    }


    constructor(props) {
        super(props);

    }

    render() {
        var size = "large";
        if (window.innerWidth < 800) { size = "small" }

        var devices = [{ name: "test" }, { name: "123" }]


        return this.popuprender(<div style={{ display: "flex", flexDirection: "column" }}>


            <div style={{ padding: colors.padding * 2, background: colors.bgDarker }} >
                Add blank device.

                <div style={{ display: "flex", flexDirection: "row", paddingTop: colors.padding, paddingBottom: colors.padding }}>

                    <div style={{ flex: 0 }}>
                        <i className="fas fa-plus-square" style={{ opacity: 0.5, padding: colors.padding }} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <input placeholder="type a name"
                            style={{ width: "100%" }}
                            value={this.state.addBlankId}
                            onChange={(e) => { this.setState({ addBlankId: e.target.value }) }}></input>
                    </div>

                    <div style={{ flex: 0 }}>
                        <button onClick={() => {
                            api.post({ id: this.state.addBlankId }, () => { this.close() })
                        }}
                            style={{ marginLeft: colors.padding, float: "right", whiteSpace: "nowrap" }}>
                            <i className="fas fa-check" style={{ color: colors.good }} /> Done</button>
                    </div>

                </div>

            </div>

            <div style={{ padding: colors.padding * 2, background: colors.bgDarker, marginTop: colors.padding }} >
                Search for your device, service and/or protocol:

                <div style={{ display: "flex", flexDirection: "row", paddingTop: colors.padding, paddingBottom: colors.padding }}>

                    <div style={{ flex: 0 }}>
                        <i className="fas fa-search" style={{ opacity: 0.5, padding: colors.padding }} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <select id="devices" style={{ width: "100%" }} onChange={() => { }} defaultValue={'DEFAULT'}>
                            <option value='DEFAULT' style={{ color: "gray" }} disabled>Select type of device...</option>

                            {devices.map((device, i) => {
                                return <option key={i} value={device.name} className="optiondropdown" style={{ width: "90%" }} >{device.name}</option>
                            })}
                        </select>
                    </div>

                    <div style={{ flex: 0 }}>
                        <button onClick={() => { }}
                            style={{ marginLeft: colors.padding, float: "right", whiteSpace: "nowrap" }}>
                            <i className="fas fa-chevron-right" style={{ color: colors.good }} /> Next</button>
                    </div>

                </div>

            </div>


            <div style={{ padding: colors.padding * 2, background: colors.bgDarker, marginTop: colors.padding }} >
                Add device by SERIAL NUMBER or TEMPORARY CODE:

                <div style={{ display: "flex", flexDirection: "row", paddingTop: colors.padding, paddingBottom: colors.padding }}>

                    <div style={{ flex: 0 }}>
                        <i className="fas fa-tag" style={{ opacity: 0.5, padding: colors.padding }} />
                    </div>

                    <div style={{ flex: 1 }}>
                        <input style={{ width: "100%" }} onChange={() => { }} />
                    </div>

                    <div style={{ flex: 0 }}>
                        <button onClick={() => { }}
                            style={{ marginLeft: colors.padding, float: "right", whiteSpace: "nowrap" }}>
                            <i className="fas fa-chevron-right" style={{ color: colors.good }} /> Next</button>
                    </div>

                </div>

            </div>

            <div style={{ padding: colors.padding * 2, textAlign: "right", opacity: 0.5 }}>
                Need help? Please contact our support
            </div>

        </div>)
    }
}
