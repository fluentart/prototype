import React from "react";
import { theme, colors } from "../../theme"
import { Popup, PopupProps, PopUpState } from "./popup"

import { SearchBox } from "../searchbox"
import { CorePacket } from "../../../../server/shared/interfaces";

/** To manage sharing of device(s) we need to pass in an array of devices. */
interface ConfirmPopupProps extends PopupProps {
    message: string
    onConfirm: Function
}

interface MenuState {

}

/** This component needs to recieve an array of device(s) to allow the user to manage the share/access */
export class PopupConfirm extends Popup<ConfirmPopupProps> {

    state = {
        title: "Delete",
        user: undefined
    }

    render() {
        var size = "large";
        if (window.innerWidth < 800) { size = "small" }


        return this.popuprender(<div style={{ display: "flex", flexDirection: "column" }}>
            <div>{this.props.message}</div>

            <div style={{ paddingTop: 20 }}>

                <button style={{ float: "right" }} onClick={() => { this.props.onConfirm(); }} >
                    <i className="fas fa-check" style={{ color: colors.share, opacity: 0.5, paddingRight: "10px" }} ></i> CONFIRM
                </button>

                <button style={{ float: "right", marginRight: 20 }} onClick={() => { this.close() }} >
                    <i className="fas fa-times" style={{ color: colors.alarm, opacity: 0.5, paddingRight: "10px" }} ></i> CANCEL
                </button>
            </div>

            <div style={{ clear: "both" }} />
        </div>)
    }
}
