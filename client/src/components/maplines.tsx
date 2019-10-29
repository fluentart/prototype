import React from "react";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";
import "../prototype.scss";
import { User, CorePacket } from "../../../server/shared/interfaces";
import { theme, colors } from "../theme";
import { api } from "../api";
import { SearchBox } from "./searchbox";

import { Menu, MenuItems } from "../components/menu"
import { ifValidGps } from "../../../server/shared/shared";

interface Props {
    latLngToPixel?: Function
    style?: any
    //coordsArray: any
    mapState?: { width: number, height: number }
    [index: string]: any;
    statesHistory: CorePacket[][]
}

interface MyState {
}

export class MapLines extends React.Component<Props, MyState> {
    state = {

    };



    render() {

        console.log("mapline", this.props)




        if (!this.props.mapState) return null

        var style = (this.props.style) ? this.props.style : {
            stroke: 'rgba(75,75,75,0.5)',
            strokeWidth: 2
        }


        let lines = []
        ////
        for (var z in this.props.statesHistory) {
            var coordsArray = [];

            if (this.props.statesHistory[z].length >= 2) {
                for (var x = 0; x < (this.props.statesHistory[z].length); x += 1) {

                    var gps = ifValidGps(this.props.statesHistory[z][x]);
                    if (gps) {
                        coordsArray.push(gps)
                    }
                }
            }

            if (coordsArray.length > 1) {
                let pixel = this.props.latLngToPixel(coordsArray[0])

                for (let i = 1; i < coordsArray.length; i++) {
                    let pixel2 = this.props.latLngToPixel(coordsArray[i])
                    lines.push(<line key={z + "" + i} x1={pixel[0]} y1={pixel[1]} x2={pixel2[0]} y2={pixel2[1]} style={style} />)
                    pixel = pixel2
                }
            }
        }
        ////




        return (
            <svg width={this.props.mapState.width} height={this.props.mapState.height} style={{ top: 0, left: 0 }}>
                {lines}
            </svg>
        )
    }

}

