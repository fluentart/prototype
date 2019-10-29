import React from "react";
import { theme, colors } from "../../theme"
import { Popup, PopupProps, PopUpState } from "./popup"
import { SearchBox } from "../searchbox"
import { CorePacket } from "../../../../server/shared/interfaces";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";
import { api } from "../../api"

/** To manage sharing of device(s) we need to pass in an array of devices. */
interface ShareProps extends PopupProps {
    devices: CorePacket[]
}

interface MenuState {

}

/** This component needs to recieve an array of device(s) to allow the user to manage the share/access */
export class PopupShare extends Popup<ShareProps> {

    state = {
        title: "Share Options",
        user: undefined,
        sharedusers: []
    }

    shareConfirm = () => {
        console.log("Apply share of devices with", this.state.user.username)
        for (var device of this.props.devices) {

            if (!this.state.user) { return; }

            api.stateupdate({
                query: { key: device.key },
                update: { $addToSet: { access: this.state.user.publickey } }
            }, (err, result) => {
                if (err) console.log(err);
                if (result) {
                    console.log(result);
                    api.emit("doupdate")
                    this.props.onClose();
                }
            })
        }
    }

    unshare = (user) => {
        console.log("Remove share of devices with " + user.username)
        for (var device of this.props.devices) {
            api.stateupdate({
                query: { key: device.key },
                update: { $pull: { access: user.publickey } }
            }, (err, result) => {
                if (err) console.log(err);
                if (result) {
                    api.emit("doupdate")
                    console.log(result);
                }
            })
        }

    }

    constructor(props) {
        super(props);
        if (this.props.devices.length == 1) {
            if (this.props.devices[0].access) {
                if (this.props.devices[0].access.length > 0) {
                    api.users({ find: { publickey: { $in: this.props.devices[0].access } } }, (e, sharedusers) => {
                        console.log("sharedusers", sharedusers)
                        this.setState({ sharedusers })
                    })
                }
            }
        }
    }

    render() {
        var size = "large";
        if (window.innerWidth < 800) { size = "small" }

        // obtain shared users list

        var message = "Search for users to share " + this.props.devices.length + " devices with:"

        if (this.props.devices.length == 1) {
            message = "Search for users to share " + this.props.devices[0].id + " with:"
        }

        return this.popuprender(<div style={{ display: "flex", flexDirection: "column" }}>
            <div>{message}</div>

            <div style={{ padding: colors.padding * 2 }}><SearchBox onSelect={(user) => { console.log(user); this.setState({ user }); }} /></div>

            <div >
                {(this.state.user != undefined)
                    ? <div style={{ paddingBottom: colors.padding * 2, textAlign: "center" }}>
                        <button onClick={() => { this.shareConfirm() }} >
                            <i className="fas fa-check" style={{ color: colors.share, opacity: 0.5, paddingRight: "10px" }} ></i> {this.state.user.username}
                        </button>
                    </div>
                    : <div></div>}
            </div>


            <div>
                {
                    (this.state.sharedusers.length > 0)
                        ? (
                            <div style={{ background: "rgba(0,0,0,0.2)" }}>
                                <div style={{ background: "rgba(0,0,0,0.2)", padding: colors.padding }}><strong>Active shares:</strong></div>
                                <div style={{ padding: colors.padding }}>
                                    {this.state.sharedusers.map((user, i) => {
                                        return <div key={i} style={{ display: "flex", flexDirection: "row" }}>

                                            <div style={{ flex: "1", padding: colors.padding }}>
                                                <NavLink exact to={"/u/" + user.username}>{user.username}</NavLink></div>

                                            <div style={{ flex: "1" }}>
                                                <button
                                                    onClick={() => { this.unshare(user) }}
                                                    style={{ float: "right" }}>
                                                    <i className="fas fa-times" style={{ color: colors.alarm, opacity: 0.5, paddingRight: "10px" }} /> UNSHARE</button>
                                            </div>
                                        </div>
                                    })}
                                </div>
                            </div>
                        )
                        : ""
                }
            </div>


            <div style={{ clear: "both" }} />
        </div>)
    }
}
