import React, { Component } from 'react';
import { Vector } from "../../../../../server/shared/vector"
import { WidgetComponent } from "./widgetcomponent"
import { colors } from "../../../theme"
import { moment } from '../../../utils/momentalt';

export default class WidgetGauge extends WidgetComponent {
    state = {
        options: {
            min: { type: "input", default: 0, value: undefined },
            max: { type: "input", default: 100, value: undefined },
            color: { type: "color", default: colors.widgetDefault, value: undefined }
        }
    }

    polar_to_cartesian = function (cx, cy, radius, angle) {
        var radians;
        radians = (angle - 90) * Math.PI / 180.0;
        return [Math.round((cx + (radius * Math.cos(radians))) * 100) / 100, Math.round((cy + (radius * Math.sin(radians))) * 100) / 100];
    };

    svg_arc_path = function (x, y, radius, start_angle, end_angle) {
        var center = new Vector({ x, y })
        var start = new Vector({ x: -radius })
        var end = new Vector({ x: -radius })
        start.rotate(new Vector({ z: 1 }), start_angle)
        end.rotate(new Vector({ z: 1 }), end_angle)
        var largeArcFlag = "0"
        if ((end_angle - start_angle) > Math.PI) { largeArcFlag = "1" }
        return "M " + (start.x + center.x).toFixed(3) + " " + (start.y + center.y).toFixed(3) + " A " + radius + " " + radius + " 0 " + largeArcFlag + " 1 " + (end.x + center.x) + " " + (end.y + center.y);
    };

    degrees(degrees) { return ((Math.PI * 2) / 360) * degrees }

    drawguageSvg(min, value, max) {
        if (value > max) { value = max };
        if (value < min) { value = min }
        var range = max - min;
        var valr = value - min;
        var ratio = valr / range;
        var graphdegree = ((180 + 35 + 35) * ratio) - 35
        return (<path
            className="value"
            fill="none"
            stroke={this.state.options.color.value}
            strokeWidth="3"
            d={this.svg_arc_path(50, 50, 40, this.degrees(-35), this.degrees(graphdegree))} />)
    }

    render() {
        var value = 0;
        if (this.props.value) { value = parseFloat(this.props.value) }
        var undermin = (value < this.state.options.min.value) ? true : false
        var overmax = (value > this.state.options.max.value) ? true : false

        var valueTimestamp = (this.props.valueTimestamp) ? this.props.valueTimestamp : undefined

        var datapath = ""

        if (this.props.widget.datapath) {
            if (this.props.widget.datapath.indexOf("data.") == 0) {
                datapath = this.props.widget.datapath.slice(5)
            }
        }

        return (
            <div style={{
                wordBreak: "break-all",
                height: "100%",
                display: "flex",
                flexDirection: "column",
            }}>

                <div style={{
                    flex: "0",
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 0,
                    margin: 0,
                    paddingBottom: colors.padding,
                    display: "flex",
                    flexDirection: "row"
                }}>
                    <div style={{
                        flex: "1",
                        opacity: 0.25,
                        paddingRight: 7, paddingTop: 7,
                        textAlign: "right"
                    }}>{moment(valueTimestamp).fromNow()}</div>
                </div>

                <div style={{
                    padding: 0,
                    margin: 0,
                    overflow: "hidden",
                }}>
                    <div style={{ width: "100%", height: "100%" }}>
                        {(overmax)
                            ? <div style={{ color: colors.warning, fontSize: "80%", position: "absolute" }}><i className="fas fa-exclamation-triangle" /> OVER MAX!</div>
                            : <div></div>}

                        {(undermin)
                            ? <div style={{ color: colors.warning, fontSize: "80%", position: "absolute" }}><i className="fas fa-exclamation-triangle" /> UNDER MIN!</div>
                            : <div></div>}

                        <div style={{
                            overflow: "hidden", height: "100%", textAlign: "center",
                        }}>
                            <svg viewBox="0 5 100 85" style={{ maxHeight: "100%", maxWidth: "100%", margin: "0 auto", padding: 0 }}>
                                <text
                                    x="50"
                                    y="50"
                                    fill="#fff"
                                    className="value-text"
                                    fontSize="100%"
                                    fontWeight="normal"
                                    textAnchor="middle"
                                    alignmentBaseline="middle"
                                    dominantBaseline="central">{value.toFixed(2)}</text>

                                <text x="0" y="80"
                                    fill="#aaa"
                                    className="value-text"
                                    fontSize="40%"
                                    fontWeight="normal"
                                    textAnchor="start"
                                    //alignmentBaseline="top"
                                    dominantBaseline="central">MIN:{Math.round(this.state.options.min.value)}</text>

                                <text x="100" y="80"
                                    fill="#aaa"
                                    className="value-text"
                                    fontSize="40%"
                                    fontWeight="normal"
                                    textAnchor="end"
                                    //alignmentBaseline="top"
                                    dominantBaseline="central">MAX:{Math.round(this.state.options.max.value)}</text>



                                <path className="value" fill="none" stroke="rgba(255,255,255,0.1)"
                                    strokeWidth="3" d={this.svg_arc_path(50, 50, 40, this.degrees(-35), this.degrees(180 + 35))} />
                                {this.drawguageSvg(this.state.options.min.value, value, this.state.options.max.value)}
                            </svg>
                        </div>
                    </div>
                </div>

                <div style={{
                    flex: "0",
                    textAlign: "center",
                    opacity: 1,
                    width: "100%",
                    boxSizing: "border-box",
                    padding: 0,
                    margin: 0,
                    paddingBottom: colors.padding
                }}>{datapath}</div>
            </div>

        );

    }
};

