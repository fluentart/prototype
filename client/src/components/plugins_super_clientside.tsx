import React, { Component } from 'react';
import { CorePacket } from '../../../server/shared/interfaces';

/** This is the component all plugins need to import and extend */
export interface PluginProps {
    view?: string;
    state?: CorePacket
}

export interface PluginState {

}

export class PluginSuperClientside extends React.Component<PluginProps, PluginState> {
    state = {}

    render() {
        if (this.props.view) {
            if (this.props.view == "deviceview") {
                return <div>{this.deviceview()}</div>
            }
        }
        return <div>{this.settings()}</div>
    }

    settings() {
        return <div>no settings</div>
    }

    deviceview() {
        return <div>no deviceviewpopup</div>
    }
};

