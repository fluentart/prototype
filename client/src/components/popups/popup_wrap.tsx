import React, { Children } from "react";
import { theme, colors } from "../../theme"
import { Popup, PopupProps, PopUpState } from "./popup"

import { SearchBox } from "../searchbox"
import { CorePacket } from "../../../../server/shared/interfaces";

/** To manage sharing of device(s) we need to pass in an array of devices. */
interface PopupWrapProps extends PopupProps {

}

interface MenuState {

}

/** This component needs to recieve an array of device(s) to allow the user to manage the share/access */
export class PopupWrap extends Popup<PopupWrapProps> {

    state = {
        title: "Title",
        user: undefined
    }

    componentDidMount() {
        if (this.props.title) {
            this.setState({ title: this.props.title })
        }
    }


    render() {
        return this.popuprender(<div style={{ display: "flex", flexDirection: "column" }}>
            {this.props.children}
        </div>)
    }
}
