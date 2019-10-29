import React from "react";
import { theme, colors } from "../../theme"

import { Button } from "../button"

export interface PopupProps {
    title?: string
    onClose?: Function
}

export interface PopUpState {
    title: string;
}



export class Popup<T extends PopupProps> extends React.Component<T, {}> {
    state = {
        title: "default"
    }

    close() {
        if (this.props.onClose) { this.props.onClose() }
    }

    popuprender(children) {
        var size = "large";
        if (window.innerWidth < 800) { size = "small" }

        /** wrapper div styling depending for mobile or desktop */
        var popupwrapstyle: any = (window.innerWidth < 800)
            ? {
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                zIndex: 1000,
                background: "#f00",
            } : {
                position: "absolute",
                top: 0, left: 0, right: 0, bottom: 0,
                background: colors.backgroundPopup,
                paddingTop: "100px",
                zIndex: 1000
            }

        /** popup div styling depending for mobile or desktop */
        var popupmainstyle: any = (window.innerWidth < 800) ? {
            background: colors.panels,
            padding: 0, width: "100%", margin: "0 auto",
            height: "100%"
            //border: "2px solid rgba(0,0,0,0.1)"
        } : {
                boxShadow: "0px 0px 25px 0px rgba(0,0,0,0.5)",
                background: colors.panels,
                padding: 0, width: "500px", margin: "0 auto",
                //border: "2px solid rgba(0,0,0,0.1)"
            }

        return (
            <div style={popupwrapstyle}>
                <div style={popupmainstyle}>

                    <div style={{
                        background: "rgba(0,0,0,0.1)",
                        display: "flex", flexDirection: "row"
                    }}>
                        <div style={{ flex: "1", paddingTop: colors.padding, textAlign: "center" }}>{this.state.title}</div>

                        <div style={{ flex: "0" }}><Button onClick={() => { this.close() }} /></div>
                        {/* <div style={{
                            width: "38px", height: "38px",
                            background: colors.alarm,
                            float: "right",
                            textAlign: "center",
                            paddingTop: "10px",
                            boxSizing: "border-box"
                        }}><i className="fas fa-times"></i></div> */}


                    </div>
                    <div style={{ height: "100%", padding: 0 }}>
                        {children}
                    </div>

                </div>
            </div >
        )
    }
}
