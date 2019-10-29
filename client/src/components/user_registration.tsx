import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from "react-router-dom";

import "../prototype.scss";

import { api } from "../api";
import { emit } from "cluster";
import { colors } from "../theme";
import { validEmail, passwordSettings, validPassword } from "../../../server/shared/shared";

interface MyProps {
  // getaccount: Function;
  // history: any;
  mode: string
}

interface MyState {
  // [index: string]: any
}

export class UserRegistration extends React.Component<MyProps, MyState> {
  state = {
    email: "",
    pass: "",
    message: "",
    emailValid: "unset",
    passwordValid: {
      valid: false,
      capitals: false,
      lowercase: false,
      numbers: false,
      symbols: false,
      length: false,
      noSpace: false
    },
    capsLock: false
  };

  register = () => {

    //validate 

    if (!validEmail(this.state.email)) {
      this.setState({ message: "not valid email address" })
      return;
    }

    if (this.state.pass.length < passwordSettings.minlength) {
      this.setState({ message: "password must atleast be " + passwordSettings.minlength + " characters" })
      return;
    }

    if (!validPassword(this.state.pass).valid) {
      this.setState({ message: "password must contain a-z A-Z 0-9" })
      return;
    }

    // if all fine:
    api.register(
      { email: this.state.email, pass: this.state.pass },
      (err, result) => {
        if (err) {
          this.setState({ message: err.err });
          setTimeout(() => {
            this.setState({ message: "attempting login..." });
            this.signin();
          }, 1000);
        }
        if (result) {
          api.location("/");
        }
      }
    );
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

  onChange = (propname, value) => {
    var tmp = {};
    tmp[propname] = value;
    this.setState(tmp);
  };

  onKeyPressDetectEnter = (event) => {
    this.setState({ capsLock: this.isCapslock(event) });

    if (event.key === "Enter") {
      console.log("enter!");
      this.register();
    }
  };

  emailValidation = (input) => {
    if (validEmail(input)) { this.setState({ emailValid: "valid" }); return; }
    if (!validEmail(input)) { this.setState({ emailValid: "invalid" }); return; }
  }

  passwordValidation = (input) => {
    var pw = validPassword(input);
    this.setState({ passwordValid: pw });
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
              {(this.state.emailValid == "valid") && <i className="fas fa-check" style={{ color: colors.good }} />}
              {(this.state.emailValid == "invalid") && <i className="fas fa-times" style={{ color: colors.alarm }} />}
              {(this.state.emailValid == "unset") && <i className="fas fa-check" style={{ color: "rgba(0,0,0,0)" }} />}
            </div>

          </div>

          <div style={{ ...styles.wrapinputs, ...{ display: "flex", flexDirection: "row" } }}>
            <div style={{ flex: 1 }}>
              <input
                name="password"
                placeholder="Password"
                type="password"
                style={{ width: "100%", padding: colors.padding }}
                onChange={(e) => {


                  this.passwordValidation(e.target.value);
                  this.onChange("pass", e.target.value);

                }}
                value={this.state.pass}
                onKeyPress={this.onKeyPressDetectEnter}
                required
              />
            </div>
            <div style={{ padding: colors.padding, width: 20 }}>
              {(this.state.passwordValid.valid) && <i className="fas fa-check" style={{ color: colors.good }} />}
              {((this.state.pass.length > 0) && (!this.state.passwordValid.valid)) &&
                <i className="fas fa-times" style={{ color: colors.alarm }} />}
            </div>
          </div>

          {(this.state.capsLock) && <div style={{ paddingLeft: colors.padding * 2, color: colors.warning }}>
            <i className="fas fa-exclamation-triangle"
            /> Warning!  Your CAPSLOCK is ON!</div>}

          {(this.state.pass.length > 0) && <div style={{ paddingLeft: colors.padding * 2, color: colors.alarm }}>
            {(!this.state.passwordValid.capitals) && <div>Add some Capital letters A-Z</div>}
            {(!this.state.passwordValid.lowercase) && <div>Add some lowercase letters a-z</div>}
            {(!this.state.passwordValid.numbers) && <div>Add some numbers 0-9</div>}
            {(!this.state.passwordValid.symbols) && <div>Add some symbols !#$%^*</div>}
            {(!this.state.passwordValid.noSpace) && <div>May not contain a space " "</div>}
            {(!this.state.passwordValid.length) && <div>Too short, minimum length is {passwordSettings.minlength}</div>}
          </div>}



          <div style={styles.wrapbutton}>
            {((this.state.emailValid) && (this.state.passwordValid.valid))
              ? <button
                style={{
                  ...colors.quickShadow,
                  ...{
                    fontSize: "120%", background: colors.good,
                    color: "#fff", fontWeight: "bold"
                  }
                }} onClick={() => { this.register() }}>
                <i className="fas fa-check" /> Register</button>
              : <button
                style={{
                  ...colors.quickShadow, ...{
                    fontSize: "120%", background: colors.panels,
                    color: "rgba(255,255,255,0.1)", fontWeight: "bold"
                  }
                }} > <i className="fas fa-check" /> Register</button>
            }


          </div>

        </div>
        <div>
          <span>{this.state.message}</span>
        </div>
      </div>
    );
  }

  isCapslock = (e) => {
    e = (e) ? e : window.event;

    var charCode: any = false;
    if (e.which) {
      charCode = e.which;
    } else if (e.keyCode) {
      charCode = e.keyCode;
    }

    var shifton = false;
    if (e.shiftKey) {
      shifton = e.shiftKey;
    } else if (e.modifiers) {
      shifton = !!(e.modifiers & 4);
    }

    if (charCode >= 97 && charCode <= 122 && shifton) {
      return true;
    }

    if (charCode >= 65 && charCode <= 90 && !shifton) {
      return true;
    }

    return false;
  }

}
