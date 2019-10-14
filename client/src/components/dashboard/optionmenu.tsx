import React from "react";
import * as optionsComponents from './options'
import { CorePacket, WidgetType, OptionComponentProps } from "../../../../server/shared/interfaces"
import { colors } from "../../theme";


interface MyState {
    [index: string]: any;
}

interface OptionMenuProps {
    /** array of the possible widgets to choose from */
    options: object[]
    action: Function
    /** currently selected widget type: eg "guage" or "graph" */
    widgettypename: string
    widgettypes: string[]
    widget: WidgetType
    state: CorePacket
}

/** This builds the option menu */
export class OptionMenu extends React.Component<OptionMenuProps, MyState> {
    state = {
        options: []
    };

    action = (optionName) => {
        return (data) => {
            console.log("OptionMenu.action", optionName, data);
            var option = {}
            option[optionName] = data.apply;
            this.props.action({ option })
        }
    }

    render() {
        var options = [];

        if (this.props.options) {
            options = this.props.options;
        }

        if (this.props.widget) {

            if (this.props.widget.options) {
                Object.keys(this.props.widget.options).map((opt, i) => {
                    if (options[opt]) {
                        options[opt].val = this.props.widget.options[opt]
                    }
                })
            }

        }

        return (<div className="widgetMenu" style={{
            position: "absolute",
            zIndex: 100,
            width: "auto",
            minWidth: 250,
            fontSize: 14,
            top: 35,
            background: colors.panels,
            border: colors.borders
        }} >

            <div style={{ display: "flex", flexDirection: "row" }}>
                <div style={{ flex: 1 }}>
                    <button style={{ width: "100%" }} onClick={e => this.props.action({ save: true })}>
                        <i className="fas fa-save"></i> SAVE</button>
                </div>

                <div style={{ flex: 1 }}>
                    <button style={{ width: "100%" }} onClick={e => this.props.action({ remove: true })}>
                        <i className="fas fa-trash-alt"></i> DELETE</button>
                </div>
            </div>

            <div style={{ padding: colors.padding, background: "rgba(0,0,0,0.1)" }}>Change type:
                <select
                    value={this.props.widgettypename}
                    onChange={(e => this.props.action({ type: e.target.value }))}>
                    {this.props.widgettypes.map((widgettype, i) => {
                        return <option key={i}>{widgettype}</option>
                    })}
                </select>
            </div>

            {
                Object.keys(options).map((x, i) => {
                    var OptionToDraw = optionsComponents[options[x].type.toLowerCase()]

                    if (!OptionToDraw) {
                        return <div style={{ padding: colors.padding }}>
                            Error {options[x].type.toLowerCase()}</div>
                    }

                    return <div style={{ padding: colors.padding }} key={i}>
                        <OptionToDraw
                            name={x}
                            option={options[x]}
                            action={this.action(x)} />
                    </div>
                })
            }

        </div >)
    }
}
