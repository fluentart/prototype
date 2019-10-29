import React, { Component } from "react";
import { colors } from "../../../client/src/theme";

interface Props {
  formSubmit: Function
}

interface State {

}

export class AddRoute extends React.Component<Props, State> {
  state = {
    form: {
      id: "deviceid",
      method: "post"
    },
    message: "", messageOpacity: 0
  };

  changeInput = name => {
    return evt => {
      var form = { ...this.state.form };
      form[name] = evt.target.value;
      this.setState({ form });
    };
  };

  onSubmit = () => {


    if (this.props.formSubmit) {
      this.props.formSubmit(this.state.form, (err, result) => {

        if (err) {
          // console.log(err);
          this.setState({ message: err, messageOpacity: 1.0 })
          setTimeout(() => {
            this.setState({ messageOpacity: 0 })
          }, 1000);
        }


      });
    }

  }

  render() {
    return (
      <div style={{ background: "rgba(0,0,0,0.2)" }}>

        <div style={{ background: "rgba(0,0,0,0.2)", padding: colors.padding }}>
          <h2 style={{ padding: 0, margin: 0 }}>ADD ROUTE FORM</h2>
        </div>

        <div className="row" style={{ padding: colors.padding }}>
          <div className="col-4 alignLeft" style={{}}>
            ID
          </div>
          <div className="col-8" style={{}}>
            <input
              style={{ width: "100%" }}
              placeholder="httpDevice001"
              onChange={this.changeInput("id")}
              autoFocus={true}
            />
          </div>
        </div>

        <div className="row" style={{ padding: colors.padding }}>
          <div className="col-4 alignLeft" style={{}}>
            METHOD
          </div>
          <div className="col-8" style={{}}>
            <select name="method"
              onChange={this.changeInput("method")} >
              <option value="post">POST</option>
              {/* <option value="get">GET</option>
              <option value="put">PUT</option>
              <option value="delete">DELETE</option> */}
            </select>
          </div>
        </div>

        <div style={{ padding: colors.padding }} >
          <div>
            <button style={{}} onClick={this.onSubmit}><i className="fas fa-hdd"></i> ADD</button>
          </div>

          <div>
            {this.state.message}
          </div>
        </div>


      </div>

    );
  }
}