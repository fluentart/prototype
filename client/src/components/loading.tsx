import React from "react";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";
import "../prototype.scss";
import { User } from "../../../server/shared/interfaces";
import { theme, colors } from "../theme";
import { api } from "../api";
import { SearchBox } from "./searchbox";

import { Menu, MenuItems } from "../components/menu"

interface MyProps { }

interface MyState { }

/** general purpose loading spinner object
 * 
 *  TODO: if this is too long on screen we need to send this as an error report to us
 */
export class Loading extends React.Component<MyProps, MyState> {
    state = {};


    render() {
        return <div style={{
            color: "rgba(255,255,255,0.3)",
            display: "flex",
            flexDirection: "column",
            padding: 0,
            margin: 0,
            height: "100%",
            boxSizing: "border-box",
            background: "rgba(0,0,0,0.3)"
        }}>

            <div style={{ flex: 1, textAlign: "center", position: "relative", width: "100%" }}>
                <div style={{ textAlign: "center", position: "absolute", bottom: 10, width: "100%" }}>
                    <div className="fa-3x">
                        <i className="fas fa-circle-notch fa-spin"></i>
                    </div>
                </div>
            </div>
            <div style={{ flex: 1, textAlign: "center", width: "100%", paddingTop: 0 }}>loading</div>
        </div>


    }
}
