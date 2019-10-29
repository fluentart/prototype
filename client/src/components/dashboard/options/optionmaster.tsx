import React, { Component } from "react";


export interface OptionComponentProps {
    name: string
    option: any
    action: Function
}

interface State {
    val: any
    [index: string]: any;
}

export class OptionMaster extends React.Component<OptionComponentProps, State> {


    apply() {
        this.props.action({ apply: this.state.val })
    }

}