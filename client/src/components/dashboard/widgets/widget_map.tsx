import React, { Component } from 'react';
import { WidgetComponent } from "./widgetcomponent"
import { api } from "../../../api"

import Map from "pigeon-maps";
import Marker from "../../mapmarker";
import { colors } from "../../../theme";
import { ifValidGps } from '../../../../../server/shared/shared';
import { MapLines } from '../../maplines';

export default class WidgetMap extends WidgetComponent {
    state = {
        width: 800,
        height: 400,
        center: [0, 0],
        options: {
            zoom: { type: "input", default: 10, value: undefined }
        },
    }

    wrapper;

    componentDidMount() {
        this.wrapper = React.createRef();
    }


    componentDidUpdate() {
        if (!this.wrapper) { return; }
        if (!this.wrapper.current) { return; }
        console.log("Graph componentDidUpdate")
        //console.log(this.ctx)
        var dimensions = {
            width: this.wrapper.current.offsetWidth,
            height: this.wrapper.current.offsetHeight
        }

        if ((this.state.height != dimensions.height) || (this.state.width != dimensions.width)) {
            this.setState(dimensions, () => {
                //this.drawCanvas() 
            });
        }



        console.log(dimensions);

    }

    updateDimensions = () => {

    };

    wheelHandler = e => {
        console.log(e);
        console.log("mousewheel:" + e.deltaY);
        var zoom =
            e.deltaY < 0
                ? Math.min(this.state.options.zoom.value + 1, 18)
                : Math.max(this.state.options.zoom.value - 1, 1);
        this.setState({ zoom });
    };

    onBoundsChanged = e => {
        //console.log(e);
        this.setState({ center: e.center });
    };

    mouseMove = e => {
        // todo improve zoom location, perhaps using tag locations
        // console.log(e.clientX);
    };

    handleMarkerClick = ({ event, payload, anchor }) => {
        console.log(`Marker #${payload} clicked at: `, anchor);
    };

    render() {
        try {
            var center = [this.props.value.lat, this.props.value.lon]
            return (
                <div style={{ width: "100%", height: "100%", overflow: "hidden" }}
                    onMouseMove={this.mouseMove}
                    onWheel={this.wheelHandler}
                    ref={this.wrapper}
                ><Map
                    onBoundsChanged={this.onBoundsChanged}
                    attribution={false}
                    animate={true}
                    center={center}
                    zoom={parseInt(this.state.options.zoom.value)}
                    width={this.state.width}
                    height={this.state.height} >

                        {/* <Marker device={this.props.state} anchor={center} payload={1}
                            onClick={this.handleMarkerClick}
                        /> */}


                        {api.data.states.map((dev, i) => {
                            if (!ifValidGps(dev)) {
                                return;
                            }

                            return (
                                <Marker
                                    device={dev}
                                    key={i}
                                    anchor={[dev.data.gps.lat, dev.data.gps.lon]}
                                    payload={1}
                                    onClick={this.handleMarkerClick}
                                />
                            );

                        })}

                        <MapLines statesHistory={api.data.statesHistory} />


                    </Map>
                </div>
            );
        } catch (error) {
            console.error(`Invalid map data format. Binding must have "lat" and "lon" properties. Current [${JSON.stringify(this.props.value)}]`)
            return (
                <div style={{ height: "100%", textAlign: "center", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <p>Invalid map data format. Binding must have "lat" and "lon" properties</p>
                </div>
            )
        }

    }
};

