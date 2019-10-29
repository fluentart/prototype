import React from "react";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";
import { theme, colors } from "../theme"
import { clone } from "../utils/lodash_alt"
import { Dropdown } from "./dropdown"
import { TextAlignProperty, StandardLonghandProperties } from "csstype";
import { button } from "./dashboard/widgets";

interface MenuItems {
    /** show only icon on small screens */
    responsive: boolean,
    text: string,
    icon?: string,
    onClick: any,
    link?: string,
    menuitems?: MenuItems[]
    enabled?: boolean
}

interface MenuProps {
    align?: TextAlignProperty,
    active?: string;
    menuitems: MenuItems[],
    fill?: boolean,
    height?: number | string
}

interface MenuState { }


export class Menu2 extends React.Component<MenuProps, MenuState> {
    state = {
        active: 0,
        useLinks: false,
        align: "left"
    }

    // static getDerivedStateFromProps(props, state) {
    //     // ...
    // }

    // componentWillMount = () => {

    //     if (this.props.align) { this.setState({ align: this.props.align }) }

    //     if (this.props.active) {
    //         for (var m in this.props.menuitems) {
    //             if (this.props.menuitems[m].text.toLowerCase().indexOf(this.props.active.toLowerCase()) >= 0) {
    //                 console.log("found active")
    //                 this.setState({ active: m, useLinks: true })
    //                 this.props.menuitems[m].onClick();
    //             }
    //         }
    //     }
    // }

    render() {
        var size = "large";
        if (window.innerWidth < 800) { size = "small" }

        var align: any = this.state.align

        var menustyle = {
            color: colors.spotE,
            background: colors.panels
        }


        var wrapperstyle: any = {
            display: "flex",
            flexDirection: "row"
        }


        var buttonstyle = {
            flex: 1
        }

        return (
            <div style={wrapperstyle}>
                {this.props.menuitems.map((item, i, arr) => {

                    var onClick = (e) => {
                        this.setState({ active: i })
                        item.onClick();
                    }

                    var icon = (item.icon) ? item.icon : "angle-right";


                    if (item.menuitems) {

                        // return <div key={i} ><button key={i} onClick={onClick}>
                        //     <i className={"fa fa-" + icon} ></i> {((size == "small") && (item.responsive)) ? "" : item.text}
                        // </button></div>
                        return <div key={i}><Dropdown text={item.text} items={item.menuitems} /></div>

                    } else {
                        return <div key={i} ><button onClick={onClick}>
                            <i className={"fa fa-" + icon} ></i> {((size == "small") && (item.responsive)) ? "" : item.text}
                        </button></div>

                    }




                })}
            </div >
        )
    }
}
