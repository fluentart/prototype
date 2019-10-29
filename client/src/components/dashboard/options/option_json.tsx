import React, { lazy, Suspense } from "react";
import { OptionMaster } from "./optionmaster"

const MonacoEditor = React.lazy(() => import('react-monaco-editor'))

export default class OptionsJSON extends OptionMaster {
  state = { val: {}, editortext: "editortext" }

  constructor(props) {
    super(props);

    var value = "{}" // default
    if (props) {
      if (props.option) {
        if (props.option.default != undefined) {
          value = props.option.default
        }
        if (props.option.val != undefined) {
          if (typeof this.props.option.val == "string") {
            if (this.validjson(this.props.option.val)) {
              value = JSON.parse(this.props.option.val)
            } else {
              value = this.props.option.val
            }

          } else {
            value = this.props.option.val
          }

        }
      }
    }

    this.state.editortext = JSON.stringify(value, null, 2);
    this.state.val = value;
  }

  onKeyPress = (e) => {
    if (e.key == "Enter") {
      this.apply();
    }
  }

  onChange = (newValue: string, e) => {

    //first confirm if it is valid json

    if (this.validjson(newValue)) {
      this.setState({ editortext: newValue, val: JSON.parse(newValue) }, () => {
        this.apply();
      })
    } else {
      this.setState({ editortext: newValue }, () => { });
    }


  }

  editorDidMount() { }

  validjson(datain) {
    try {
      var a = JSON.parse(datain);
      if (a) { return true; } else { return false; }
    } catch (err) {
      return false;
    }
  }

  render() {

    const options: any = {
      selectOnLineNumbers: false,
      minimap: { enabled: false },
      lineNumbers: "off",
      glyphMargin: false,
      folding: false,
      // Undocumented see https://github.com/Microsoft/vscode/issues/30795#issuecomment-410998882
      lineDecorationsWidth: 0,
      lineNumbersMinChars: 0
    };

    return (<div className="widgetMenuItem">

      <div className="row">
        <div className="col-4">
          {this.props.name}:
        </div>
        <div className="col-8">
          JSON EDITOR:

          <Suspense fallback={<div>loading...</div>}>
            <MonacoEditor
              width="400"
              height="600"
              language="json"
              theme="vs-dark"
              value={this.state.editortext}
              options={options}
              onChange={this.onChange}
              editorDidMount={this.editorDidMount}
            /></Suspense>

          {/* 
          <input
            style={{ width: "100%" }}
            type="text"
            value={this.state.val}
            onKeyPress={this.onKeyPress}
            onChange={this.onChange} >
          </input> */}
        </div>
      </div>
    </div>)
  }
}