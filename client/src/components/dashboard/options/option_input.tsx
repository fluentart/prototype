import React, { Component } from "react";
import { OptionMaster } from "./optionmaster"



export default class OptionsInput extends OptionMaster {
  state = { val: "default1" }

  constructor(props) {
    super(props);

    var value = "default2" // default
    if (props) {
      if (props.option) {
        if (props.option.default != undefined) { value = props.option.default }
        if (props.option.val != undefined) { value = this.props.option.val }
      }
    }

    this.state.val = value;
  }

  onKeyPress = (e) => {
    if (e.key == "Enter") {
      this.apply();
    }
  }

  onChange = (event) => {
    this.setState({ val: event.target.value }, () => {
      this.apply();
    });
  }

  render() {
    return (<div className="widgetMenuItem">

      <div className="row">
        <div className="col-4">
          {this.props.name}:
        </div>
        <div className="col-8">
          <input
            style={{ width: "100%" }}
            type="text"
            value={this.state.val}
            onKeyPress={this.onKeyPress}
            onChange={this.onChange} >
          </input>
        </div>
      </div>
    </div>)
  }
}