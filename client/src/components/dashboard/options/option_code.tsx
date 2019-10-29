import React, { lazy, Suspense } from "react";
import { OptionMaster } from "./optionmaster"

const MonacoEditor = React.lazy(() => import('react-monaco-editor'))

export default class OptionsCode extends OptionMaster {
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

  onChange = (newValue, e) => {
    this.setState({ val: newValue }, () => {
      this.apply();
    });
  }

  editorDidMount() { }

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
          CODE EDITOR:

          <Suspense fallback={<div>loading...</div>}>
            <MonacoEditor
              width="400"
              height="600"
              language="json"
              theme="vs-dark"
              value={this.state.val}
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