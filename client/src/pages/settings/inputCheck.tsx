import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter, Route, Link, NavLink } from 'react-router-dom'
import { api } from "../../api"
import { User } from "../../../../server/shared/interfaces"
import { colors } from "../../theme";
import { AccountTypeBadge } from "../../components/account_type_badge";
import { request } from "../../utils/requestweb";
import { validPassword, passwordSettings } from "../../../../server/shared/shared";


interface MyProps {
    onChange?: Function
    startvalue?: any
    type?: string,
    placeholder?: string,
    validation?: string
    /** if the value should match this string */
    match?: string
}

interface MyState { }

///// TEMP: ASDFasdf1234!@#$

/** allows user to change password in account/settings */
export class InputCheck extends React.Component<MyProps, MyState> {
    state = {
        value: "",
        placeholder: "",
        type: "text",
        loaded: false,
        // used for type: "password"
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
    }

    static getDerivedStateFromProps(props, state) {
        if (state.loaded == false) {
            var value = (props.startvalue) ? props.startvalue : "";
            var type = (props.type) ? props.type : "text";
            var placeholder = (props.placeholder) ? props.placeholder : ""
            return { loaded: true, value, type, placeholder }
        } else {
            return null;
        }

    }

    passwordValidation = (input) => {
        var pw = validPassword(input);
        this.setState({ passwordValid: pw });
    }

    onChange = (e) => {

        if (this.state.type == "password") {
            this.passwordValidation(e.target.value);
        }

        this.setState({ value: e.target.value });
        if (this.props.onChange) { this.props.onChange(e) }
    }

    render() {

        var inputStyle: any = {
            flex: "1",
            background: "rgba(0,0,0,0.2)",
            boxSizing: "border-box",
            padding: colors.padding,
            width: "100%"
        }

        var show = ""

        if (this.state.type == "password") {
            if (this.props.validation == "password") {
                if (this.state.passwordValid.valid) { show = "greencheck"; }
                if ((this.state.value.length > 0) && (!this.state.passwordValid.valid)) { show = "redtimes" }
            }

            if (this.props.match) {
                if (this.state.value == this.props.match) {
                    show = "greencheck"
                } else {
                    show = "redtimes"
                }
            }
        }

        return (
            <div>
                <div style={{ display: "flex", flexDirection: "row" }}>
                    <div style={{ flex: 1 }}><input
                        type={this.state.type}
                        style={inputStyle}
                        placeholder={this.state.placeholder}
                        value={this.state.value}
                        onChange={this.onChange}
                    /></div>

                    <div style={{ padding: colors.padding, width: 20 }}>
                        {(show == "greencheck") && <i className="fas fa-check" style={{ color: colors.good }} />}
                        {(show == "redtimes") && <i className="fas fa-times" style={{ color: colors.alarm }} />}
                    </div>
                </div>

                {((this.props.validation == "password") && (this.state.type == "password") && (this.state.value.length > 0) && (show == "redtimes")) &&
                    <div style={{ padding: colors.padding, color: colors.alarm }}>
                        {(!this.state.passwordValid.capitals)
                            && <div>Add some Capital letters A-Z</div>}
                        {(!this.state.passwordValid.lowercase)
                            && <div>Add some lowercase letters a-z</div>}
                        {(!this.state.passwordValid.numbers)
                            && <div>Add some numbers 0-9</div>}
                        {(!this.state.passwordValid.symbols)
                            && <div>Add some symbols !#$%^*</div>}
                        {(!this.state.passwordValid.noSpace)
                            && <div>May not contain a space " "</div>}
                        {(!this.state.passwordValid.length)
                            && <div>Too short, minimum length is {passwordSettings.minlength}</div>}
                    </div>}

            </div>
        );
    }
}

