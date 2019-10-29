import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";

import "../prototype.scss";

import { api } from "../api";
import { emit } from "cluster";
import { colors } from "../theme";
import { validEmail, passwordSettings, validPassword } from "../../../server/shared/shared";
import { request } from "../utils/requestweb";

interface MyProps {
  // getaccount: Function;
  // history: any;
  //mode: string
}

interface MyState {
  // [index: string]: any
}

export class UserRecoveryForm extends React.Component<MyProps, MyState> {
  state = {
    email: "",
    emailValid: false,
    serverResponse: "",
    message: ""
  };

  recover = () => {
    console.log("attempting to recover account")
    request.post("/api/v4/admin/recover", { json: { email: this.state.email } }, (err, res, response: any) => {
      if (err) console.log(err);
      if (response) {
        console.log(response);
        if (response.result == "notfound") {
          this.setState({ message: response.message });
          return;
        }

        if (response.result == "success") {
          this.setState({ message: response.message });
          return;
        }

      }
    })
  }



  onChange = (propname, value) => {
    var tmp = {};
    tmp[propname] = value;
    this.setState(tmp);
  };



  emailValidation = (input) => {
    this.setState({ emailValid: validEmail(input) });
  }



  render() {

    // window.innerWidth < 800
    // force column
    var styles: any = (true) ? {
      wrap: { display: "flex", flexDirection: "column" },
      wrapinputs: { flex: 1, padding: colors.padding * 2 },
      wrapbutton: { flex: 0, padding: colors.padding * 2, textAlign: "right" }
    } : {
        wrap: { display: "flex", flexDirection: "row" },
        wrapinputs: { flex: 1, padding: colors.padding },
        wrapbutton: { flex: 0, padding: colors.padding }
      }



    return (
      <div>
        <div style={styles.wrap}>

          <div style={{ ...styles.wrapinputs, ...{ display: "flex", flexDirection: "row" } }}>
            <div style={{ flex: 1 }}>
              <input
                name="email"
                placeholder="Email Address"
                type="email"
                style={{ width: "100%", padding: colors.padding }}
                onChange={(e) => {
                  this.emailValidation(e.target.value)
                  this.onChange("email", e.target.value);
                }}
                value={this.state.email.toLowerCase()}
                required
              />
            </div>


            <div style={{ padding: colors.padding, width: 20 }}>
              {(this.state.email.length > 0) && <div>
                {(this.state.emailValid) && <i className="fas fa-check" style={{ color: colors.good }} />}
                {(!this.state.emailValid) && <i className="fas fa-times" style={{ color: colors.alarm }} />}
              </div>
              }
            </div>


          </div>

          <div style={{ padding: colors.padding * 2 }}>
            <span>{this.state.message}</span>
          </div>


          <div style={styles.wrapbutton}>
            {(this.state.emailValid)
              ? <button
                style={{
                  ...colors.quickShadow,
                  ...{
                    fontSize: "120%", background: colors.good,
                    color: "#fff", fontWeight: "bold"
                  }
                }} onClick={() => { this.recover() }}>
                <i className="fas fa-envelope" /> Send Recovery Mail</button>
              : <button
                disabled
                style={{
                  ...colors.quickShadow, ...{
                    cursor: "default",
                    fontSize: "120%", background: colors.panels,
                    color: "rgba(255,255,255,0.1)", fontWeight: "bold"
                  }
                }} > <i className="fas fa-envelope" /> Send Recovery Mail</button>
            }


          </div>

        </div>

      </div>
    );
  }


}
