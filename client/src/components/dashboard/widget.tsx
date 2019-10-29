import React from "react";
import { CorePacket, WidgetType } from "../../../../server/shared/interfaces";
import * as widgets from './widgets'
import { OptionMenu } from "./optionmenu"
import { objectByString } from "../../../../server/shared/shared"
import { colors } from "../../theme";

interface MyProps {
    widget: WidgetType;
    state: CorePacket;
    action: Function;
    edit: boolean;

}

interface WidgetState {
    showMenu: boolean
}

export class Widget extends React.Component<MyProps, WidgetState> {
    state = {
        showMenu: false,
        designMode: false
    };

    /** pass action up to parent dashboard */
    handleActionMenu = (data) => {

        if (data.save) {
            this.setState({ showMenu: false })
        }

        this.props.action(data);
    }

    render() {
        if (!this.props.widget) { return <div>error</div> }
        if (!this.props.widget.type) { return <div>error1</div> }

        var WidgetToDraw = widgets[this.props.widget.type.toLowerCase()]

        // Obtain OPTIONS from widget class
        var WidgetOptions = []
        if (WidgetToDraw) WidgetOptions = new WidgetToDraw().options()

        var value;
        var valueTimestamp;
        if (this.props.widget.datapath) {
            value = objectByString(this.props.state, this.props.widget.datapath)
            // get the timestamp for the main value for this widget
            if (this.props.state.timestamps) valueTimestamp = objectByString(this.props.state, "timestamps." + this.props.widget.datapath)
        }





        return (<div style={{
            background: "rgba(0,0,0,0.1)",
            height: "100%",
            position: "relative",
            //border: colors.borders,
            boxSizing: "border-box"
        }}

            onDrag={e => { e.preventDefault(); e.stopPropagation(); }} >


            <div style={{
                boxSizing: "border-box",
                padding: "1px",
                overflowY: "auto",
                height: "100%",
                width: "100%"
            }}>
                {(WidgetToDraw != undefined)
                    ? <div style={{ height: "100%" }}><WidgetToDraw
                        widget={this.props.widget}
                        state={this.props.state}
                        value={value}
                        valueTimestamp={valueTimestamp}
                    /></div>
                    : <div>Error {this.props.widget.type.toLowerCase()} widget not found</div>}
            </div>


            {(this.props.edit) &&
                <div style={{
                    boxSizing: "border-box",
                    position: "absolute",
                    width: "100%",
                    top: 0,
                    right: 0,
                    left: 0,
                    background: "rgba(0,0,0,0.3)"
                }}>
                    <div style={{ display: "flex", flexDirection: "row", background: colors.panels }}  >
                        <div className="widgetGrab"
                            style={{
                                flex: "1 auto",
                                cursor: "grab",
                                display: "flex",
                                flexDirection: "row",
                                paddingTop: 7,
                                opacity: 1,
                            }}>
                            {(this.props.widget.datapath) && <div style={{ flex: "1", paddingLeft: 7 }}>{this.props.widget.datapath}</div>}
                            <div style={{ flex: "1", textAlign: "right", opacity: 0.5 }}>{this.props.widget.type}</div>

                        </div>

                        <div style={{}}>
                            <div onClick={() => { this.setState({ showMenu: !this.state.showMenu }) }}
                                style={{
                                    cursor: "pointer",
                                    padding: "7px",
                                    color: (this.state.showMenu) ? "rgba(255, 255, 255, 0.75)" : "rgba(255, 255, 255, 0.5)"
                                }} ><i className="fas fa-wrench"  ></i></div>

                            {(this.state.showMenu) ? <OptionMenu
                                options={WidgetOptions}
                                action={this.handleActionMenu}
                                widgettypename={this.props.widget.type.toLowerCase()}
                                widgettypes={Object.keys(widgets).sort()}
                                widget={this.props.widget}
                                state={this.props.state} /> : <div></div>}
                        </div>
                    </div>
                </div>}

        </div >)
    }
}
