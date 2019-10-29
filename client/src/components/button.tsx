import React from "react";
import { theme, colors } from "../theme"

interface MenuProps {
    onClick: any
}

interface MenuState { }


export class Button extends React.Component<MenuProps, MenuState> {
    state = {}

    render() {
        return (
            <button style={{
                borderTopRightRadius: "0px",
                width: "40px", height: "40px",
                float: "right",
                textAlign: "center",
                padding: "9px",
                boxSizing: "border-box",
                cursor: "pointer",
                fontSize: "20px"
            }} onClick={this.props.onClick} ><i className="fas fa-times"></i></button>
        )
    }
}
