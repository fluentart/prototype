import React from 'react';
import { CorePacket, WidgetType } from '../../../../../server/shared/interfaces';

export interface WidgetComponentProps {
    /** Settings relevant to this widget */
    widget: WidgetType
    /** This device full state */
    state: CorePacket
    /** Data value if drag and dropped from endpoint */
    value?: any
    /** Timestamp for this specific value */
    valueTimestamp?: Date
}

interface WidgetOption {
    type: string
    default: any
    value?: any
}

interface WidgetOptions {
    [index: string]: WidgetOption;
}

interface State {
    options: WidgetOptions
    [index: string]: any
}
export class WidgetComponent extends React.Component<WidgetComponentProps, State> {

    options() {
        return this.state.options
    }

    static getDerivedStateFromProps(props, state) {
        for (var opt of Object.keys(state.options)) {
            //default
            state.options[opt].value = state.options[opt].default

            //override
            if (props.widget.options) {
                if (props.widget.options[opt]) {
                    //console.log(props.widget.options[opt])
                    state.options[opt].value = props.widget.options[opt]
                }
            }
        }
        return state;
    }
};

