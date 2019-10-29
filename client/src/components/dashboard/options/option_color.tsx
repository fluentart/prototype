import React, { Component } from "react";
import { OptionMaster } from "./optionmaster"



export default class OptionsColor extends OptionMaster {
  state = { val: "#FFFFFF" }

  constructor(props) {
    super(props);

    var value = "#ff0000" // default
    if (props) {
      if (props.option) {
        if (props.option.default) { value = props.option.default }
        if (props.option.val) { value = this.props.option.val }
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
    return (<div className="widgetMenuItem" style={{ display: "flex", flexDirection: "row" }} >
      <div style={{ padding: "10px 5px 10px 0px" }}>
        {this.props.name}
      </div>
      <input
        style={{
          display: "block", borderTopLeftRadius: 5, borderBottomLeftRadius: 5,
          background: this.state.val, border: 0, height: "35px", padding: 2, margin: 0,
          width: "35px"
        }}
        type="color"
        value={this.state.val}
        // onKeyPress={this.onKeyPress}
        onChange={this.onChange} />

      <input type="text" value={this.state.val} onChange={this.onChange} />
    </div>)
  }
}