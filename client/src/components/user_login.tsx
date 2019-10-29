import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";

import "../prototype.scss";

import { api } from "../api";
import { emit } from "cluster";
import { colors } from "../theme";
interface MyProps {
  // getaccount: Function;
  // history: any;
  mode: string
}

interface MyState {
  // [index: string]: any
}

export class UserLogin extends React.Component<MyProps, MyState> {
  state = {
    email: "",
    pass: "",
    message: ""
  };

  onClick = () => {

    this.setState({ message: "attempting login..." });
    this.signin();

  };

  signin = () => {
    api.signin(
      { email: this.state.email, pass: this.state.pass },
      (err, result) => {
        if (err) {
          this.setState({ message: err.err });
          setTimeout(() => {
            this.setState({ message: "" });
          }, 1000);
        }
        if (result) {
          if (result.signedin) {
            //this.props.getaccount();
            //this.props.history.push("/");
            api.location("/");
          }
        }
      }
    );
  };

  onChange = propname => {
    return evt => {
      let tmp = {};
      tmp[propname] = evt.target.value;
      this.setState(tmp);
    };
  };

  onKeyPress = event => {
    if (event.key === "Enter") {
      console.log("enter!");
      this.onClick();
    }
  };

  render() {

    // window.innerWidth < 800
    // force column
    var styles: any = (true) ? {
      wrap: { display: "flex", flexDirection: "column" },
      wrapinputs: { flex: 1, padding: colors.padding * 2 },
      wrapbutton: { flex: 0, padding: colors.padding * 2, textAlign: "right" }
    } : {
        wrap: { display: "flex", flexDirection: "row" },
        wrapinputs: { flex: 1, padding: colors.padding * 2 },
        wrapbutton: { flex: 0, padding: colors.padding * 2 }
      }



    return (
      <div>
        <div style={styles.wrap}>
          <div style={{ flex: 1, padding: colors.padding * 2 }}>
            <input
              name="email"
              placeholder="Email Address"
              type="email"
              style={{ width: "100%", padding: colors.padding }}
              onChange={this.onChange("email")}
              value={this.state.email.toLowerCase()}
            />
          </div>

          <div style={styles.wrapinputs}>
            <input
              name="password"
              placeholder="Password"
              type="password"
              style={{ width: "100%", padding: colors.padding }}
              onChange={this.onChange("pass")}
              value={this.state.pass}
              onKeyPress={this.onKeyPress}
            />
          </div>

          <div style={{ ...colors.p, ...{ paddingLeft: colors.padding * 2, fontSize: "12pt" } }}>
            Forgot your password? You can <a className="dotted" href="/recover">recover your account</a>.</div>

          <div style={styles.wrapbutton}>
            <button style={{
              ...colors.quickShadow,
              ...{
                fontSize: "120%", background: colors.good,
                color: "#fff", fontWeight: "bold"
              }
            }}
              onClick={this.onClick}><i className="fas fa-check" /> {this.props.mode.toUpperCase()}</button>
          </div>
        </div>
        <div>
          <span>{this.state.message}</span>
        </div>
      </div>
    );
  }
}
